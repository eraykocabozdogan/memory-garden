import { getCurrentMemberId } from "@/features/auth/member";
import { saveDiaryFlowerResponse } from "@/features/diary/diary-repository";
import { isFlowerId } from "@/features/flowers/catalog";
import { jsonError, readJsonObject } from "@/lib/http/json";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/diary/[entryId]/flower">,
) {
  const memberId = await getCurrentMemberId();
  if (!memberId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  const flowerId = typeof body?.flowerId === "string" ? body.flowerId : "";
  if (!isFlowerId(flowerId)) return jsonError("Çiçek seçimi geçersiz.", 400);

  const { entryId } = await context.params;
  const result = await saveDiaryFlowerResponse(entryId, memberId, flowerId);
  if (result === "not_found") return jsonError("Günlük girdisi bulunamadı.", 404);
  if (result === "own_entry") return jsonError("Kendi günlüğüne çiçek bırakamazsın.", 403);
  if (result === "expired") return jsonError("Bu günlüğün 24 saatlik süresi doldu.", 409);
  if (result === "forbidden") return jsonError("Bu çiçek yanıtını değiştiremezsin.", 403);
  return new Response(null, { status: 204 });
}
