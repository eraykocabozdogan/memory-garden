import "server-only";

import { and, asc, desc, eq, gt, gte, or } from "drizzle-orm";

import { getDatabase } from "@/db";
import { diaryEntries, diaryFlowerResponses, profiles } from "@/db/schema";
import { DIARY_GARDEN_START_AT } from "./garden-layout";
import { isDiaryEntryActive } from "./diary-policy";
import type { DiaryEntry, DiaryGardenFlower } from "./types";

export async function getDiaryEntries(viewerId: string, now = new Date()) {
  const rows = await getDatabase()
    .select({
      id: diaryEntries.id,
      authorId: diaryEntries.authorId,
      authorName: profiles.displayName,
      content: diaryEntries.content,
      publishedAt: diaryEntries.publishedAt,
      expiresAt: diaryEntries.expiresAt,
      updatedAt: diaryEntries.updatedAt,
      flowerId: diaryFlowerResponses.flowerId,
      responderId: diaryFlowerResponses.responderId,
      flowerCreatedAt: diaryFlowerResponses.createdAt,
      flowerUpdatedAt: diaryFlowerResponses.updatedAt,
    })
    .from(diaryEntries)
    .innerJoin(profiles, eq(diaryEntries.authorId, profiles.id))
    .leftJoin(diaryFlowerResponses, eq(diaryEntries.id, diaryFlowerResponses.entryId))
    .where(or(eq(diaryEntries.authorId, viewerId), gt(diaryEntries.expiresAt, now)))
    .orderBy(desc(diaryEntries.publishedAt));

  return rows.map((row): DiaryEntry => ({
    id: row.id,
    authorId: row.authorId,
    authorName: row.authorName,
    content: row.content,
    publishedAt: row.publishedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    isOwn: row.authorId === viewerId,
    isActive: isDiaryEntryActive(row.expiresAt, now),
    flowerResponse:
      row.flowerId && row.responderId && row.flowerCreatedAt && row.flowerUpdatedAt
        ? {
            flowerId: row.flowerId,
            responderId: row.responderId,
            createdAt: row.flowerCreatedAt.toISOString(),
            updatedAt: row.flowerUpdatedAt.toISOString(),
          }
        : undefined,
  }));
}

export async function getDiaryGardenFlowers(
  viewerId: string,
  startAt = DIARY_GARDEN_START_AT,
) {
  const rows = await getDatabase()
    .select({
      entryId: diaryFlowerResponses.entryId,
      flowerId: diaryFlowerResponses.flowerId,
      plantedAt: diaryFlowerResponses.createdAt,
    })
    .from(diaryFlowerResponses)
    .innerJoin(diaryEntries, eq(diaryFlowerResponses.entryId, diaryEntries.id))
    .where(and(
      gte(diaryFlowerResponses.createdAt, startAt),
      or(
        eq(diaryFlowerResponses.responderId, viewerId),
        eq(diaryEntries.authorId, viewerId),
      ),
    ))
    .orderBy(asc(diaryFlowerResponses.createdAt));

  return rows.map((row): DiaryGardenFlower => ({
    entryId: row.entryId,
    flowerId: row.flowerId,
    plantedAt: row.plantedAt.toISOString(),
  }));
}

export async function createDiaryEntry(authorId: string, content: string) {
  const [entry] = await getDatabase()
    .insert(diaryEntries)
    .values({ authorId, content })
    .returning({ id: diaryEntries.id });
  return entry;
}

export type DiaryMutationResult = "updated" | "deleted" | "not_found" | "forbidden" | "expired";

export async function updateDiaryEntry(
  entryId: string,
  authorId: string,
  content: string,
): Promise<DiaryMutationResult> {
  return getDatabase().transaction(async (transaction) => {
    const [entry] = await transaction
      .select({ authorId: diaryEntries.authorId, expiresAt: diaryEntries.expiresAt })
      .from(diaryEntries)
      .where(eq(diaryEntries.id, entryId))
      .limit(1)
      .for("update");

    if (!entry) return "not_found";
    if (entry.authorId !== authorId) return "forbidden";
    if (!isDiaryEntryActive(entry.expiresAt, new Date())) return "expired";

    await transaction
      .update(diaryEntries)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(diaryEntries.id, entryId), eq(diaryEntries.authorId, authorId)));
    return "updated";
  });
}

export async function deleteDiaryEntry(
  entryId: string,
  authorId: string,
): Promise<DiaryMutationResult> {
  return getDatabase().transaction(async (transaction) => {
    const [entry] = await transaction
      .select({ authorId: diaryEntries.authorId, expiresAt: diaryEntries.expiresAt })
      .from(diaryEntries)
      .where(eq(diaryEntries.id, entryId))
      .limit(1)
      .for("update");

    if (!entry) return "not_found";
    if (entry.authorId !== authorId) return "forbidden";
    if (!isDiaryEntryActive(entry.expiresAt, new Date())) return "expired";

    await transaction.delete(diaryEntries).where(eq(diaryEntries.id, entryId));
    return "deleted";
  });
}

export type DiaryFlowerResult = "saved" | "not_found" | "own_entry" | "expired" | "forbidden";

export async function saveDiaryFlowerResponse(
  entryId: string,
  responderId: string,
  flowerId: string,
): Promise<DiaryFlowerResult> {
  return getDatabase().transaction(async (transaction) => {
    const [entry] = await transaction
      .select({ authorId: diaryEntries.authorId, expiresAt: diaryEntries.expiresAt })
      .from(diaryEntries)
      .where(eq(diaryEntries.id, entryId))
      .limit(1)
      .for("update");

    if (!entry) return "not_found";
    if (entry.authorId === responderId) return "own_entry";
    if (!isDiaryEntryActive(entry.expiresAt, new Date())) return "expired";

    const [existing] = await transaction
      .select({ responderId: diaryFlowerResponses.responderId })
      .from(diaryFlowerResponses)
      .where(eq(diaryFlowerResponses.entryId, entryId))
      .limit(1)
      .for("update");
    if (existing && existing.responderId !== responderId) return "forbidden";

    await transaction
      .insert(diaryFlowerResponses)
      .values({ entryId, responderId, flowerId })
      .onConflictDoUpdate({
        target: diaryFlowerResponses.entryId,
        set: { flowerId, updatedAt: new Date() },
      });
    return "saved";
  });
}
