import { getMemberNames, requireMember } from "@/features/auth/member";
import { MemoriesApp } from "@/features/memories/memories-app";
import { getMemoryArchive } from "@/features/memories/memory-repository";

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  const memberId = await requireMember();
  const [archive, names] = await Promise.all([getMemoryArchive(), getMemberNames(memberId)]);

  return (
    <MemoriesApp
      initialItems={archive.items}
      initialLocationsByDate={archive.locationsByDate}
      initialLocationSelectionsByDate={archive.locationSelectionsByDate}
      canCreate
      canEdit
      canDelete
      canLogout
      memberName={names.memberName}
      memberNames={names.memberNames}
    />
  );
}
