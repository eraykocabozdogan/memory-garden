"use client";

import { Dialog } from "@base-ui/react/dialog";
import { LoaderCircle, Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { DatePrecision, MemoryItem } from "./types";
import { updateMemory } from "./update-memory";

const precisionOptions: Array<{ value: DatePrecision; label: string }> = [
  { value: "none", label: "Tarih yok" },
  { value: "year", label: "Yalnızca yıl" },
  { value: "month", label: "Ay ve yıl" },
  { value: "day", label: "Gün, ay ve yıl" },
];

function dateInputType(precision: DatePrecision) {
  if (precision === "day") return "date";
  if (precision === "month") return "month";
  return "text";
}

type MemoryEditorProps = {
  item?: MemoryItem;
  onClose: () => void;
  onSaved: () => void;
};

export function MemoryEditor({
  item,
  onClose,
  onSaved,
}: MemoryEditorProps) {
  const initialDate = item?.date ?? "";
  const [precision, setPrecision] = useState<DatePrecision>(item?.datePrecision ?? "none");
  const [date, setDate] = useState(initialDate);
  const [text, setText] = useState(item?.body ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;

    setSaving(true);
    setError(undefined);
    try {
      await updateMemory(item.id, {
        datePrecision: precision,
        date: precision === "none" ? undefined : date,
        textContent: item.kind === "text" ? text : undefined,
      });
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Anı güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="composer-backdrop" />
        <Dialog.Viewport className="composer-viewport">
          {item ? (
            <Dialog.Popup className="composer-dialog">
              <header className="composer-header">
                <div>
                  <p className="eyebrow">{item.title}</p>
                  <Dialog.Title className="mt-1 font-handwriting text-4xl leading-none text-accent-ink">
                    Anıyı düzenle
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-muted-foreground">
                    Bu parçanın tarihini ve varsa metnini değiştir. Günün ortak rotası,
                    günlük görünümünden ayrıca düzenlenir.
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  className="composer-close"
                  aria-label="Anı düzenleme penceresini kapat"
                  disabled={saving}
                >
                  <X />
                </Dialog.Close>
              </header>

              <form className="composer-form" onSubmit={submit}>
                {item.kind === "text" ? (
                  <label className="composer-field">
                    <span>Metin</span>
                    <textarea
                      aria-label="Metin"
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      rows={7}
                      required
                      disabled={saving}
                    />
                  </label>
                ) : null}

                <div className="composer-date-row">
                  <label className="composer-field">
                    <span>Tarih hassasiyeti</span>
                    <select
                      value={precision}
                      onChange={(event) => {
                        setPrecision(event.target.value as DatePrecision);
                        setDate("");
                      }}
                      disabled={saving}
                    >
                      {precisionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {precision !== "none" ? (
                    <label className="composer-field">
                      <span>{precision === "year" ? "Yıl" : "Tarih"}</span>
                      <input
                        aria-label={precision === "year" ? "Yıl" : "Tarih"}
                        type={dateInputType(precision)}
                        inputMode={precision === "year" ? "numeric" : undefined}
                        pattern={precision === "year" ? "[0-9]{4}" : undefined}
                        placeholder={precision === "year" ? "2026" : undefined}
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        required
                        disabled={saving}
                      />
                    </label>
                  ) : null}
                </div>

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
                    {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
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
