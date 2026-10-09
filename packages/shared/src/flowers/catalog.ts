import catalogData from "./catalog-data.json";
import flowerArtwork from "./flower-artwork.json";

export type FlowerArtwork = {
  src: string;
  sourceTitle: string;
  sourceUrl: string;
  /** The source shows a close stand-in, not the record itself; the UI labels it "temsilî". */
  representative: boolean;
};

export type FlowerCatalogEntry = {
  id: string;
  path: string;
  name: string;
  /** Emblem meanings the sources give this flower. */
  meaning: string;
  /** Associations the cited narratives draw but the sources do not give as an emblem (may be empty). */
  associations: string;
  context: string;
  narratives: string[];
  artwork?: FlowerArtwork;
};

function commonsFileUrl(fileName: string) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName).replaceAll("%20", "_")}`;
}

const artworkById = new Map(
  flowerArtwork.map((entry) => [
    entry.id,
    {
      src: `/flowers/art/${entry.id}.webp`,
      sourceTitle: entry.fileName,
      sourceUrl: commonsFileUrl(entry.fileName),
      representative: "representative" in entry && entry.representative === true,
    },
  ]),
);

const completeFlowerCatalog = catalogData.map((flower) => ({
  ...flower,
  artwork: artworkById.get(flower.id),
})) satisfies FlowerCatalogEntry[];

export const flowerCatalog = completeFlowerCatalog.filter(
  (flower): flower is FlowerCatalogEntry & { artwork: FlowerArtwork } => Boolean(flower.artwork),
);

const flowersById = new Map(completeFlowerCatalog.map((flower) => [flower.id, flower]));
const selectableFlowersById = new Map(flowerCatalog.map((flower) => [flower.id, flower]));

export function getFlowerById(flowerId: string) {
  return flowersById.get(flowerId);
}

export function getSelectableFlowerById(flowerId: string) {
  return selectableFlowersById.get(flowerId);
}

export function isFlowerId(flowerId: string) {
  return selectableFlowersById.has(flowerId);
}
