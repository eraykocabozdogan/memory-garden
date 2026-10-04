import { getCurrentMemberId } from "@/features/auth/member";
import {
  deleteDiaryEntry,
  updateDiaryEntry,
  type DiaryMutationResult,
} from "@/features/diary/diary-repository";
import { jsonError, readJsonObject } from "@/lib/http/json";

export const runtime = "nodejs";

function mutationError(result: DiaryMutationResult) {
  if (result === "not_found") return jsonError("Günlük girdisi bulunamadı.", 404);
  if (result === "forbidden") return jsonError("Bu günlük girdisini değiştiremezsin.", 403);
  if (result === "expired") return jsonError("Bu günlük girdisinin 24 saatlik süresi doldu.", 409);
  return null;
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/diary/[entryId]">,
) {
  const memberId = await getCurrentMemberId();
  if (!memberId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) return jsonError("Günlük metni boş olamaz.", 400);

  const { entryId } = await context.params;
  const result = await updateDiaryEntry(entryId, memberId, content);
  return mutationError(result) ?? new Response(null, { status: 204 });
}

export async function DELETE(
  _: Request,
  context: RouteContext<"/api/diary/[entryId]">,
) {
  const memberId = await getCurrentMemberId();
  if (!memberId) return jsonError("Oturum gerekli.", 401);

  const { entryId } = await context.params;
  const result = await deleteDiaryEntry(entryId, memberId);
  return mutationError(result) ?? new Response(null, { status: 204 });
}
