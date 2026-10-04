import { requireMember } from "@/features/auth/member";
import { MemoriesApp } from "@/features/memories/memories-app";
import { getMemoryArchive } from "@/features/memories/memory-repository";

export const dynamic = "force-dynamic";

export default async function MemoriesPage() {
  await requireMember();
  const archive = await getMemoryArchive();

  return (
    <MemoriesApp
      initialItems={archive.items}
      initialLocationsByDate={archive.locationsByDate}
      initialLocationSelectionsByDate={archive.locationSelectionsByDate}
      canCreate
      canEdit
      canDelete
      canLogout
    />
  );
}
