import { expect, test } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";

import { flowerCatalog, getFlowerById, isFlowerId } from "../../features/flowers/catalog";

test("the Curtis catalog contains 55 unique selectable records with local artwork", () => {
  expect(flowerCatalog).toHaveLength(55);
  expect(new Set(flowerCatalog.map((flower) => flower.id)).size).toBe(55);
  expect(flowerCatalog.every((flower) => flower.meaning && flower.context && flower.narratives.length > 0)).toBe(true);
  expect(flowerCatalog.every((flower) => flower.artwork.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:"))).toBe(true);
  expect(
    flowerCatalog.every((flower) =>
      existsSync(path.join(process.cwd(), "public", flower.artwork.src.replace(/^\//, ""))),
    ),
  ).toBe(true);
});

test("catalog meanings and narratives remain attached to their scientific paths", () => {
  expect(getFlowerById("rosa-kirmizi")).toMatchObject({
    path: "Rosa › kırmızı",
    name: "Kırmızı gül",
    meaning: "aşk, tutku",
  });
});

test("flowers without Curtis artwork remain readable but cannot be newly selected", () => {
  const excludedIds = [
    "calendula-officinalis",
    "celosia-argentea-ibik-bicimli",
    "cercis-siliquastrum",
    "citrus-cicek",
    "convallaria-majalis",
    "myosotis",
  ];

  for (const flowerId of excludedIds) {
    expect(getFlowerById(flowerId)).toBeDefined();
    expect(isFlowerId(flowerId)).toBe(false);
  }
});
