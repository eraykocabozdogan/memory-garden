export function mediaOutputKeys(itemId: string, runId: string, kind: "photo" | "video") {
  const prefix = `processed/${itemId}/${runId}`;
  return {
    displayObjectKey: `${prefix}/display.${kind === "photo" ? "webp" : "mp4"}`,
    previewObjectKey: `${prefix}/preview.webp`,
  };
}
