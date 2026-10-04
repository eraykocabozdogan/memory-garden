"use client";

import { ArrowDown, ArrowUp, GripVertical, MapPin, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  turkeyProvinces,
  type TurkeyLocationSelection,
} from "@/features/locations/turkey-locations";

export type MemoryLocationDraft = TurkeyLocationSelection & { key: string };

type MemoryLocationEditorProps = {
  value: MemoryLocationDraft[];
  onChange: (value: MemoryLocationDraft[]) => void;
  disabled?: boolean;
};

function move<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function MemoryLocationEditor({
  value,
  onChange,
  disabled = false,
}: MemoryLocationEditorProps) {
  function update(index: number, selection: Partial<TurkeyLocationSelection>) {
    onChange(
      value.map((location, locationIndex) =>
        locationIndex === index ? { ...location, ...selection } : location,
      ),
    );
  }

  return (
    <fieldset className="composer-locations" disabled={disabled}>
      <legend className="sr-only">Günün rotası</legend>
      <div className="composer-locations-heading">
        <div>
          <p className="composer-locations-title">Günün rotası</p>
          <p>Opsiyonel. Sıra, yolculuğun başlangıcından bitişine doğrudur.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...value,
              { key: crypto.randomUUID(), provinceCode: "", districtCode: undefined },
            ])
          }
        >
          <Plus />
          Konum ekle
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="composer-locations-empty">
          <MapPin />
          <span>Bu gün için henüz konum yok.</span>
        </div>
      ) : (
        <ol className="composer-location-list" aria-label="Günün konum rotası">
          {value.map((location, index) => {
            const province = turkeyProvinces.find(
              (candidate) => candidate.code === location.provinceCode,
            );

            return (
              <li key={location.key} className="composer-location-stop">
                <div className="composer-location-number" aria-hidden="true">
                  {index + 1}
                </div>
                <GripVertical className="composer-location-grip" aria-hidden="true" />
                <label className="composer-field">
                  <span>İl</span>
                  <select
                    aria-label={`${index + 1}. konumun ili`}
                    value={location.provinceCode}
                    required
                    onChange={(event) =>
                      update(index, {
                        provinceCode: event.target.value,
                        districtCode: undefined,
                      })
                    }
                  >
                    <option value="">İl seç</option>
                    {turkeyProvinces.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="composer-field">
                  <span>İlçe</span>
                  <select
                    aria-label={`${index + 1}. konumun ilçesi`}
                    value={location.districtCode ?? ""}
                    disabled={!province}
                    onChange={(event) =>
                      update(index, { districtCode: event.target.value || undefined })
                    }
                  >
                    <option value="">İlçe seçme (yalnızca il)</option>
                    {province?.districts.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="composer-location-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${index + 1}. konumu yukarı taşı`}
                    disabled={index === 0}
                    onClick={() => onChange(move(value, index, index - 1))}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${index + 1}. konumu aşağı taşı`}
                    disabled={index === value.length - 1}
                    onClick={() => onChange(move(value, index, index + 1))}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${index + 1}. konumu kaldır`}
                    onClick={() => onChange(value.filter((_, locationIndex) => locationIndex !== index))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </fieldset>
  );
}
