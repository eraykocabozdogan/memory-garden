import catalogData from "./catalog-data.json";
import flowerArtwork from "./flower-artwork.json";

export type FlowerArtwork = {
  src: string;
  sourceTitle: string;
  sourceUrl: string;
};

export type FlowerCatalogEntry = {
  id: string;
  path: string;
  name: string;
  meaning: string;
  context: string;
  narratives: string[];
  artwork?: FlowerArtwork;
};

function commonsFileUrl(fileName: string) {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileName).replaceAll("%20", "_")}`;
}

const artworkById = new Map(
  flowerArtwork.map(({ id, fileName }) => [
    id,
    {
      src: `/flowers/art/${id}.webp`,
      sourceTitle: fileName,
      sourceUrl: commonsFileUrl(fileName),
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
