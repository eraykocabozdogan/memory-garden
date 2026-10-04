import { diaryExpiresAt } from "@/features/diary/diary-policy";
import { DiaryApp } from "@/features/diary/diary-app";
import type { DiaryEntry } from "@/features/diary/types";

export const dynamic = "force-dynamic";

export default function DiaryPrototypePage() {
  const now = new Date();
  const partnerPublishedAt = new Date(now.getTime() - 45 * 60 * 1000);
  const ownPublishedAt = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const expiredPublishedAt = new Date(now.getTime() - 30 * 60 * 60 * 1000);
  const entries: DiaryEntry[] = [
    {
      id: "partner-today",
      authorId: "partner",
      authorName: "Deniz",
      content: "Bugün biraz yoruldum ama akşam gökyüzünün rengi içimi rahatlattı.",
      publishedAt: partnerPublishedAt.toISOString(),
      expiresAt: diaryExpiresAt(partnerPublishedAt).toISOString(),
      updatedAt: partnerPublishedAt.toISOString(),
      isOwn: false,
      isActive: true,
    },
    {
      id: "own-active",
      authorId: "member",
      authorName: "Ada",
      content: "Sabah ilk kahvemi içerken seni düşündüm.",
      publishedAt: ownPublishedAt.toISOString(),
      expiresAt: diaryExpiresAt(ownPublishedAt).toISOString(),
      updatedAt: ownPublishedAt.toISOString(),
      isOwn: true,
      isActive: true,
      flowerResponse: {
        flowerId: "convallaria-majalis",
        responderId: "partner",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    },
    {
      id: "own-expired",
      authorId: "member",
      authorName: "Ada",
      content: "Dün gece uyumadan önce yazdığım birkaç satır.",
      publishedAt: expiredPublishedAt.toISOString(),
      expiresAt: diaryExpiresAt(expiredPublishedAt).toISOString(),
      updatedAt: expiredPublishedAt.toISOString(),
      isOwn: true,
      isActive: false,
    },
  ];

  return (
    <DiaryApp
      initialEntries={entries}
      memberName="Ada"
      memberNames={["Ada", "Deniz"]}
      initialNow={now.toISOString()}
      flowerResponsePersistence="local"
    />
  );
}
