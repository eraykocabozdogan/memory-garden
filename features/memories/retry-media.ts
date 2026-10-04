export async function retryMedia(itemId: string) {
  const response = await fetch(`/api/media/${itemId}/retry`, { method: "POST" });
  const result = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Medya yeniden işlenemedi.");
}
