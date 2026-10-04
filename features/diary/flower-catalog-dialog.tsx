"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ChevronLeft, ChevronRight, Flower2, Search, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { flowerCatalog, isFlowerId } from "@/features/flowers/catalog";

function searchable(value: string) {
  return value.toLocaleLowerCase("tr-TR");
}

function flowerInitial(name: string) {
  return name.charAt(0).toLocaleUpperCase("tr-TR");
}

const sortedFlowerCatalog = [...flowerCatalog].sort((left, right) =>
  left.name.localeCompare(right.name, "tr-TR"),
);

const flowerInitials = [...new Set(sortedFlowerCatalog.map((flower) => flowerInitial(flower.name)))];

type SelectableFlower = (typeof sortedFlowerCatalog)[number];

type FlowerCatalogDialogProps =
  | { mode: "browse" }
  | {
      mode: "respond";
      entryId: string;
      currentFlowerId?: string;
      onSaveFlower?: (flowerId: string) => void | Promise<void>;
      onSaved: () => void;
    };

type FlowerDetailsProps = {
  flower: SelectableFlower;
  responding: boolean;
  saving: boolean;
  onSave: (flowerId: string) => void;
};

function FlowerDetails({ flower, responding, saving, onSave }: FlowerDetailsProps) {
  return (
    <>
      <p className="diary-flower-path">{flower.path}</p>
      <h2 className="diary-flower-name">{flower.name}</h2>
      <p className="diary-flower-meaning">“{flower.meaning}”</p>

      <div className="diary-flower-narratives">
        {flower.narratives.map((narrative, index) => (
          <div className="diary-flower-narrative" key={`${flower.id}-${index}`}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p>{narrative}</p>
          </div>
        ))}
      </div>

      <p className="diary-flower-context">{flower.context}</p>
      <a
        className="diary-flower-source"
        href={flower.artwork.sourceUrl}
        target="_blank"
        rel="noreferrer"
      >
        Görsel: Curtis&apos;s Botanical Magazine · Wikimedia Commons
      </a>

      {responding ? (
        <Button
          className="diary-flower-save"
          size="lg"
          disabled={saving}
          onClick={() => onSave(flower.id)}
        >
          <Flower2 />
          {saving ? "Bırakılıyor…" : `${flower.name} bırak`}
        </Button>
      ) : null}
    </>
  );
}

const plateVariants = {
  enter: { opacity: 0, scale: 0.985 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.985 },
};

const leafVariants = {
  enter: (direction: number) => ({
    opacity: 0.35,
    rotateY: direction > 0 ? -88 : 88,
  }),
  center: { opacity: 1, rotateY: 0, x: 0 },
  exit: (direction: number) => ({
    opacity: 0.35,
    rotateY: direction > 0 ? 88 : -88,
  }),
};

