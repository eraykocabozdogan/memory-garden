import {
  type FlowerCatalogEntry,
  getSelectableFlowerById,
} from "@memory-garden/shared/flowers/catalog";

/**
 * Flowers that may greet you on the login page. The catalog also holds flowers with sad or
 * harsh meanings (abandonment, folly, separation), which do not belong on the first screen, so
 * only these hand-picked ones with warm meanings rotate.
 */
export const LOGIN_FLOWER_IDS = [
  "viola-tricolor", // düşünceler, beni düşün, hatırlama
  "galanthus", // umut, teselli, zor günde dostluk
  "convallaria-majalis", // mutluluğun geri dönüşü
  "lonicera", // sevgi bağı, tatlı huyluluk
  "rosa-kurumus", // tatlı hatıralar
  "rosa-kirmizi", // aşk
  "rosa-tomurcuk", // aşk itirafı
  "viola", // tevazu, sadakat, bağlılık
  "bellis-perennis-katmerli", // duygularına katılıyorum, paylaşım
  "tulipa", // aşk ilanı, yakıcı tutku
] as const;

export const DEFAULT_LOGIN_FLOWER_ID = LOGIN_FLOWER_IDS[0];

type LoginFlower = FlowerCatalogEntry & { artwork: NonNullable<FlowerCatalogEntry["artwork"]> };

function flower(id: string): LoginFlower {
  const entry = getSelectableFlowerById(id);
  if (!entry?.artwork) throw new Error(`Login flower "${id}" is missing from the catalog`);
  return entry as LoginFlower;
}

/** The fixed login flower. */
export function defaultLoginFlower() {
  return flower(DEFAULT_LOGIN_FLOWER_ID);
}

/** One flower per calendar day (local time), stable for the whole day. */
export function loginFlowerOfTheDay(date: Date) {
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return flower(LOGIN_FLOWER_IDS[day % LOGIN_FLOWER_IDS.length] ?? DEFAULT_LOGIN_FLOWER_ID);
}
