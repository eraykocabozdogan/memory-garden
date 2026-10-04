"use client";

type UploadProgress = {
  uploadedBytes: number;
  totalBytes: number;
};

type InitializeResponse =
  | {
      mode: "single";
      uploadUrl: string;
      uploadToken: string;
    }
  | {
      mode: "multipart";
      partSizeBytes: number;
      uploadToken: string;
    };

type MediaMetadata = {
  kind: "photo" | "video";
  width?: number;
  height?: number;
  durationSeconds?: number;
};

type UploadOptions = {
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
};

async function jsonRequest<T>(path: string, body: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "İstek tamamlanamadı.");
  return result;
}

export async function discardUploadedMedia(uploadToken: string) {
  await jsonRequest("/api/uploads/abort", { uploadToken });
}

function putPart(
  url: string,
  body: Blob,
  contentType: string | undefined,
  signal: AbortSignal | undefined,
  onProgress: (loaded: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    if (contentType) request.setRequestHeader("content-type", contentType);
    request.upload.addEventListener("progress", (event) => onProgress(event.loaded));
    request.addEventListener("load", () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error("Dosya R2'ye yüklenemedi."));
        return;
      }
      resolve(request.getResponseHeader("etag") ?? "");
    });
    request.addEventListener("error", () => reject(new Error("Dosya yükleme bağlantısı kesildi.")));
    request.addEventListener("abort", () => reject(new DOMException("Yükleme iptal edildi.", "AbortError")));

    const abort = () => request.abort();
    signal?.addEventListener("abort", abort, { once: true });
    request.addEventListener("loadend", () => signal?.removeEventListener("abort", abort));
    request.send(body);
  });
}

export async function uploadMedia(
  file: File,
  metadata: MediaMetadata,
  options: UploadOptions = {},
) {
  const initialized = await jsonRequest<InitializeResponse>(
    "/api/uploads/initialize",
    {
      kind: metadata.kind,
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      width: metadata.width,
      height: metadata.height,
      durationSeconds: metadata.durationSeconds,
    },
    options.signal,
  );

  if (initialized.mode === "single") {
    try {
      await putPart(
        initialized.uploadUrl,
        file,
        file.type,
        options.signal,
        (uploadedBytes) => options.onProgress?.({ uploadedBytes, totalBytes: file.size }),
      );
      return initialized.uploadToken;
    } catch (error) {
      await discardUploadedMedia(initialized.uploadToken).catch(() => undefined);
      throw error;
    }
  }

  const partCount = Math.ceil(file.size / initialized.partSizeBytes);
  const completedParts: Array<{ partNumber: number; eTag: string }> = [];
  const partProgress = new Map<number, number>();

  try {
    for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
      const start = (partNumber - 1) * initialized.partSizeBytes;
      const end = Math.min(start + initialized.partSizeBytes, file.size);
      const part = file.slice(start, end);
      let eTag = "";

      for (let attempt = 1; attempt <= 3 && !eTag; attempt += 1) {
        try {
          const { uploadUrl } = await jsonRequest<{ uploadUrl: string }>(
            "/api/uploads/part",
            { uploadToken: initialized.uploadToken, partNumber },
            options.signal,
          );
          eTag = await putPart(uploadUrl, part, undefined, options.signal, (loaded) => {
            partProgress.set(partNumber, loaded);
            const uploadedBytes = Array.from(partProgress.values()).reduce(
              (total, value) => total + value,
              0,
            );
            options.onProgress?.({ uploadedBytes, totalBytes: file.size });
          });
        } catch (error) {
          partProgress.set(partNumber, 0);
          if (options.signal?.aborted || attempt === 3) throw error;
        }
      }

      if (!eTag) throw new Error("R2 yüklenen parçayı doğrulamadı.");
      completedParts.push({ partNumber, eTag });
    }

    await jsonRequest(
      "/api/uploads/complete",
      { uploadToken: initialized.uploadToken, parts: completedParts },
      options.signal,
    );
    return initialized.uploadToken;
  } catch (error) {
    await discardUploadedMedia(initialized.uploadToken).catch(() => undefined);
    throw error;
  }
}