export function FlowerCatalogDialog(props: FlowerCatalogDialogProps) {
  const responding = props.mode === "respond";
  const currentFlowerId = responding ? props.currentFlowerId : undefined;
  const initialSelectedId = currentFlowerId && isFlowerId(currentFlowerId)
    ? currentFlowerId
    : sortedFlowerCatalog[0].id;
  const initialFlower = sortedFlowerCatalog.find((flower) => flower.id === initialSelectedId)
    ?? sortedFlowerCatalog[0];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [activeInitial, setActiveInitial] = useState(() => flowerInitial(initialFlower.name));
  const [indexOpen, setIndexOpen] = useState(false);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const selectedIndex = sortedFlowerCatalog.findIndex((flower) => flower.id === selectedId);
  const selectedFlower = sortedFlowerCatalog[selectedIndex] ?? sortedFlowerCatalog[0];

  const visibleFlowers = useMemo(() => {
    const normalizedQuery = searchable(query.trim());
    if (normalizedQuery) {
      return sortedFlowerCatalog.filter((flower) =>
        searchable(`${flower.name} ${flower.path} ${flower.meaning}`).includes(normalizedQuery),
      );
    }
    return sortedFlowerCatalog.filter((flower) => flowerInitial(flower.name) === activeInitial);
  }, [activeInitial, query]);

  function selectFlower(flower: SelectableFlower) {
    const nextIndex = sortedFlowerCatalog.findIndex((candidate) => candidate.id === flower.id);
    setDirection(nextIndex >= selectedIndex ? 1 : -1);
    setSelectedId(flower.id);
    setActiveInitial(flowerInitial(flower.name));
    setQuery("");
    setIndexOpen(false);
  }

  function turnPage(turnDirection: -1 | 1) {
    const nextIndex = (selectedIndex + turnDirection + sortedFlowerCatalog.length)
      % sortedFlowerCatalog.length;
    const nextFlower = sortedFlowerCatalog[nextIndex];
    setDirection(turnDirection);
    setSelectedId(nextFlower.id);
    setActiveInitial(flowerInitial(nextFlower.name));
    setQuery("");
  }

  async function saveFlower(flowerId: string) {
    if (!responding) return;

    setSaving(true);
    setError(undefined);
    try {
      if (props.onSaveFlower) {
        await props.onSaveFlower(flowerId);
      } else {
        const response = await fetch(`/api/diary/${props.entryId}/flower`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ flowerId }),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          setError(body?.error ?? "Çiçek bırakılamadı.");
          return;
        }
      }
      setOpen(false);
      props.onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          const nextSelectedId = currentFlowerId && isFlowerId(currentFlowerId)
            ? currentFlowerId
            : sortedFlowerCatalog[0].id;
          const nextFlower = sortedFlowerCatalog.find((flower) => flower.id === nextSelectedId)
            ?? sortedFlowerCatalog[0];
          setSelectedId(nextSelectedId);
          setActiveInitial(flowerInitial(nextFlower.name));
          setQuery("");
          setIndexOpen(false);
          setDirection(1);
          setError(undefined);
        }
      }}
    >
      <Dialog.Trigger
        render={
          <Button
            type="button"
            variant={responding ? (currentFlowerId ? "outline" : "default") : "outline"}
            size={responding ? "sm" : "default"}
          />
        }
      >
        <Flower2 />
        {responding
          ? currentFlowerId
            ? "Çiçeği değiştir"
            : "Çiçek bırak"
          : "Çiçek kataloğu"}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="composer-backdrop" />
        <Dialog.Viewport className="diary-flower-viewport">
          <Dialog.Popup className="diary-flower-dialog">
            <header className="diary-flower-header">
              <div>
                <p className="eyebrow">Çiçeklerin dili · 55 levha</p>
                <Dialog.Title className="mt-1 font-handwriting text-4xl leading-none text-accent-ink sm:text-5xl">
                  {responding ? "Bir çiçek bırak" : "Çiçek kataloğu"}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Harf ayraçları ve sayfalar arasında gezinerek çiçeklerin tarihsel anlamlarını keşfet.
                </Dialog.Description>
              </div>
              <Dialog.Close
                render={<Button type="button" variant="ghost" size="icon" aria-label="Çiçek kataloğunu kapat" />}
              >
                <X />
              </Dialog.Close>
            </header>

            <div className="diary-flower-layout">
              <aside className="diary-flower-index" aria-label="Alfabetik çiçek menüsü">
                <button
                  type="button"
                  className="diary-flower-index-search"
                  aria-label="Çiçek menüsünü aç"
                  aria-expanded={indexOpen}
                  onClick={() => setIndexOpen((current) => !current)}
                >
                  <Search />
                </button>
                <nav className="diary-flower-tabs" aria-label="Çiçek harf ayraçları">
                  {flowerInitials.map((initial) => (
                    <button
                      key={initial}
                      type="button"
                      className={initial === activeInitial ? "diary-flower-tab diary-flower-tab-active" : "diary-flower-tab"}
                      aria-label={`${initial} harfi`}
                      aria-pressed={initial === activeInitial}
                      aria-expanded={indexOpen && initial === activeInitial}
                      onClick={() => {
                        setActiveInitial(initial);
                        setQuery("");
                        setIndexOpen(true);
                      }}
                    >
                      {initial}
                    </button>
                  ))}
                </nav>
              </aside>

              <AnimatePresence>
                {indexOpen ? (
                  <motion.aside
                    className="diary-flower-index-panel"
                    aria-label="Çiçek listesi"
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="diary-flower-index-panel-heading">
                      <strong>{query ? "Arama" : `${activeInitial} harfi`}</strong>
                      <button type="button" aria-label="Çiçek menüsünü kapat" onClick={() => setIndexOpen(false)}>
                        <X />
                      </button>
                    </div>
                    <label className="diary-flower-search">
                      <Search aria-hidden="true" />
                      <span className="sr-only">Çiçeklerde ara</span>
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Çiçek veya anlam ara"
                      />
                    </label>
                    <p className="diary-flower-index-count">{visibleFlowers.length} çiçek</p>
                    <div className="diary-flower-list">
                      {visibleFlowers.map((flower) => (
                        <button
                          key={flower.id}
                          type="button"
                          data-flower-id={flower.id}
                          className={selectedId === flower.id ? "diary-flower-option diary-flower-option-selected" : "diary-flower-option"}
                          aria-pressed={selectedId === flower.id}
                          onClick={() => selectFlower(flower)}
                        >
                          <span className="diary-flower-thumbnail" aria-hidden="true">
                            <Image src={flower.artwork.src} alt="" fill sizes="42px" />
                          </span>
                          <span className="min-w-0">
                            <strong>{flower.name}</strong>
                            <small>{flower.meaning}</small>
                          </span>
                        </button>
                      ))}
                      {visibleFlowers.length === 0 ? (
                        <p className="diary-flower-no-results">Bu aramayla eşleşen çiçek yok.</p>
                      ) : null}
                    </div>
                  </motion.aside>
                ) : null}
              </AnimatePresence>

              <section className="diary-flower-book-shell" aria-live="polite">
                <MotionConfig reducedMotion="user">
                  <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                      key={selectedId}
                      className="diary-flower-spread"
                      data-page-direction={direction > 0 ? "forward" : "backward"}
                      custom={direction}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      <motion.article
                        className="diary-flower-page diary-flower-plate-page"
                        data-testid="flower-plate-page"
                        variants={plateVariants}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        <div className="diary-flower-page-heading">
                          <p className="eyebrow">Curtis arşivi · Levha {String(selectedIndex + 1).padStart(2, "0")}</p>
                          <span className="diary-flower-page-number" aria-hidden="true">
                            {String(selectedIndex + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <figure className="diary-flower-artwork diary-flower-artwork-plate">
                          <Image
                            src={selectedFlower.artwork.src}
                            alt={`${selectedFlower.name}, Curtis's Botanical Magazine çizimi`}
                            fill
                            priority
                            sizes="46vw"
                          />
                        </figure>
                        <div className="diary-flower-plate-caption">
                          <p>{selectedFlower.path}</p>
                          <strong>{selectedFlower.name}</strong>
                        </div>
                      </motion.article>

                      <motion.article
                        className="diary-flower-page diary-flower-copy-page"
                        data-testid="flower-copy-page"
                        data-turning-leaf=""
                        custom={direction}
                        variants={leafVariants}
                        transition={{ duration: 0.42, ease: [0.65, 0, 0.35, 1] }}
                      >
                        <div className="diary-flower-page-heading">
                          <p className="eyebrow">Çiçeklerin dili</p>
                          <span className="diary-flower-page-number" aria-hidden="true">
                            {String(selectedIndex + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <FlowerDetails
                          flower={selectedFlower}
                          responding={responding}
                          saving={saving}
                          onSave={saveFlower}
                        />
                      </motion.article>

                      <motion.article
                        className="diary-flower-page diary-flower-mobile-page"
                        data-testid="flower-mobile-page"
                        data-turning-leaf=""
                        custom={direction}
                        variants={leafVariants}
                        transition={{ duration: 0.36, ease: [0.65, 0, 0.35, 1] }}
                      >
                        <div className="diary-flower-page-heading">
                          <p className="eyebrow">Curtis arşivi · Levha {String(selectedIndex + 1).padStart(2, "0")}</p>
                          <span className="diary-flower-page-number" aria-hidden="true">
                            {String(selectedIndex + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <figure className="diary-flower-artwork diary-flower-artwork-mobile">
                          <Image
                            src={selectedFlower.artwork.src}
                            alt={`${selectedFlower.name}, Curtis's Botanical Magazine çizimi`}
                            fill
                            priority
                            sizes="calc(100vw - 5rem)"
                          />
                        </figure>
                        <FlowerDetails
                          flower={selectedFlower}
                          responding={responding}
                          saving={saving}
                          onSave={saveFlower}
                        />
                      </motion.article>
                    </motion.div>
                  </AnimatePresence>
                </MotionConfig>

                <nav className="diary-flower-pagination" aria-label="Katalog sayfaları">
                  <Button type="button" variant="ghost" onClick={() => turnPage(-1)} aria-label="Önceki sayfa">
                    <ChevronLeft />
                    <span>Önceki</span>
                  </Button>
                  <span>{selectedIndex + 1} / {sortedFlowerCatalog.length}</span>
                  <Button type="button" variant="ghost" onClick={() => turnPage(1)} aria-label="Sonraki sayfa">
                    <span>Sonraki</span>
                    <ChevronRight />
                  </Button>
                </nav>

                {error ? <p className="diary-flower-error" role="alert">{error}</p> : null}
              </section>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
