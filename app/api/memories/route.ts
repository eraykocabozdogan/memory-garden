import { randomUUID } from "node:crypto";

import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, isNull, max, sql } from "drizzle-orm";

import { getDatabase } from "@/db";
import { mediaAssets, memoryDayLocations, memoryDays, memoryItems } from "@/db/schema";
import { getCurrentMemberId } from "@/features/auth/member";
import { parseMemoryLocationSelections } from "@/features/locations/memory-location-selection";
import {
  MAX_CONCURRENT_MEMORY_UPLOADS,
  MAX_MEMORY_BATCH_BYTES,
  MAX_MEMORY_BATCH_ITEMS,
} from "@/features/memories/batch-limits";
import { parseMemoryDate } from "@/features/memories/date-value";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { dispatchMediaProcessing } from "@/lib/media-processing/dispatch";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";
import { verifyUploadToken, type UploadTokenPayload } from "@/lib/r2/upload-token";

export const runtime = "nodejs";

type PreparedItem = {
  id: string;
  kind: "text" | "photo" | "video";
  textContent: string | null;
  upload: UploadTokenPayload | null;
  processingRunId: string | null;
};

function postgresErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

function prepareItems(value: unknown, userId: string): PreparedItem[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MEMORY_BATCH_ITEMS) {
    return null;
  }

  const objectKeys = new Set<string>();
  let totalBytes = 0;
  const items: PreparedItem[] = [];

  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
    const body = candidate as Record<string, unknown>;
    const kind = body.kind;
    if (kind !== "text" && kind !== "photo" && kind !== "video") return null;

    if (kind === "text") {
      const textContent = typeof body.textContent === "string" ? body.textContent.trim() : "";
      if (!textContent || body.uploadToken !== undefined) return null;
      items.push({
        id: randomUUID(),
        kind,
        textContent,
        upload: null,
        processingRunId: null,
      });
      continue;
    }

    if (body.textContent !== undefined || typeof body.uploadToken !== "string") return null;
    const upload = verifyUploadToken(body.uploadToken);
    if (!upload || upload.userId !== userId || upload.kind !== kind) return null;
    if (objectKeys.has(upload.objectKey)) return null;

    objectKeys.add(upload.objectKey);
    totalBytes += upload.fileSizeBytes;
    if (totalBytes > MAX_MEMORY_BATCH_BYTES) return null;
    items.push({
      id: randomUUID(),
      kind,
      textContent: null,
      upload,
      processingRunId: randomUUID(),
    });
  }

  return items;
}

async function validateUploadedObjects(items: PreparedItem[]) {
  const bucket = getR2Config().bucketName;
  await Promise.all(
    items.flatMap((item) => {
      const upload = item.upload;
      if (!upload) return [];
      return [
        getR2Client()
          .send(new HeadObjectCommand({ Bucket: bucket, Key: upload.objectKey }))
          .then((head) => {
            if (
              head.ContentLength !== upload.fileSizeBytes ||
              head.ContentType?.toLowerCase() !== upload.mimeType
            ) {
              throw new Error("Uploaded object metadata mismatch.");
            }
          }),
      ];
    }),
  );
}

async function dispatchPreparedMedia(items: PreparedItem[]) {
  const media = items.filter(
    (item): item is PreparedItem & { processingRunId: string } =>
      item.processingRunId !== null,
  );
  const statuses = new Map<string, "processing" | "failed">();
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < media.length) {
      const item = media[nextIndex];
      nextIndex += 1;
      try {
        await dispatchMediaProcessing(item.id, item.processingRunId);
        statuses.set(item.id, "processing");
      } catch {
        statuses.set(item.id, "failed");
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(MAX_CONCURRENT_MEMORY_UPLOADS, media.length) },
      () => worker(),
    ),
  );
  return statuses;
}

