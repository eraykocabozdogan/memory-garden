"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LoaderCircle, Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { TurkeyLocationSelection } from "@/features/locations/turkey-locations";
import {
  MemoryLocationEditor,
  type MemoryLocationDraft,
} from "./memory-location-editor";
import { updateMemoryDayLocations } from "./update-memory-day-locations";

function locationDrafts(
  date: string,
  selections: TurkeyLocationSelection[],
): MemoryLocationDraft[] {
  return selections.map((selection, index) => ({
    ...selection,
    key: `${date}-${index}-${selection.provinceCode}-${selection.districtCode ?? "province"}`,
  }));
}

type MemoryDayLocationEditorProps = {
  date?: string;
  dateLabel?: string;
  selections: TurkeyLocationSelection[];
  onClose: () => void;
  onSaved: () => void;
};

export function MemoryDayLocationEditor({
  date,
  dateLabel,
  selections,
  onClose,
  onSaved,
}: MemoryDayLocationEditorProps) {
  const [locations, setLocations] = useState<MemoryLocationDraft[]>(() =>
    date ? locationDrafts(date, selections) : [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) return;

    setSaving(true);
    setError(undefined);
    try {
      await updateMemoryDayLocations(date, {
        locations: locations.map(({ provinceCode, districtCode }) => ({
          provinceCode,
          districtCode,
        })),
      });
      onSaved();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Günün rotası güncellenemedi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root
      open={Boolean(date)}
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="composer-backdrop" />
        <Dialog.Viewport className="composer-viewport">
          {date ? (
            <Dialog.Popup className="composer-dialog">
              <header className="composer-header">
                <div>
                  <p className="eyebrow">{dateLabel}</p>
                  <Dialog.Title className="mt-1 font-handwriting text-4xl leading-none text-accent-ink">
                    Günün rotasını düzenle
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                    Bu rota, o güne ait bütün fotoğraf, video ve notlar tarafından ortak
                    kullanılır.
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  className="composer-close"
                  aria-label="Günün rota düzenleme penceresini kapat"
                  disabled={saving}
                >
                  <X />
                </Dialog.Close>
              </header>

              <form className="composer-form" onSubmit={submit}>
                <MemoryLocationEditor
                  value={locations}
                  onChange={setLocations}
                  disabled={saving}
                />

                {error ? (
                  <p className="composer-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="composer-actions">
                  <Dialog.Close
                    render={<Button type="button" variant="ghost" disabled={saving} />}
                  >
                    Vazgeç
                  </Dialog.Close>
                  <Button type="submit" disabled={saving}>
                    {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
                    {saving ? "Kaydediliyor…" : "Rotayı kaydet"}
                  </Button>
                </div>
              </form>
            </Dialog.Popup>
          ) : null}
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
