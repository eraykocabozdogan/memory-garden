import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OPEN_ADMIN_REVISION = "6dfe36b4360c4395656edc2ea0730224d269bc86";
const TURKEY_GEO_REVISION = "5a16cef20f2335e3fe643c9618f931866bb8134c";
const OPEN_ADMIN_ROOT = `https://raw.githubusercontent.com/open-admin-data/turkey-administrative-divisions/${OPEN_ADMIN_REVISION}/data`;
const TURKEY_GEO_ROOT = `https://raw.githubusercontent.com/onurusluca/turkey-geo-api/${TURKEY_GEO_REVISION}/data/jsonl`;

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "features/locations/turkey-locations.json");

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function parseJsonLines(value) {
  return value
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function matchingKey(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replaceAll("ı", "i")
    .replaceAll("æ", "ae")
    .replace(/[^a-z0-9]/g, "");
}

function displayName(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/(^|[\s'-])\p{L}/gu, (part) => part.toLocaleUpperCase("tr-TR"));
}

function coordinates(record) {
  const latitude = Number(record.geo.lat);
  const longitude = Number(record.geo.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Missing coordinates for ${record.id}`);
  }
  return { latitude, longitude };
}

const [openProvinces, openDistricts, officialProvinces] = await Promise.all([
  fetchJson(`${OPEN_ADMIN_ROOT}/all-province.json`),
  fetchJson(`${OPEN_ADMIN_ROOT}/all-district.json`),
  fetchText(`${TURKEY_GEO_ROOT}/provinces.jsonl`).then(parseJsonLines),
]);

const officialDistrictGroups = await Promise.all(
  officialProvinces.map(async (province) => ({
    provinceId: province.id,
    districts: parseJsonLines(
      await fetchText(`${TURKEY_GEO_ROOT}/province-${province.id}/districts.jsonl`),
    ),
  })),
);

const openProvinceByPlate = new Map(
  openProvinces.map((province) => [Number(province.id.slice(3)), province]),
);
const openDistrictsByProvince = new Map();
for (const district of openDistricts) {
  const provinceId = Number(district.parent.id.slice(3));
  const group = openDistrictsByProvince.get(provinceId) ?? [];
  group.push(district);
  openDistrictsByProvince.set(provinceId, group);
}

const officialDistrictsByProvince = new Map(
  officialDistrictGroups.map((group) => [group.provinceId, group.districts]),
);
const unmatched = [];

const locations = officialProvinces
  .sort((left, right) => left.id - right.id)
  .map((officialProvince) => {
    const openProvince = openProvinceByPlate.get(officialProvince.id);
    if (!openProvince) throw new Error(`Province ${officialProvince.id} is missing`);

    const openDistrictsForProvince = openDistrictsByProvince.get(officialProvince.id) ?? [];
    const openByName = new Map(
      openDistrictsForProvince.flatMap((district) => [
        [matchingKey(district.name.local), district],
        [matchingKey(district.name.en), district],
      ]),
    );
    const officialDistricts = officialDistrictsByProvince.get(officialProvince.id) ?? [];
    const districts = officialDistricts
      .map((officialDistrict) => {
        const officialNameKey = matchingKey(officialDistrict.name);
        const openDistrict = openByName.get(
          officialNameKey === "merkez"
            ? matchingKey(officialProvince.name)
            : officialNameKey,
        );
        if (!openDistrict) {
          unmatched.push(`${officialProvince.name} / ${officialDistrict.name}`);
          return null;
        }

        return {
          code: String(officialDistrict.id),
          name: displayName(officialDistrict.name),
          ...coordinates(openDistrict),
        };
      })
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name, "tr-TR"));

    return {
      code: String(officialProvince.id).padStart(2, "0"),
      name: displayName(officialProvince.name),
      ...coordinates(openProvince),
      districts,
    };
  });

if (unmatched.length > 0) {
  throw new Error(`Unmatched districts (${unmatched.length}):\n${unmatched.join("\n")}`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(locations)}\n`, "utf8");
console.log(`Wrote ${locations.length} provinces and ${openDistricts.length} districts to ${outputPath}`);
