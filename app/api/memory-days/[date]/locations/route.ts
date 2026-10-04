import { eq, sql } from "drizzle-orm";

import { getDatabase } from "@/db";
import { memoryDayLocations, memoryDays } from "@/db/schema";
import { getCurrentMemberId } from "@/features/auth/member";
import { parseMemoryLocationSelections } from "@/features/locations/memory-location-selection";
import { parseMemoryDate } from "@/features/memories/date-value";
import { jsonError, readJsonObject } from "@/lib/http/json";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/memory-days/[date]/locations">,
) {
  if (!(await getCurrentMemberId())) return jsonError("Oturum gerekli.", 401);

  const { date } = await context.params;
  const parsedDate = parseMemoryDate("day", date);
  if (!parsedDate?.dayDate) return jsonError("Gün bilgisi geçersiz.", 400);
  const dayDate = parsedDate.dayDate;

  const body = await readJsonObject(request);
  if (!body) return jsonError("Geçersiz istek.", 400);
  const locations = parseMemoryLocationSelections(body.locations, true);
  if (!locations) return jsonError("Konum bilgisi geçersiz.", 400);

  const result = await getDatabase().transaction(async (transaction) => {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`memory-day-route:${dayDate}`}))`,
    );

    const [day] = await transaction
      .select({ id: memoryDays.id })
      .from(memoryDays)
      .where(eq(memoryDays.memoryDate, dayDate))
      .limit(1)
      .for("update");
    if (!day) return "not_found" as const;

    await transaction
      .delete(memoryDayLocations)
      .where(eq(memoryDayLocations.memoryDayId, day.id));

    if (locations.length > 0) {
      await transaction.insert(memoryDayLocations).values(
        locations.map((location, index) => ({
          memoryDayId: day.id,
          provinceCode: location.provinceCode,
          provinceName: location.provinceName,
          districtCode: location.districtCode,
          districtName: location.districtName,
          longitude: location.longitude,
          latitude: location.latitude,
          sortOrder: index,
        })),
      );
    }

    await transaction
      .update(memoryDays)
      .set({ updatedAt: new Date() })
      .where(eq(memoryDays.id, day.id));

    return "updated" as const;
  });

  if (result === "not_found") return jsonError("Anı günü bulunamadı.", 404);
  return new Response(null, { status: 204 });
}
