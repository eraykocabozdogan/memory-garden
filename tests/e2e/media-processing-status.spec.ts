import { expect, test } from "@playwright/test";

import { hasActiveMediaProcessing } from "../../features/memories/memory-selectors";
import type { MemoryItem, MediaStatus } from "../../features/memories/types";

function mediaItem(mediaStatus: MediaStatus): MemoryItem {
  return {
    id: mediaStatus,
    kind: "photo",
    date: "2026-08-30",
    dateLabel: "30 Ağustos 2026",
    datePrecision: "day",
    title: "Test",
    mediaStatus,
    aspect: "landscape",
  };
}

test("refresh polling is needed only while media processing is active", () => {
  expect(hasActiveMediaProcessing([mediaItem("queued")])).toBe(true);
  expect(hasActiveMediaProcessing([mediaItem("processing")])).toBe(true);
  expect(hasActiveMediaProcessing([mediaItem("ready"), mediaItem("failed")])).toBe(false);
});
