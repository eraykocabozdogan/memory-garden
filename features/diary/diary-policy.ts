export const DIARY_LIFETIME_MS = 24 * 60 * 60 * 1000;

type DiaryPolicyInput = {
  authorId: string;
  viewerId: string;
  expiresAt: string | Date;
  now: string | Date;
};

function timestamp(value: string | Date) {
  return typeof value === "string" ? Date.parse(value) : value.getTime();
}

export function isDiaryEntryActive(expiresAt: string | Date, now: string | Date) {
  return timestamp(now) < timestamp(expiresAt);
}

export function canViewDiaryEntry({ authorId, viewerId, expiresAt, now }: DiaryPolicyInput) {
  return authorId === viewerId || isDiaryEntryActive(expiresAt, now);
}

export function canEditDiaryEntry({ authorId, viewerId, expiresAt, now }: DiaryPolicyInput) {
  return authorId === viewerId && isDiaryEntryActive(expiresAt, now);
}

export function canRespondToDiaryEntry({ authorId, viewerId, expiresAt, now }: DiaryPolicyInput) {
  return authorId !== viewerId && isDiaryEntryActive(expiresAt, now);
}

export function diaryExpiresAt(publishedAt: string | Date) {
  return new Date(timestamp(publishedAt) + DIARY_LIFETIME_MS);
}

export function formatDiaryTimeRemaining(expiresAt: string | Date, now: string | Date) {
  const remainingMs = Math.max(0, timestamp(expiresAt) - timestamp(now));
  if (remainingMs === 0) return "Süresi doldu";

  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  if (hours === 0) return `${minutes} dk kaldı`;
  if (minutes === 0 || minutes === 60) return `${hours + (minutes === 60 ? 1 : 0)} sa kaldı`;
  return `${hours} sa ${minutes} dk kaldı`;
}
