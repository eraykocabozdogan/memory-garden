import locationData from "./turkey-locations.json";

export type TurkeyDistrict = {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type TurkeyProvince = TurkeyDistrict & {
  districts: TurkeyDistrict[];
};

export type TurkeyLocationSelection = {
  provinceCode: string;
  districtCode?: string;
};

export type ResolvedTurkeyLocation = {
  provinceCode: string;
  provinceName: string;
  districtCode: string | null;
  districtName: string | null;
  latitude: number;
  longitude: number;
};

export const turkeyProvinces = locationData satisfies TurkeyProvince[];

const provincesByCode = new Map(turkeyProvinces.map((province) => [province.code, province]));

export function resolveTurkeyLocation(
  selection: TurkeyLocationSelection,
): ResolvedTurkeyLocation | null {
  const province = provincesByCode.get(selection.provinceCode);
  if (!province) return null;

  if (!selection.districtCode) {
    return {
      provinceCode: province.code,
      provinceName: province.name,
      districtCode: null,
      districtName: null,
      latitude: province.latitude,
      longitude: province.longitude,
    };
  }

  const district = province.districts.find(
    (candidate) => candidate.code === selection.districtCode,
  );
  if (!district) return null;

  return {
    provinceCode: province.code,
    provinceName: province.name,
    districtCode: district.code,
    districtName: district.name,
    latitude: district.latitude,
    longitude: district.longitude,
  };
}
