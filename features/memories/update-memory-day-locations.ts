export type MemoryDayLocationUpdateRequest = {
  locations: Array<{ provinceCode: string; districtCode?: string }>;
};

export async function updateMemoryDayLocations(
  date: string,
  body: MemoryDayLocationUpdateRequest,
) {
  const response = await fetch(
    `/api/memory-days/${encodeURIComponent(date)}/locations`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (response.ok) return;

  const result = (await response.json().catch(() => null)) as { error?: unknown } | null;
  throw new Error(
    typeof result?.error === "string"
      ? result.error
      : "Günün rotası güncellenemedi. Lütfen yeniden dene.",
  );
}
