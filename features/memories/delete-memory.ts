export async function deleteMemory(itemId: string) {
  const response = await fetch(`/api/memories/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
  });

  if (response.ok) return;

  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  throw new Error(
    typeof body?.error === "string" ? body.error : "Anı silinemedi. Lütfen yeniden dene.",
  );
}
