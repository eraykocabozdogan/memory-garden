"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowDown,
  ArrowUp,
  FileImage,
  FileText,
  Film,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { TurkeyLocationSelection } from "@/features/locations/turkey-locations";
import {
  MAX_CONCURRENT_MEMORY_UPLOADS,
  MAX_MEMORY_BATCH_BYTES,
  MAX_MEMORY_BATCH_ITEMS,
} from "./batch-limits";
import {
  MemoryLocationEditor,
  type MemoryLocationDraft,
} from "./memory-location-editor";
import type { DatePrecision } from "./types";
import { discardUploadedMedia, uploadMedia } from "./upload-media";

const precisionOptions: Array<{ value: DatePrecision; label: string }> = [
  { value: "none", label: "Tarih yok" },
  { value: "year", label: "Yalnızca yıl" },
  { value: "month", label: "Ay ve yıl" },
  { value: "day", label: "Gün, ay ve yıl" },
];

type MediaMetadata = {
  width?: number;
  height?: number;
  durationSeconds?: number;
};

type MediaDraft = {
  id: string;
  kind: "photo" | "video";
  file: File;
  uploadToken?: string;
  progress: number;
  status: "pending" | "uploading" | "uploaded" | "failed";
  error?: string;
};

type TextDraft = {
  id: string;
  kind: "text";
  text: string;
};

type MemoryDraft = MediaDraft | TextDraft;

function loadMediaMetadata(file: File, kind: "photo" | "video"): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const finish = (metadata: MediaMetadata) => {
      URL.revokeObjectURL(objectUrl);
      resolve(metadata);
    };

    if (kind === "photo") {
      const image = new Image();
      image.onload = () => finish({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => finish({});
      image.src = objectUrl;
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      finish({
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
        durationSeconds: Number.isFinite(video.duration) ? Math.round(video.duration) : undefined,
      });
    video.onerror = () => finish({});
    video.src = objectUrl;
  });
}

async function createMemoryBatch(body: object, signal: AbortSignal) {
  const response = await fetch("/api/memories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const result = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Anılar kaydedilemedi.");
}

function dateInputType(precision: DatePrecision) {
  if (precision === "day") return "date";
  if (precision === "month") return "month";
  return "text";
}

function locationDrafts(
  date: string,
  selections: TurkeyLocationSelection[],
): MemoryLocationDraft[] {
  return selections.map((selection, index) => ({
    ...selection,
    key: `${date}-${index}-${selection.provinceCode}-${selection.districtCode ?? "province"}`,
  }));
}

function mediaKind(file: File) {
  if (file.type.startsWith("image/")) return "photo" as const;
  if (file.type.startsWith("video/")) return "video" as const;
  return null;
}

