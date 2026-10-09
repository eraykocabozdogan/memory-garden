import {
  type ResolvedTurkeyLocation,
  resolveTurkeyLocation,
  type TurkeyLocationSelection,
} from "./turkey-locations";

export function parseMemoryLocationSelections(
  value: unknown,
  requiresDayRoute: boolean,
): ResolvedTurkeyLocation[] | null {
  if (!requiresDayRoute) {
    return value === undefined || (Array.isArray(value) && value.length === 0) ? [] : null;
  }

  if (!Array.isArray(value)) return null;

  const resolved: ResolvedTurkeyLocation[] = [];
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;

    const provinceCode = Reflect.get(candidate, "provinceCode");
    const districtCode = Reflect.get(candidate, "districtCode");
    if (
      typeof provinceCode !== "string" ||
      (districtCode !== undefined && typeof districtCode !== "string")
    ) {
      return null;
    }

    const selection: TurkeyLocationSelection = {
      provinceCode,
      districtCode: districtCode || undefined,
    };
    const location = resolveTurkeyLocation(selection);
    if (!location) return null;
    resolved.push(location);
  }

  return resolved;
}
