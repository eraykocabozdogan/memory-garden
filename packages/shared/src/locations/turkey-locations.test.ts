import { expect, test } from "vitest";

import { parseMemoryLocationSelections } from "./memory-location-selection";
import { resolveTurkeyLocation, turkeyProvinces } from "./turkey-locations";

test("contains all Turkish provinces and districts", () => {
  expect(turkeyProvinces).toHaveLength(81);
  expect(turkeyProvinces.reduce((total, province) => total + province.districts.length, 0)).toBe(
    973,
  );
});

test("resolves province and district selections from trusted static data", () => {
  expect(resolveTurkeyLocation({ provinceCode: "35" })).toEqual({
    provinceCode: "35",
    provinceName: "İzmir",
    districtCode: null,
    districtName: null,
    latitude: 38.61,
    longitude: 27.021,
  });
  expect(resolveTurkeyLocation({ provinceCode: "35", districtCode: "1251" })).toEqual({
    provinceCode: "35",
    provinceName: "İzmir",
    districtCode: "1251",
    districtName: "Çeşme",
    latitude: 38.309,
    longitude: 26.444,
  });
});

test("rejects unknown and mismatched location codes", () => {
  expect(resolveTurkeyLocation({ provinceCode: "00" })).toBeNull();
  expect(resolveTurkeyLocation({ provinceCode: "06", districtCode: "1251" })).toBeNull();
});

test("keeps the submitted route order and resolves trusted values", () => {
  const locations = parseMemoryLocationSelections(
    [
      { provinceCode: "35", districtCode: "1251" },
      { provinceCode: "06" },
      { provinceCode: "35", districtCode: "1251" },
    ],
    true,
  );

  expect(locations?.map((location) => location.districtName ?? location.provinceName)).toEqual([
    "Çeşme",
    "Ankara",
    "Çeşme",
  ]);
});

test("requires an explicit route only for exact-day memories", () => {
  expect(parseMemoryLocationSelections(undefined, true)).toBeNull();
  expect(parseMemoryLocationSelections([], true)).toEqual([]);
  expect(
    parseMemoryLocationSelections([{ provinceCode: "06", districtCode: "1251" }], true),
  ).toBeNull();
  expect(parseMemoryLocationSelections(undefined, false)).toEqual([]);
  expect(parseMemoryLocationSelections([{ provinceCode: "35" }], false)).toBeNull();
});
