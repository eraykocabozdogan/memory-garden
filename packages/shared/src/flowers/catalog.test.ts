import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { expect, test } from "vitest";

import { flowerCatalog, getFlowerById, isFlowerId } from "./catalog";
import flowerArtwork from "./flower-artwork.json";

const webPublicDirectory = fileURLToPath(new URL("../../../../apps/web/public/", import.meta.url));

test("every catalog record with artwork has its own local image", () => {
  expect(flowerCatalog).toHaveLength(59);
  expect(new Set(flowerCatalog.map((flower) => flower.id)).size).toBe(59);
  expect(
    flowerCatalog.every(
      (flower) => flower.meaning && flower.context && flower.narratives.length > 0,
    ),
  ).toBe(true);
  expect(
    flowerCatalog.every((flower) =>
      flower.artwork.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:"),
    ),
  ).toBe(true);
  expect(
    flowerCatalog.every((flower) =>
      existsSync(webPublicDirectory + flower.artwork.src.replace(/^\//, "")),
    ),
  ).toBe(true);
});

test("story-drawn associations are kept apart from source emblem meanings", () => {
  expect(getFlowerById("papaver")).toMatchObject({
    meaning: "teselli, acının dinmesi, unutma",
    associations: "uyku, yas",
  });
  expect(flowerCatalog.every((flower) => typeof flower.associations === "string")).toBe(true);
});

test("no two records share the same source image region", () => {
  const regions = flowerArtwork.map((entry) =>
    JSON.stringify({ fileName: entry.fileName, crop: "crop" in entry ? entry.crop : null }),
  );
  expect(new Set(regions).size).toBe(regions.length);
});

test("catalog meanings and narratives remain attached to their scientific paths", () => {
  expect(getFlowerById("rosa-kirmizi")).toMatchObject({
    path: "Rosa › kırmızı",
    name: "Kırmızı gül",
    meaning: "aşk",
    associations: "",
  });
});

test("records without artwork remain readable but cannot be newly selected", () => {
  for (const flowerId of ["rosa-kurumus", "syringa-beyaz"]) {
    expect(getFlowerById(flowerId)).toBeDefined();
    expect(isFlowerId(flowerId)).toBe(false);
  }
});