function mediaBytes(drafts: MemoryDraft[]) {
  return drafts.reduce(
    (total, draft) => total + (draft.kind === "text" ? 0 : draft.file.size),
    0,
  );
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function move<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

async function discardDraftUploads(drafts: MemoryDraft[]) {
  const tokens = Array.from(
    new Set(
      drafts.flatMap((draft) =>
        draft.kind !== "text" && draft.uploadToken ? [draft.uploadToken] : [],
      ),
    ),
  );
  await Promise.allSettled(tokens.map((token) => discardUploadedMedia(token)));
}

type MemoryComposerProps = {
  initialLocationSelectionsByDate: Record<string, TurkeyLocationSelection[]>;
};

export function MemoryComposer({ initialLocationSelectionsByDate }: MemoryComposerProps) {
  const router = useRouter();
  const abortController = useRef<AbortController | undefined>(undefined);
  const committing = useRef(false);
  const [open, setOpen] = useState(false);
  const [precision, setPrecision] = useState<DatePrecision>("none");
  const [date, setDate] = useState("");
  const [drafts, setDrafts] = useState<MemoryDraft[]>([]);
  const [locations, setLocations] = useState<MemoryLocationDraft[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  function reset() {
    setPrecision("none");
    setDate("");
    setDrafts([]);
    setLocations([]);
    setOverallProgress(0);
    setError(undefined);
  }

  function addFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    const typedFiles = files.map((file) => ({ file, kind: mediaKind(file) }));
    if (typedFiles.some(({ kind }) => !kind)) {
      setError("Yalnızca fotoğraf ve video dosyaları eklenebilir.");
      return;
    }
    if (drafts.length + files.length > MAX_MEMORY_BATCH_ITEMS) {
      setError(`Tek pakette en fazla ${MAX_MEMORY_BATCH_ITEMS} parça olabilir.`);
      return;
    }
    if (mediaBytes(drafts) + files.reduce((total, file) => total + file.size, 0) > MAX_MEMORY_BATCH_BYTES) {
      setError("Bir paketteki medya dosyalarının toplamı 5 GB'ı aşamaz.");
      return;
    }

    setDrafts((current) => [
      ...current,
      ...typedFiles.map(({ file, kind }) => ({
        id: crypto.randomUUID(),
        kind: kind as "photo" | "video",
        file,
        progress: 0,
        status: "pending" as const,
      })),
    ]);
    setError(undefined);
  }

  function addText() {
    if (drafts.length >= MAX_MEMORY_BATCH_ITEMS) {
      setError(`Tek pakette en fazla ${MAX_MEMORY_BATCH_ITEMS} parça olabilir.`);
      return;
    }
    setDrafts((current) => [
      ...current,
      { id: crypto.randomUUID(), kind: "text", text: "" },
    ]);
    setError(undefined);
  }

  async function removeDraft(draft: MemoryDraft) {
    setDrafts((current) => current.filter((candidate) => candidate.id !== draft.id));
    if (draft.kind !== "text" && draft.uploadToken) {
      try {
        await discardUploadedMedia(draft.uploadToken);
      } catch {
        setError("Kaldırılan dosyanın geçici yüklemesi temizlenemedi.");
      }
    }
  }

  async function uploadDraftMedia(snapshot: MemoryDraft[], signal: AbortSignal) {
    const media = snapshot.filter((draft): draft is MediaDraft => draft.kind !== "text");
    const tokens = new Map(
      media.flatMap((draft) => (draft.uploadToken ? [[draft.id, draft.uploadToken] as const] : [])),
    );
    const uploadedBytes = new Map(
      media.map((draft) => [draft.id, draft.uploadToken ? draft.file.size : 0]),
    );
    const totalBytes = media.reduce((total, draft) => total + draft.file.size, 0);
    const failures: Error[] = [];
    let nextIndex = 0;

    function updateOverallProgress() {
      const completed = Array.from(uploadedBytes.values()).reduce((total, value) => total + value, 0);
      setOverallProgress(totalBytes === 0 ? 100 : Math.round((completed / totalBytes) * 100));
    }

    function updateDraft(id: string, patch: Partial<MediaDraft>) {
      setDrafts((current) =>
        current.map((draft) =>
          draft.id === id && draft.kind !== "text" ? { ...draft, ...patch } : draft,
        ),
      );
    }

    async function worker() {
      while (nextIndex < media.length) {
        const draft = media[nextIndex];
        nextIndex += 1;
        if (tokens.has(draft.id)) continue;

        updateDraft(draft.id, { status: "uploading", error: undefined, progress: 0 });
        try {
          const metadata = await loadMediaMetadata(draft.file, draft.kind);
          const uploadToken = await uploadMedia(
            draft.file,
            { kind: draft.kind, ...metadata },
            {
              signal,
              onProgress: ({ uploadedBytes: currentBytes, totalBytes: fileBytes }) => {
                uploadedBytes.set(draft.id, currentBytes);
                updateOverallProgress();
                updateDraft(draft.id, {
                  progress: Math.round((currentBytes / fileBytes) * 100),
                });
              },
            },
          );
          tokens.set(draft.id, uploadToken);
          uploadedBytes.set(draft.id, draft.file.size);
          updateOverallProgress();
          updateDraft(draft.id, { uploadToken, status: "uploaded", progress: 100 });
        } catch (caught) {
          if (caught instanceof DOMException && caught.name === "AbortError") throw caught;
          const failure = caught instanceof Error ? caught : new Error("Dosya yüklenemedi.");
          failures.push(failure);
          updateDraft(draft.id, { status: "failed", error: failure.message });
        }
      }
    }

    updateOverallProgress();
    await Promise.all(
      Array.from(
        { length: Math.min(MAX_CONCURRENT_MEMORY_UPLOADS, media.length) },
        () => worker(),
      ),
    );
    if (failures.length > 0) {
      throw new Error(`${failures.length} dosya yüklenemedi. Başarılı dosyalar yeniden kullanılacak.`);
    }
    return tokens;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (drafts.length === 0) {
      setError("Pakete en az bir fotoğraf, video veya metin eklemelisin.");
      return;
    }
    if (drafts.some((draft) => draft.kind === "text" && !draft.text.trim())) {
      setError("Metin parçaları boş bırakılamaz.");
      return;
    }

    setSaving(true);
    const controller = new AbortController();
    abortController.current = controller;

    try {
      const snapshot = drafts;
      const uploadTokens = await uploadDraftMedia(snapshot, controller.signal);
      committing.current = true;
      await createMemoryBatch(
        {
          datePrecision: precision,
          date: precision === "none" ? undefined : date,
          locations:
            precision === "day"
              ? locations.map(({ provinceCode, districtCode }) => ({ provinceCode, districtCode }))
              : undefined,
          items: snapshot.map((draft) =>
            draft.kind === "text"
              ? { kind: "text", textContent: draft.text }
              : { kind: draft.kind, uploadToken: uploadTokens.get(draft.id) },
          ),
        },
        controller.signal,
      );

      setOpen(false);
      reset();
      router.refresh();
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "Anılar kaydedilemedi.");
    } finally {
      committing.current = false;
      abortController.current = undefined;
      setSaving(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          if (committing.current) return;
          abortController.current?.abort();
          void discardDraftUploads(drafts);
          reset();
        }
        setOpen(nextOpen);
      }}
    >
      <Dialog.Trigger render={<Button className="memory-add-button" />}>
        <Plus />
        Anı ekle
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="composer-backdrop" />
        <Dialog.Viewport className="composer-viewport">
          <Dialog.Popup className="composer-dialog">
            <header className="composer-header">
              <div>
                <p className="eyebrow">Yeni anı paketi</p>
                <Dialog.Title className="mt-1 font-handwriting text-4xl leading-none text-accent-ink">
                  Birlikte ekle
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                  Fotoğraf, video ve metinleri aynı tarih ve konum bilgisiyle tek seferde kaydet.
                </Dialog.Description>
              </div>
              <Dialog.Close
                className="composer-close"
                aria-label="Anı ekleme penceresini kapat"
                disabled={saving}
              >
                <X />
              </Dialog.Close>
            </header>

            <form className="composer-form" onSubmit={submit}>
              <fieldset disabled={saving}>
                <legend>Pakete parça ekle</legend>
                <div className="composer-add-grid">
                  <label className="composer-file-field">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      disabled={saving}
                      onChange={(event) => {
                        addFiles(event.target.files);
                        event.target.value = "";
                      }}
                    />
                    <Upload />
                    <span>Fotoğraf veya video seç</span>
                    <small>Birden fazla dosya seçebilirsin</small>
                  </label>
                  <button type="button" className="composer-add-text" onClick={addText}>
                    <FileText />
                    <span>Metin ekle</span>
                    <small>Birden fazla not yazabilirsin</small>
                  </button>
                </div>
              </fieldset>

              <div className="composer-package-summary" aria-live="polite">
                <span>{drafts.length}/{MAX_MEMORY_BATCH_ITEMS} parça</span>
                <span>{formatBytes(mediaBytes(drafts))} / 5 GB</span>
              </div>

              {drafts.length > 0 ? (
                <ol className="composer-draft-list" aria-label="Anı paketinin parçaları">
                  {drafts.map((draft, index) => {
                    const Icon = draft.kind === "text" ? FileText : draft.kind === "photo" ? FileImage : Film;
                    return (
                      <li key={draft.id} className="composer-draft-item">
                        <div className="composer-draft-heading">
                          <span className="composer-draft-kind"><Icon /> {index + 1}</span>
                          <div className="composer-draft-actions">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`${index + 1}. parçayı yukarı taşı`}
                              disabled={saving || index === 0}
                              onClick={() => setDrafts((current) => move(current, index, index - 1))}
                            >
                              <ArrowUp />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`${index + 1}. parçayı aşağı taşı`}
                              disabled={saving || index === drafts.length - 1}
                              onClick={() => setDrafts((current) => move(current, index, index + 1))}
                            >
                              <ArrowDown />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`${index + 1}. parçayı kaldır`}
                              disabled={saving}
                              onClick={() => void removeDraft(draft)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>

                        {draft.kind === "text" ? (
                          <label className="composer-field">
                            <span>Metin</span>
                            <textarea
                              value={draft.text}
                              onChange={(event) =>
                                setDrafts((current) =>
                                  current.map((candidate) =>
                                    candidate.id === draft.id && candidate.kind === "text"
                                      ? { ...candidate, text: event.target.value }
                                      : candidate,
                                  ),
                                )
                              }
                              placeholder="O günden aklında kalan…"
                              rows={4}
                              required
                              disabled={saving}
                            />
                          </label>
                        ) : (
                          <div className="composer-media-draft">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{draft.file.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {draft.kind === "photo" ? "Fotoğraf" : "Video"} · {formatBytes(draft.file.size)}
                              </p>
                            </div>
                            {draft.status !== "pending" ? (
                              <div className="composer-item-progress">
                                <span style={{ width: `${draft.progress}%` }} />
                              </div>
                            ) : null}
                            {draft.error ? <p className="text-xs text-destructive">{draft.error}</p> : null}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="composer-drafts-empty">Henüz paket parçası eklenmedi.</p>
              )}

              <div className="composer-date-row">
                <label className="composer-field">
                  <span>Ortak tarih bilgisi</span>
                  <select
                    value={precision}
                    onChange={(event) => {
                      setPrecision(event.target.value as DatePrecision);
                      setDate("");
                      setLocations([]);
                    }}
                    disabled={saving}
                  >
                    {precisionOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                {precision !== "none" ? (
                  <label className="composer-field">
                    <span>{precision === "year" ? "Yıl" : "Tarih"}</span>
                    <input
                      type={dateInputType(precision)}
                      inputMode={precision === "year" ? "numeric" : undefined}
                      pattern={precision === "year" ? "[0-9]{4}" : undefined}
                      placeholder={precision === "year" ? "2026" : undefined}
                      value={date}
                      onChange={(event) => {
                        const nextDate = event.target.value;
                        setDate(nextDate);
                        if (precision === "day") {
                          setLocations(locationDrafts(nextDate, initialLocationSelectionsByDate[nextDate] ?? []));
                        }
                      }}
                      required
                      disabled={saving}
                    />
                  </label>
                ) : null}
              </div>

              {precision === "day" ? (
                <MemoryLocationEditor value={locations} onChange={setLocations} disabled={saving} />
              ) : null}

              {saving && drafts.some((draft) => draft.kind !== "text") ? (
                <div className="composer-progress" aria-live="polite">
                  <span style={{ width: `${overallProgress}%` }} />
                  <small>
                    {overallProgress < 100 ? `%${overallProgress} dosyalar yükleniyor` : "Paket kaydediliyor"}
                  </small>
                </div>
              ) : null}

              {error ? <p className="composer-error" role="alert">{error}</p> : null}

              <div className="composer-actions">
                <Dialog.Close render={<Button type="button" variant="ghost" disabled={saving} />}>
                  Vazgeç
                </Dialog.Close>
                <Button type="submit" disabled={saving || drafts.length === 0}>
                  {saving ? <LoaderCircle className="animate-spin" /> : null}
                  {saving ? "Kaydediliyor…" : "Anıları kaydet"}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
