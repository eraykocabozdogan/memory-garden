import { getDatabase } from "@/db";
import { profiles } from "@/db/schema";
import { requireMember } from "@/features/auth/member";
import { DiaryApp } from "@/features/diary/diary-app";
import { getDiaryEntries, getDiaryGardenFlowers } from "@/features/diary/diary-repository";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const memberId = await requireMember();
  const now = new Date();
  const [entries, gardenFlowers, [profile]] = await Promise.all([
    getDiaryEntries(memberId, now),
    getDiaryGardenFlowers(memberId),
    getDatabase()
      .select({ displayName: profiles.displayName })
      .from(profiles)
      .where(eq(profiles.id, memberId))
      .limit(1),
  ]);

  return (
    <DiaryApp
      initialEntries={entries}
      initialGardenFlowers={gardenFlowers}
      memberName={profile?.displayName ?? "Üye"}
      initialNow={now.toISOString()}
    />
  );
}