export async function POST(request: Request) {
  const userId = await getCurrentMemberId();
  if (!userId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  if (!body) return jsonError("Geçersiz istek.", 400);

  const parsedDate = parseMemoryDate(body.datePrecision, body.date);
  if (!parsedDate) return jsonError("Tarih bilgisi geçersiz.", 400);
  const locations = parseMemoryLocationSelections(
    body.locations,
    parsedDate.precision === "day",
  );
  if (!locations) return jsonError("Konum bilgisi geçersiz.", 400);

  const items = prepareItems(body.items, userId);
  if (!items) {
    return jsonError(
      `Paket 1-${MAX_MEMORY_BATCH_ITEMS} geçerli öğe ve en fazla 5 GB medya içermeli.`,
      400,
    );
  }

  try {
    await validateUploadedObjects(items);
  } catch {
    return jsonError("Yüklenen dosyalardan biri bulunamadı veya doğrulanamadı.", 409);
  }

  try {
    const sortBucket = [
      "memory-sort",
      parsedDate.precision,
      parsedDate.dayDate ?? parsedDate.year ?? "none",
      parsedDate.month ?? "none",
    ].join(":");
    await getDatabase().transaction(async (transaction) => {
      await transaction.execute(sql`select pg_advisory_xact_lock(hashtext(${sortBucket}))`);
      let memoryDayId: string | null = null;

      if (parsedDate.dayDate) {
        const [day] = await transaction
          .insert(memoryDays)
          .values({ memoryDate: parsedDate.dayDate, createdBy: userId })
          .onConflictDoUpdate({
            target: memoryDays.memoryDate,
            set: { updatedAt: new Date() },
          })
          .returning({ id: memoryDays.id });
        memoryDayId = day.id;

        await transaction
          .delete(memoryDayLocations)
          .where(eq(memoryDayLocations.memoryDayId, memoryDayId));
        if (locations.length > 0) {
          await transaction.insert(memoryDayLocations).values(
            locations.map((location, index) => ({
              memoryDayId: day.id,
              provinceCode: location.provinceCode,
              provinceName: location.provinceName,
              districtCode: location.districtCode,
              districtName: location.districtName,
              longitude: location.longitude,
              latitude: location.latitude,
              sortOrder: index,
            })),
          );
        }
      }

      const sortConditions = memoryDayId
        ? [eq(memoryItems.memoryDayId, memoryDayId)]
        : [
            eq(memoryItems.datePrecision, parsedDate.precision),
            parsedDate.year === null
              ? isNull(memoryItems.memoryYear)
              : eq(memoryItems.memoryYear, parsedDate.year),
            parsedDate.month === null
              ? isNull(memoryItems.memoryMonth)
              : eq(memoryItems.memoryMonth, parsedDate.month),
          ];
      const [lastItem] = await transaction
        .select({ sortOrder: max(memoryItems.sortOrder) })
        .from(memoryItems)
        .where(and(...sortConditions));
      const firstSortOrder = (lastItem.sortOrder ?? -1) + 1;

      await transaction.insert(memoryItems).values(
        items.map((item, index) => ({
          id: item.id,
          kind: item.kind,
          datePrecision: parsedDate.precision,
          memoryDayId,
          memoryYear: parsedDate.year,
          memoryMonth: parsedDate.month,
          textContent: item.textContent,
          sortOrder: firstSortOrder + index,
          createdBy: userId,
        })),
      );

      const uploadedItems = items.filter(
        (item): item is PreparedItem & { upload: UploadTokenPayload; processingRunId: string } =>
          item.upload !== null && item.processingRunId !== null,
      );
      if (uploadedItems.length > 0) {
        await transaction.insert(mediaAssets).values(
          uploadedItems.map((item) => ({
            memoryItemId: item.id,
            sourceObjectKey: item.upload.objectKey,
            originalFileName: item.upload.originalFileName,
            sourceMimeType: item.upload.mimeType,
            sourceSizeBytes: item.upload.fileSizeBytes,
            processingRunId: item.processingRunId,
          })),
        );
      }
    });

    const statuses = await dispatchPreparedMedia(items);
    return Response.json(
      {
        items: items.map((item) => ({
          id: item.id,
          processingStatus: statuses.get(item.id),
        })),
      },
      { status: 201 },
    );
  } catch (error) {
    if (postgresErrorCode(error) === "23505") {
      return jsonError("Yüklenen dosyalardan biri daha önce bir anıya eklendi.", 409);
    }
    throw error;
  }
}
