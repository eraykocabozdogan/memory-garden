import { getCurrentMemberId } from "@/features/auth/member";
import { createDiaryEntry } from "@/features/diary/diary-repository";
import { jsonError, readJsonObject } from "@/lib/http/json";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const memberId = await getCurrentMemberId();
  if (!memberId) return jsonError("Oturum gerekli.", 401);

  const body = await readJsonObject(request);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) return jsonError("Günlük metni boş olamaz.", 400);

  const entry = await createDiaryEntry(memberId, content);
  return Response.json(entry, { status: 201 });
}
