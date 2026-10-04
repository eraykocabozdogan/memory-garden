import { expect, test } from "@playwright/test";

import { parseMemoryDate } from "../../features/memories/date-value";

test("accepts each supported memory date precision", () => {
  expect(parseMemoryDate("none", undefined)).toEqual({
    precision: "none",
    dayDate: null,
    year: null,
    month: null,
  });
  expect(parseMemoryDate("year", "2026")).toEqual({
    precision: "year",
    dayDate: null,
    year: 2026,
    month: null,
  });
  expect(parseMemoryDate("month", "2026-05")).toEqual({
    precision: "month",
    dayDate: null,
    year: 2026,
    month: 5,
  });
  expect(parseMemoryDate("day", "2026-05-15")).toEqual({
    precision: "day",
    dayDate: "2026-05-15",
    year: null,
    month: null,
  });
});

test("rejects incomplete and impossible memory dates", () => {
  expect(parseMemoryDate("none", "2026")).toBeNull();
  expect(parseMemoryDate("year", "26")).toBeNull();
  expect(parseMemoryDate("month", "2026-13")).toBeNull();
  expect(parseMemoryDate("day", "2026-02-29")).toBeNull();
  expect(parseMemoryDate("week", "2026-W20")).toBeNull();
});
