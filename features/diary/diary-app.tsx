"use client";

import { BookOpenText, Clock3, LogOut, Pencil, Plus, Sprout, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions";
import { getFlowerById } from "@/features/flowers/catalog";
import { Brand, DesktopSidebar, MobileNav, ThemeControl } from "@/features/memories/memory-navigation";
import { formatDiaryTimeRemaining } from "./diary-policy";
import { DiaryGarden } from "./diary-garden";
import { FlowerCatalogDialog } from "./flower-catalog-dialog";
import type { DiaryEntry, DiaryFlowerResponse, DiaryGardenFlower } from "./types";

type DiaryAppProps = {
  initialEntries: DiaryEntry[];
  initialGardenFlowers?: DiaryGardenFlower[];
  memberName: string;
  initialNow: string;
  flowerResponsePersistence?: "server" | "local";
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

async function responseError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? fallback;
}

export function DiaryApp({
  initialEntries,
  initialGardenFlowers = [],
  memberName,
  initialNow,
  flowerResponsePersistence = "server",
}: DiaryAppProps) {
  const router = useRouter();
  const [view, setView] = useState<"diary" | "garden">("diary");
  const [now, setNow] = useState(() => new Date(initialNow));
  const [localFlowerResponses, setLocalFlowerResponses] = useState<Record<string, DiaryFlowerResponse>>({});
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string>();
  const [editingContent, setEditingContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const entries = useMemo(() => {
    if (flowerResponsePersistence === "server") return initialEntries;
    return initialEntries.map((entry) => {
      const localFlowerResponse = localFlowerResponses[entry.id];
      return localFlowerResponse ? { ...entry, flowerResponse: localFlowerResponse } : entry;
    });
  }, [flowerResponsePersistence, initialEntries, localFlowerResponses]);

  const partnerEntries = useMemo(
    () => entries.filter((entry) => !entry.isOwn && new Date(entry.expiresAt) > now),
    [entries, now],
  );
  const ownEntries = useMemo(
    () => entries.filter((entry) => entry.isOwn),
    [entries],
  );

  const gardenFlowers = useMemo(() => {
    if (flowerResponsePersistence === "server") return initialGardenFlowers;
    return entries.flatMap((entry): DiaryGardenFlower[] => entry.flowerResponse
      ? [{
          entryId: entry.id,
          flowerId: entry.flowerResponse.flowerId,
          plantedAt: entry.flowerResponse.createdAt ?? entry.flowerResponse.updatedAt,
        }]
      : []);
  }, [entries, flowerResponsePersistence, initialGardenFlowers]);

  function saveLocalFlowerResponse(entryId: string, flowerId: string) {
    setLocalFlowerResponses((current) => ({
      ...current,
      [entryId]: {
        flowerId,
        responderId: "prototype-member",
        createdAt: current[entryId]?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  async function createEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent) return;

    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: nextContent }),
      });
      if (!response.ok) {
        setError(await responseError(response, "Günlük yayımlanamadı."));
        return;
      }
      setContent("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function updateEntry(entryId: string) {
    const nextContent = editingContent.trim();
    if (!nextContent) return;
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/diary/${entryId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: nextContent }),
      });
      if (!response.ok) {
        setError(await responseError(response, "Günlük güncellenemedi."));
        return;
      }
      setEditingId(undefined);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(entryId: string) {
    if (!window.confirm("Bu günlük girdisi silinsin mi?")) return;
    setSaving(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/diary/${entryId}`, { method: "DELETE" });
      if (!response.ok) {
        setError(await responseError(response, "Günlük silinemedi."));
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function entryCard(entry: DiaryEntry) {
    const active = new Date(entry.expiresAt) > now;
    const flower = entry.flowerResponse ? getFlowerById(entry.flowerResponse.flowerId) : undefined;
    const editing = editingId === entry.id;

    return (
      <article key={entry.id} className="diary-entry-card" data-testid={`diary-entry-${entry.id}`}>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{entry.isOwn ? "Senin günlüğün" : `${entry.authorName} yazdı`}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(entry.publishedAt)}</p>
          </div>
          <span className={active ? "diary-time diary-time-active" : "diary-time"}>
            <Clock3 />
            {entry.isOwn && !active
              ? "Artık yalnızca sende"
              : formatDiaryTimeRemaining(entry.expiresAt, now)}
          </span>
        </header>

        {editing ? (
          <div className="mt-6">
            <label className="sr-only" htmlFor={`edit-diary-${entry.id}`}>Günlük metnini düzenle</label>
            <textarea
              id={`edit-diary-${entry.id}`}
              className="diary-textarea"
              value={editingContent}
              onChange={(event) => setEditingContent(event.target.value)}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingId(undefined)}>Vazgeç</Button>
              <Button type="button" disabled={saving || !editingContent.trim()} onClick={() => updateEntry(entry.id)}>
                Kaydet
              </Button>
            </div>
          </div>
        ) : (
          <p className="diary-entry-content">{entry.content}</p>
        )}

        {flower ? (
          <div className="diary-response" aria-label={`Bırakılan çiçek: ${flower.name}`}>
            <span className="diary-response-flower" aria-hidden="true">
              {flower.artwork ? <Image src={flower.artwork.src} alt="" fill sizes="48px" /> : "❀"}
            </span>
            <div>
              <p className="font-handwriting text-3xl leading-none text-accent-ink">{flower.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{flower.meaning}</p>
            </div>
          </div>
        ) : null}

        <footer className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
          {entry.isOwn && active && !editing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingId(entry.id);
                  setEditingContent(entry.content);
                }}
              >
                <Pencil />Düzenle
              </Button>
              <Button type="button" variant="destructive" size="sm" disabled={saving} onClick={() => deleteEntry(entry.id)}>
                <Trash2 />Sil
              </Button>
            </>
          ) : null}
          {!entry.isOwn && active ? (
            <FlowerCatalogDialog
              mode="respond"
              entryId={entry.id}
              currentFlowerId={entry.flowerResponse?.flowerId}
              onSaveFlower={flowerResponsePersistence === "local"
                ? (flowerId) => saveLocalFlowerResponse(entry.id, flowerId)
                : undefined}
              onSaved={() => {
                if (flowerResponsePersistence === "server") router.refresh();
              }}
            />
          ) : null}
        </footer>
      </article>
    );
  }

  return (
    <div className="app-shell">
      <DesktopSidebar section="diary" />
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">
        <header className="page-header">
          <div className="flex items-center justify-between gap-5 lg:justify-end">
            <div className="lg:hidden"><Brand /></div>
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground sm:inline">yalnızca ikiniz</span>
              <span className="size-1 rounded-full bg-accent-ink/60" aria-hidden="true" />
              <ThemeControl />
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" aria-label="Çıkış yap">
                  <LogOut /><span className="hidden sm:inline">Çıkış</span>
                </Button>
              </form>
              <div className="avatar" aria-label={`${memberName} hesabı`}>
                {memberName.trim().charAt(0).toLocaleUpperCase("tr-TR")}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <p className="eyebrow">{view === "diary" ? "Yirmi dört saatlik bir pencere" : "Kalıcı ortak bahçeniz"}</p>
            <h1 className="mt-1 font-handwriting text-[clamp(3.5rem,8vw,7rem)] leading-[0.82] text-accent-ink">
              {view === "diary" ? "Bugün içimden geçenler" : "Bahçemiz"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              {view === "diary"
                ? "Yazdıkların karşı tarafa yayımlandığı andan itibaren 24 saat görünür. Cevabı kelimeler değil, seçtiği çiçek taşır."
                : "Günlükler 24 saat sonra kapanır; bırakılan çiçekler 30 Ağustos 2026’dan başlayarak burada kalır."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="view-switcher" role="tablist" aria-label="Günlük görünümü">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "diary"}
                  className={view === "diary" ? "view-option view-option-active" : "view-option"}
                  onClick={() => setView("diary")}
                >
                  <BookOpenText /> Günlük
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "garden"}
                  className={view === "garden" ? "view-option view-option-active" : "view-option"}
                  onClick={() => setView("garden")}
                >
                  <Sprout /> Bahçe
                </button>
              </div>
              <FlowerCatalogDialog mode="browse" />
            </div>
          </div>
        </header>

        <div className="diary-content">
          {view === "garden" ? (
            <DiaryGarden flowers={gardenFlowers} now={now.toISOString()} />
          ) : (
            <>
          <form className="diary-composer" onSubmit={createEntry}>
            <div className="flex items-center gap-3">
              <span className="diary-composer-icon" aria-hidden="true"><BookOpenText /></span>
              <div>
                <h2 className="font-serif text-xl">Yeni bir günlük bırak</h2>
                <p className="mt-1 text-xs text-muted-foreground">Yayımlandığı anda 24 saat başlar.</p>
              </div>
            </div>
            <label className="sr-only" htmlFor="new-diary-content">Günlük metni</label>
            <textarea
              id="new-diary-content"
              className="diary-textarea mt-5"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Bugün sana anlatmak istediğim…"
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">Yorum alanı yok; yalnızca çiçek bırakılabilir.</p>
              <Button type="submit" size="lg" disabled={saving || !content.trim()}>
                <Plus />{saving ? "Yayımlanıyor…" : "Günlüğü yayımla"}
              </Button>
            </div>
          </form>

          {error ? <p className="diary-error" role="alert">{error}</p> : null}

          <section aria-labelledby="partner-diary-heading">
            <div className="diary-section-heading">
              <div>
                <p className="eyebrow">Okuma penceresi</p>
                <h2 id="partner-diary-heading" className="font-handwriting text-4xl leading-none text-accent-ink">Ondan gelenler</h2>
              </div>
              <span className="text-xs text-muted-foreground">{partnerEntries.length} aktif günlük</span>
            </div>
            <div className="diary-grid">
              {partnerEntries.length > 0 ? partnerEntries.map(entryCard) : (
                <div className="diary-empty">
                  <BookOpenText />
                  <p className="font-serif text-lg">Şimdilik açık bir günlük yok.</p>
                  <p>Yeni bir şey yazıldığında burada 24 saat boyunca görünecek.</p>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="own-diary-heading">
            <div className="diary-section-heading">
              <div>
                <p className="eyebrow">Sende kalanlar</p>
                <h2 id="own-diary-heading" className="font-handwriting text-4xl leading-none text-accent-ink">Benim günlüklerim</h2>
              </div>
              <span className="text-xs text-muted-foreground">{ownEntries.length} günlük</span>
            </div>
            <div className="diary-grid">
              {ownEntries.length > 0 ? ownEntries.map(entryCard) : (
                <div className="diary-empty">
                  <BookOpenText />
                  <p className="font-serif text-lg">Henüz bir günlük bırakmadın.</p>
                  <p>İlk satırın yukarıdaki boş sayfada seni bekliyor.</p>
                </div>
              )}
            </div>
          </section>
            </>
          )}
        </div>
      </main>
      <MobileNav section="diary" />
    </div>
  );
}
