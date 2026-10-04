import { expect, test } from "@playwright/test";

import {
  canEditDiaryEntry,
  canRespondToDiaryEntry,
  canViewDiaryEntry,
  diaryExpiresAt,
  DIARY_LIFETIME_MS,
} from "../../features/diary/diary-policy";

const publishedAt = new Date("2026-08-30T12:00:00.000Z");
const expiresAt = diaryExpiresAt(publishedAt);

test("a diary entry has an exact rolling 24-hour lifetime", () => {
  expect(expiresAt.getTime() - publishedAt.getTime()).toBe(DIARY_LIFETIME_MS);
  expect(
    canViewDiaryEntry({
      authorId: "author",
      viewerId: "partner",
      expiresAt,
      now: new Date(expiresAt.getTime() - 1),
    }),
  ).toBe(true);
  expect(
    canViewDiaryEntry({
      authorId: "author",
      viewerId: "partner",
      expiresAt,
      now: expiresAt,
    }),
  ).toBe(false);
});

test("the author keeps expired entries but cannot edit them", () => {
  const input = {
    authorId: "author",
    viewerId: "author",
    expiresAt,
    now: new Date(expiresAt.getTime() + 1),
  };
  expect(canViewDiaryEntry(input)).toBe(true);
  expect(canEditDiaryEntry(input)).toBe(false);
});

test("only the partner can respond and only before expiry", () => {
  const activeNow = new Date(expiresAt.getTime() - 1);
  expect(
    canRespondToDiaryEntry({ authorId: "author", viewerId: "partner", expiresAt, now: activeNow }),
  ).toBe(true);
  expect(
    canRespondToDiaryEntry({ authorId: "author", viewerId: "author", expiresAt, now: activeNow }),
  ).toBe(false);
  expect(
    canRespondToDiaryEntry({ authorId: "author", viewerId: "partner", expiresAt, now: expiresAt }),
  ).toBe(false);
});
