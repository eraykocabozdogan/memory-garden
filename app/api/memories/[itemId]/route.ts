import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { and, eq, isNull, max, sql } from "drizzle-orm";

import { getDatabase } from "@/db";
import {
  mediaAssets,
  memoryDays,
  memoryItems,
} from "@/db/schema";
import { getCurrentMemberId } from "@/features/auth/member";
import { parseMemoryUpdateInput } from "@/features/memories/memory-update-input";
import { jsonError, readJsonObject } from "@/lib/http/json";
import { mediaOutputKeys } from "@/lib/media-processing/object-keys";
import { getR2Client } from "@/lib/r2/client";
import { getR2Config } from "@/lib/r2/config";

export const runtime = "nodejs";

function sortBucket(
  precision: "none" | "year" | "month" | "day",
  dayDate: string | null,
  year: number | null,
  month: number | null,
) {
  return ["memory-sort", precision, dayDate ?? year ?? "none", month ?? "none"].join(":");
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/memories/[itemId]">,
) {
  const userId = await getCurrentMemberId();
  if (!userId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  if (!body) return jsonError("Geçersiz istek.", 400);
  const update = parseMemoryUpdateInput(body);
  if (!update) return jsonError("Anı bilgileri geçersiz.", 400);

  const { itemId } = await context.params;
  const result = await getDatabase().transaction(async (transaction) => {
    const [item] = await transaction
      .select({
        id: memoryItems.id,
        kind: memoryItems.kind,
        datePrecision: memoryItems.datePrecision,
        memoryDayId: memoryItems.memoryDayId,
        dayDate: memoryDays.memoryDate,
        memoryYear: memoryItems.memoryYear,
        memoryMonth: memoryItems.memoryMonth,
        sortOrder: memoryItems.sortOrder,
      })
      .from(memoryItems)
      .leftJoin(memoryDays, eq(memoryItems.memoryDayId, memoryDays.id))
      .where(eq(memoryItems.id, itemId))
      .limit(1)
      .for("update", { of: memoryItems });

    if (!item) return "not_found" as const;
    if (
      (item.kind === "text" && update.textContent === undefined) ||
      (item.kind !== "text" && update.textContent !== undefined)
    ) {
      return "invalid_content" as const;
    }

    const sourceBucket = sortBucket(
      item.datePrecision,
      item.dayDate,
      item.memoryYear,
      item.memoryMonth,
    );
    const destinationBucket = sortBucket(
      update.date.precision,
      update.date.dayDate,
      update.date.year,
      update.date.month,
    );
    for (const bucket of Array.from(new Set([sourceBucket, destinationBucket])).sort()) {
      await transaction.execute(sql`select pg_advisory_xact_lock(hashtext(${bucket}))`);
    }

    let destinationDayId: string | null = null;
    if (update.date.dayDate) {
      const [day] = await transaction
        .insert(memoryDays)
        .values({ memoryDate: update.date.dayDate, createdBy: userId })
        .onConflictDoUpdate({
          target: memoryDays.memoryDate,
          set: { updatedAt: new Date() },
        })
        .returning({ id: memoryDays.id });
      const dayId = day.id;
      destinationDayId = dayId;
    }

    let nextSortOrder = item.sortOrder;
    if (sourceBucket !== destinationBucket) {
      const sortConditions = destinationDayId
        ? [eq(memoryItems.memoryDayId, destinationDayId)]
        : [
            eq(memoryItems.datePrecision, update.date.precision),
            update.date.year === null
              ? isNull(memoryItems.memoryYear)
              : eq(memoryItems.memoryYear, update.date.year),
            update.date.month === null
              ? isNull(memoryItems.memoryMonth)
              : eq(memoryItems.memoryMonth, update.date.month),
          ];
      const [lastItem] = await transaction
        .select({ sortOrder: max(memoryItems.sortOrder) })
        .from(memoryItems)
        .where(and(...sortConditions));
      nextSortOrder = (lastItem.sortOrder ?? -1) + 1;
    }

    await transaction
      .update(memoryItems)
      .set({
        datePrecision: update.date.precision,
        memoryDayId: destinationDayId,
        memoryYear: update.date.year,
        memoryMonth: update.date.month,
        textContent: item.kind === "text" ? update.textContent : null,
        sortOrder: nextSortOrder,
        updatedAt: new Date(),
      })
      .where(eq(memoryItems.id, item.id));

    if (item.memoryDayId && item.memoryDayId !== destinationDayId) {
      await transaction.execute(sql`
        delete from ${memoryDays}
        where ${memoryDays.id} = ${item.memoryDayId}
          and not exists (
            select 1
            from ${memoryItems}
            where ${memoryItems.memoryDayId} = ${item.memoryDayId}
          )
      `);
    }

    return "updated" as const;
  });

  if (result === "not_found") return jsonError("Anı bulunamadı.", 404);
  if (result === "invalid_content") return jsonError("Anı içeriği geçersiz.", 400);
  return new Response(null, { status: 204 });
}

export async function DELETE(
  _: Request,
  context: RouteContext<"/api/memories/[itemId]">,
) {
  if (!(await getCurrentMemberId())) return jsonError("Oturum gerekli.", 401);
  const { itemId } = await context.params;

  const [item] = await getDatabase()
    .select({
      id: memoryItems.id,
      kind: memoryItems.kind,
      memoryDayId: memoryItems.memoryDayId,
      mediaStatus: mediaAssets.status,
      processingRunId: mediaAssets.processingRunId,
      sourceObjectKey: mediaAssets.sourceObjectKey,
      displayObjectKey: mediaAssets.displayObjectKey,
      previewObjectKey: mediaAssets.previewObjectKey,
    })
    .from(memoryItems)
    .leftJoin(mediaAssets, eq(memoryItems.id, mediaAssets.memoryItemId))
    .where(eq(memoryItems.id, itemId))
    .limit(1);

  if (!item) return jsonError("Anı bulunamadı.", 404);
  if (item.mediaStatus === "processing") {
    return jsonError("Medya işlenirken silinemez. İşlem tamamlandığında yeniden dene.", 409);
  }

  if (item.kind !== "text" && item.processingRunId && item.sourceObjectKey) {
    const derivedKeys = mediaOutputKeys(item.id, item.processingRunId, item.kind);
    const objectKeys = Array.from(
      new Set(
        [
          item.sourceObjectKey,
          item.displayObjectKey,
          item.previewObjectKey,
          derivedKeys.displayObjectKey,
          derivedKeys.previewObjectKey,
        ].filter((key): key is string => Boolean(key)),
      ),
    );

    const deletion = await getR2Client().send(
      new DeleteObjectsCommand({
        Bucket: getR2Config().bucketName,
        Delete: { Objects: objectKeys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    if (deletion.Errors?.length) throw new Error("R2 object deletion failed.");
  }

  await getDatabase().transaction(async (transaction) => {
    const [deleted] = await transaction
      .delete(memoryItems)
      .where(eq(memoryItems.id, item.id))
      .returning({ id: memoryItems.id });

    if (!deleted) return;
    if (item.memoryDayId) {
      await transaction.execute(sql`
        delete from ${memoryDays}
        where ${memoryDays.id} = ${item.memoryDayId}
          and not exists (
            select 1
            from ${memoryItems}
            where ${memoryItems.memoryDayId} = ${item.memoryDayId}
          )
      `);
    }
  });

  return new Response(null, { status: 204 });
}
