import { getMemberNames, requireMember } from "@/features/auth/member";
import { DiaryApp } from "@/features/diary/diary-app";
import { getDiaryEntries, getDiaryGardenFlowers } from "@/features/diary/diary-repository";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const memberId = await requireMember();
  const now = new Date();
  const [entries, gardenFlowers, names] = await Promise.all([
    getDiaryEntries(memberId, now),
    getDiaryGardenFlowers(memberId),
    getMemberNames(memberId),
  ]);

  return (
    <DiaryApp
      initialEntries={entries}
      initialGardenFlowers={gardenFlowers}
      memberName={names.memberName}
      memberNames={names.memberNames}
      initialNow={now.toISOString()}
    />
  );
}
