export type MemoryUpdateRequest = {
  datePrecision: "none" | "year" | "month" | "day";
  date?: string;
  textContent?: string;
};

export async function updateMemory(itemId: string, body: MemoryUpdateRequest) {
  const response = await fetch(`/api/memories/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.ok) return;

  const result = (await response.json().catch(() => null)) as { error?: unknown } | null;
  throw new Error(
    typeof result?.error === "string"
      ? result.error
      : "Anı güncellenemedi. Lütfen yeniden dene.",
  );
}
