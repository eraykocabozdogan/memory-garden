"use client";

import { CalendarDays, ChevronLeft, ChevronRight, LogOut, Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { TurkeyLocationSelection } from "@/features/locations/turkey-locations";
import { cn } from "@/lib/utils";
import { locationsByDate as mockLocationsByDate, memoryItems as mockMemoryItems } from "./mock-data";
import {
  buildMemoryDays,
  cursorFromIso,
  formatCursor,
  getDaysForRange,
  getItemsForRange,
  hasActiveMediaProcessing,
  shiftCursor,
} from "./memory-selectors";
import { Brand, DesktopSidebar, MobileNav, ThemeControl } from "./memory-navigation";
import type { CalendarView, DateCursor, MemoryDay, MemoryItem, ViewMode } from "./types";
import { DayView } from "./views/day-view";
import { MapView } from "./views/map-view";
import { MemoryGridView } from "./views/memory-grid-view";
import { MemoryComposer } from "./memory-composer";
import { MemoryEditor } from "./memory-editor";
import { MemoryDayLocationEditor } from "./memory-day-location-editor";
import { MediaViewer } from "./media-viewer";

const viewOptions: Array<{ value: ViewMode; label: string }> = [
  { value: "day", label: "Gün" },
  { value: "month", label: "Ay" },
  { value: "year", label: "Yıl" },
  { value: "map", label: "Harita" },
];

const initialCursor: DateCursor = { year: 2026, month: 5, day: 15 };

type MemoriesAppProps = {
  initialItems?: MemoryItem[];
  initialLocationsByDate?: Record<string, MemoryDay["locations"]>;
  initialLocationSelectionsByDate?: Record<string, TurkeyLocationSelection[]>;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canLogout?: boolean;
  memberName?: string;
  memberNames?: string[];
};

export function MemoriesApp({
  initialItems = mockMemoryItems,
  initialLocationsByDate = mockLocationsByDate,
  initialLocationSelectionsByDate = {},
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canLogout = false,
  memberName = "Üye",
  memberNames = [],
}: MemoriesAppProps = {}) {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("month");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState<DateCursor>(initialCursor);
  const [focusedItemId, setFocusedItemId] = useState<string>();
  const [openedMedia, setOpenedMedia] = useState<MemoryItem>();
  const [editingItem, setEditingItem] = useState<MemoryItem>();
  const [editingDayDate, setEditingDayDate] = useState<string>();
  const [deletedItemIds, setDeletedItemIds] = useState<Set<string>>(() => new Set());

  const archiveItems = useMemo(
    () => initialItems.filter((item) => !deletedItemIds.has(item.id)),
    [deletedItemIds, initialItems],
  );
  const hasProcessingMedia = hasActiveMediaProcessing(archiveItems);

  useEffect(() => {
    if (!hasProcessingMedia) return;

    let refreshInterval: ReturnType<typeof setInterval> | undefined;

    function stopRefreshing() {
      if (refreshInterval === undefined) return;
      clearInterval(refreshInterval);
      refreshInterval = undefined;
    }

    function startRefreshing() {
      if (refreshInterval !== undefined || document.visibilityState !== "visible") return;
      refreshInterval = setInterval(() => router.refresh(), 5_000);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        router.refresh();
        startRefreshing();
      } else {
        stopRefreshing();
      }
    }

    startRefreshing();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopRefreshing();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasProcessingMedia, router]);

  const activeCalendarView = view === "map" ? calendarView : view;
  const dateMeta = formatCursor(activeCalendarView, cursor);
  const visibleItems = useMemo(
    () => getItemsForRange(archiveItems, activeCalendarView, cursor),
    [activeCalendarView, archiveItems, cursor],
  );
  const visibleDays = useMemo(
    () => getDaysForRange(archiveItems, activeCalendarView, cursor, initialLocationsByDate),
    [activeCalendarView, archiveItems, cursor, initialLocationsByDate],
  );
  const allDays = useMemo(
    () => buildMemoryDays(archiveItems, initialLocationsByDate),
    [archiveItems, initialLocationsByDate],
  );

  const goToItemDay = useCallback((item: MemoryItem) => {
    if (item.datePrecision !== "day" || !item.date) return;
    setCursor(cursorFromIso(item.date));
    setFocusedItemId(item.id);
    setCalendarView("day");
    setView("day");
  }, []);

  const openItem = useCallback((item: MemoryItem) => {
    if ((item.kind === "photo" || item.kind === "video") && (item.display || item.image)) {
      setOpenedMedia(item);
      return;
    }
    if (item.datePrecision !== "day" && canEdit) {
      setEditingItem(item);
      return;
    }
    goToItemDay(item);
  }, [canEdit, goToItemDay]);

  const openDay = useCallback((day: MemoryDay) => {
    setCursor(cursorFromIso(day.date));
    setFocusedItemId(day.items[0]?.id);
    setCalendarView("day");
    setView("day");
  }, []);

  function selectView(nextView: ViewMode) {
    setView(nextView);
    if (nextView !== "map") setCalendarView(nextView);
    if (nextView !== "day") setFocusedItemId(undefined);
  }

  const selectedDay = allDays.find((day) => day.date === visibleDays[0]?.date);
  const editingDay = allDays.find((day) => day.date === editingDayDate);
  const stepLabel = activeCalendarView === "day" ? "gün" : activeCalendarView === "month" ? "ay" : "yıl";

  return (
    <TooltipProvider>
      <div className="app-shell">
        <DesktopSidebar section="memories" memberNames={memberNames} />
        <main className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="page-header">
            <div className="flex items-center justify-between gap-5 lg:justify-end">
              <div className="lg:hidden"><Brand /></div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">yalnızca ikiniz</span>
                <span className="size-1 rounded-full bg-accent-ink/60" aria-hidden="true" />
                <ThemeControl />
                {canLogout ? (
                  <form action={logout}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Çıkış yap"
                    >
                      <LogOut />
                      <span className="hidden sm:inline">Çıkış</span>
                    </Button>
                  </form>
                ) : null}
                <div className="avatar" aria-label={`${memberName} hesabı`}>
                  {memberName.trim().charAt(0).toLocaleUpperCase("tr-TR")}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Anı arşivi</p>
                <h1 className="mt-1 font-handwriting text-[clamp(3.2rem,7vw,6.6rem)] leading-[0.82] text-accent-ink">
                  Biriktirdiklerimiz
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                  Bir günün bütün küçük parçaları, aynı yerde. Tarihi belirsiz olanlar da kaybolmadan arada.
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                {canCreate ? (
                  <MemoryComposer
                    initialLocationSelectionsByDate={initialLocationSelectionsByDate}
                  />
                ) : null}
                <div className="view-switcher" role="group" aria-label="Anı görünümü">
                  {viewOptions.map((option) => (
                    <button
                      key={option.value}
                      data-testid={`view-${option.value}`}
                      className={cn("view-option", view === option.value && "view-option-active")}
                      aria-pressed={view === option.value}
                      onClick={() => selectView(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <section className="content-wrap" aria-label="Anılar">
            <div className="date-bar">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Önceki ${stepLabel}`}
                  onClick={() => setCursor((current) => shiftCursor(current, activeCalendarView, -1))}
                >
                  <ChevronLeft />
                </Button>
                <div className="min-w-40 text-center" data-testid="date-label">
                  <p className="font-serif text-xl leading-none">{dateMeta.label}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {dateMeta.range}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Sonraki ${stepLabel}`}
                  onClick={() => setCursor((current) => shiftCursor(current, activeCalendarView, 1))}
                >
                  <ChevronRight />
                </Button>
              </div>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                {view === "map" ? <Map className="size-4" /> : <CalendarDays className="size-4" />}
                <span>{visibleItems.length} parça · {visibleDays.length} anı günü</span>
              </div>
            </div>

            {view === "month" || view === "year" ? (
              <MemoryGridView
                items={visibleItems}
                locationsByDate={initialLocationsByDate}
                mode={view}
                onOpen={openItem}
              />
            ) : null}
            {view === "day" ? (
              <DayView
                day={selectedDay}
                focusedItemId={focusedItemId}
                canEdit={canEdit}
                onEdit={setEditingItem}
                onEditRoute={() => selectedDay && setEditingDayDate(selectedDay.date)}
              />
            ) : null}
            {view === "map" ? (
              <MapView days={visibleDays} rangeLabel={dateMeta.label} onOpenDay={openDay} />
            ) : null}
          </section>
        </main>
        <MobileNav section="memories" />
        <MediaViewer
          item={openedMedia}
          onClose={() => setOpenedMedia(undefined)}
          onGoToDay={(item) => {
            setOpenedMedia(undefined);
            goToItemDay(item);
          }}
          onDeleted={(itemId) => {
            setOpenedMedia(undefined);
            setDeletedItemIds((current) => new Set(current).add(itemId));
            router.refresh();
          }}
          canDelete={canDelete}
          canEdit={canEdit}
          onEdit={(item) => {
            setOpenedMedia(undefined);
            setEditingItem(item);
          }}
        />
        <MemoryEditor
          key={editingItem?.id ?? "closed-memory-editor"}
          item={editingItem}
          onClose={() => setEditingItem(undefined)}
          onSaved={() => {
            setEditingItem(undefined);
            router.refresh();
          }}
        />
        <MemoryDayLocationEditor
          key={editingDay?.date ?? "closed-memory-day-location-editor"}
          date={editingDay?.date}
          dateLabel={editingDay?.dateLabel}
          selections={
            editingDay ? (initialLocationSelectionsByDate[editingDay.date] ?? []) : []
          }
          onClose={() => setEditingDayDate(undefined)}
          onSaved={() => {
            setEditingDayDate(undefined);
            router.refresh();
          }}
        />
      </div>
    </TooltipProvider>
  );
}
