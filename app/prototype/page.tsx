import { MemoriesApp } from "@/features/memories/memories-app";
import { locationSelectionsByDate } from "@/features/memories/mock-data";

export default function MemoriesPrototypePage() {
  return (
    <MemoriesApp
      initialLocationSelectionsByDate={locationSelectionsByDate}
      canCreate
      canEdit
      canDelete
    />
  );
}
