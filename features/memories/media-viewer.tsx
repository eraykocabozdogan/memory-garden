"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { CalendarDays, LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteMemory } from "./delete-memory";
import type { MemoryItem } from "./types";

type MediaViewerProps = {
  item?: MemoryItem;
  onClose: () => void;
  onGoToDay: (item: MemoryItem) => void;
  onEdit: (item: MemoryItem) => void;
  onDeleted: (itemId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
};

export function MediaViewer({
  item,
  onClose,
  onGoToDay,
  onEdit,
  onDeleted,
  canEdit = false,
  canDelete = false,
}: MediaViewerProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const imageSource = item?.kind === "photo" ? (item.display ?? item.image) : undefined;
  const canGoToDay = item?.datePrecision === "day" && Boolean(item.date);

  async function removeItem() {
    if (!item) return;
    setDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteMemory(item.id);
      setConfirmingDelete(false);
      onDeleted(item.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Anı silinemedi.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Dialog.Root
        open={Boolean(item)}
        onOpenChange={(open) => {
          if (!open && !confirmingDelete) onClose();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="media-viewer-backdrop" />
          <Dialog.Viewport className="media-viewer-viewport">
            {item ? (
              <Dialog.Popup className="media-viewer-dialog">
                <div className="media-viewer-stage">
                  {item.kind === "video" && item.display ? (
                    <video
                      key={item.id}
                      data-testid="media-viewer-video"
                      src={item.display}
                      poster={item.image}
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : imageSource ? (
                    <Image
                      data-testid="media-viewer-image"
                      src={imageSource}
                      alt={item.alt ?? ""}
                      fill
                      unoptimized={imageSource.startsWith("/api/media/")}
                      sizes="100vw"
                      className="object-contain"
                    />
                  ) : null}

                  <Dialog.Close className="media-viewer-close" aria-label="Medya penceresini kapat">
                    <X />
                  </Dialog.Close>
                </div>

                <footer className="media-viewer-footer">
                  <div className="min-w-0">
                    <Dialog.Title className="truncate font-serif text-xl sm:text-2xl">
                      {item.title}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                      {item.dateLabel}
                    </Dialog.Description>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {canEdit ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none"
                        aria-label="Anıyı düzenle"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil />
                        <span className="hidden sm:inline">Düzenle</span>
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Button
                        type="button"
                        variant="destructive"
                        className="rounded-none"
                        aria-label="Anıyı sil"
                        onClick={() => {
                          setDeleteError(undefined);
                          setConfirmingDelete(true);
                        }}
                      >
                        <Trash2 />
                        <span className="hidden sm:inline">Sil</span>
                      </Button>
                    ) : null}
                    {canGoToDay ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-none"
                        onClick={() => onGoToDay(item)}
                      >
                        <CalendarDays />
                        Güne git
                      </Button>
                    ) : null}
                  </div>
                </footer>
              </Dialog.Popup>
            ) : null}
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="delete-memory-backdrop" />
          <AlertDialog.Viewport className="delete-memory-viewport">
            <AlertDialog.Popup className="delete-memory-dialog">
              <AlertDialog.Title className="font-serif text-2xl">Bu anı silinsin mi?</AlertDialog.Title>
              <AlertDialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">
                Bu işlem anıyı ve ona ait medya dosyalarını kalıcı olarak silecek.
              </AlertDialog.Description>
              {deleteError ? <p className="login-error">{deleteError}</p> : null}
              <div className="mt-7 flex justify-end gap-2">
                <AlertDialog.Close
                  render={<Button type="button" variant="outline" className="rounded-none" />}
                  disabled={deleting}
                >
                  Vazgeç
                </AlertDialog.Close>
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-none"
                  disabled={deleting}
                  onClick={removeItem}
                >
                  {deleting ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
                  {deleting ? "Siliniyor" : "Kalıcı olarak sil"}
                </Button>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
