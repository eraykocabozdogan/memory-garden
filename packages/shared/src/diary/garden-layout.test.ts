import { expect, test } from "vitest";

import { buildGardenDays, istanbulDayKey, spiralCoordinate } from "./garden-layout";

test("garden days start at the center and expand clockwise in a square spiral", () => {
  expect(Array.from({ length: 9 }, (_, index) => spiralCoordinate(index))).toEqual([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
  ]);
});

test("the garden starts on the day of the first diary entry", () => {
  expect(
    buildGardenDays(
      "2026-09-01T09:00:00+03:00",
      [{ entryId: "flower-day", flowerId: "rosa", plantedAt: "2026-08-31T20:00:00+03:00" }],
      "2026-08-30",
    ),
  ).toMatchObject([
    { dayKey: "2026-08-30", index: 0, flowers: [] },
    { dayKey: "2026-08-31", index: 1, flowers: [{ flowerId: "rosa" }] },
    { dayKey: "2026-09-01", index: 2, flowers: [] },
  ]);
});

test("there is no garden before the first diary entry", () => {
  expect(buildGardenDays("2026-09-01T09:00:00+03:00", [], null)).toEqual([]);
});

test("days follow the Istanbul calendar", () => {
  expect(istanbulDayKey("2026-08-30T21:30:00.000Z")).toBe("2026-08-31");
});
