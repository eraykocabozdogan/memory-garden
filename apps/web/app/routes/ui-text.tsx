import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/ui-text";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Yazı animasyonu önizlemesi · Memory Garden" },
    { name: "robots", content: "noindex" },
  ];
}

// Design-system preview (stage 2, decision 9): every text-animation candidate, side by side on
// the real type scale, so they can be judged on the owner's tablet. The effects are plain CSS
// (`app/text-anim.css`); nothing is installed for them. "Tekrar oynat" remounts a card, which
// restarts its animation. The losing candidates get deleted once the choice is made.

/** Splits text into spans that carry their own stagger index. */
function Staggered({
  text,
  by,
  className,
}: {
  text: string;
  by: "word" | "letter";
  className: string;
}) {
  const parts = by === "word" ? text.split(" ") : [...text];
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: constant text, and the index is the stagger step.
          key={`${part}-${i}`}
          style={{ "--i": i } as React.CSSProperties}
          className="inline-block whitespace-pre"
        >
          {part}
          {by === "word" && i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/** 9-5: counts up to the target once, then holds it. */
function CountUp({ to, suffix }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease out, so the last digits settle instead of snapping.
      setValue(Math.round(to * (1 - (1 - t) ** 3)));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [to]);
  return (
    <span className="font-heading text-5xl font-semibold tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

const HEADING = "Bahçende 47 anı açtı";
const HAND = "Her anı bir çiçek…";
const BODY = "Kuşadası'nda sabah, denizin rengi daha uyanmamıştı.";

type Candidate = {
  id: string;
  title: string;
  note: string;
  render: () => React.ReactNode;
};

const CANDIDATES: Candidate[] = [
  {
    id: "9-1",
    title: "9-1 · Animasyon yok",
    note: "Metin doğrudan görünür. Karşılaştırma için ölçü noktası.",
    render: () => (
      <>
        <p className="font-heading text-3xl">{HEADING}</p>
        <p className="text-muted-foreground">{BODY}</p>
      </>
    ),
  },
  {
    id: "9-2",
    title: "9-2 · Yumuşak beliriş",
    note: "Kelimeler sırayla, hafifçe yukarı kayarak beliriyor (380 ms).",
    render: () => (
      <>
        <Staggered text={HEADING} by="word" className="anim-beliris font-heading text-3xl" />
        <Staggered text={BODY} by="word" className="anim-beliris text-muted-foreground" />
      </>
    ),
  },
  {
    id: "9-3",
    title: "9-3 · El yazısı yazılıyor",
    note: "Kalem soldan sağa yazıyormuş gibi. Yalnızca el yazısı notlar için.",
    render: () => <p className="anim-elyazisi font-hand text-4xl text-muted-foreground">{HAND}</p>,
  },
  {
    id: "9-4a",
    title: "9-4a · Harf harf",
    note: "React Bits'in Split Text'i gibi: her harf ayrı ayrı yükseliyor.",
    render: () => (
      <Staggered text={HEADING} by="letter" className="anim-harf font-heading text-3xl" />
    ),
  },
  {
    id: "9-4b",
    title: "9-4b · Bulanıktan netleşme",
    note: "React Bits'in Blur Text'i gibi: kelimeler bulanıktan netleşiyor.",
    render: () => (
      <Staggered text={HEADING} by="word" className="anim-bulanik font-heading text-3xl" />
    ),
  },
  {
    id: "9-4c",
    title: "9-4c · Daktilo",
    note: "React Bits'in Text Type'ı gibi: harfler yazılıyor, imleç yanıp sönüyor.",
    render: () => (
      <p
        className="anim-daktilo font-heading text-3xl"
        style={{ "--chars": HEADING.length } as React.CSSProperties}
      >
        {HEADING}
      </p>
    ),
  },
  {
    id: "9-4d",
    title: "9-4d · Parlama",
    note: "React Bits'in Shiny Text'i gibi: ışık harflerin üzerinden sürekli geçiyor.",
    render: () => <p className="anim-parlama font-heading text-3xl">{HEADING}</p>,
  },
  {
    id: "9-4e",
    title: "9-4e · Dönen kelime",
    note: "React Bits'in Rotating Text'i gibi: son kelime sırayla değişiyor.",
    render: () => (
      <p className="font-heading text-3xl">
        Bugün bahçende{" "}
        <span className="anim-donen relative inline-grid align-bottom">
          {["gül", "leylak", "menekşe"].map((word, i) => (
            <span
              key={word}
              style={{ "--i": i, "--n": 3 } as React.CSSProperties}
              className="col-start-1 row-start-1 text-primary"
            >
              {word}
            </span>
          ))}
        </span>{" "}
        açtı
      </p>
    ),
  },
  {
    id: "9-5",
    title: "9-5 · Sayaç",
    note: "Sayı sıfırdan hedefe akıyor. Geri sayım kartı ve istatistikler için.",
    render: () => (
      <div className="flex items-baseline gap-6">
        <span>
          <CountUp to={47} /> <span className="text-muted-foreground">anı</span>
        </span>
        <span>
          <CountUp to={128} suffix=" gün" />
        </span>
      </div>
    ),
  },
];

export default function UiText() {
  // Bumping the counter remounts the cards, which replays every CSS animation from the start.
  const [run, setRun] = useState(0);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <h1 className="font-heading text-3xl">Yazı animasyonu adayları</h1>
        <p className="text-muted-foreground">
          Karar 9. Hepsi gerçek yazı ölçeğinde; efektler sade CSS, hiçbir paket kurulmadı. "Hareketi
          azalt" açıkken hepsi animasyonsuz son hâlinde görünür.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setRun((n) => n + 1)}>
            Tekrar oynat
          </Button>
          <Button size="sm" variant="ghost" render={<Link to="/ui" />}>
            ← Önizleme
          </Button>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {CANDIDATES.map((candidate) => (
          <Card key={candidate.id} data-testid={`aday-${candidate.id}`}>
            <CardHeader>
              <CardTitle className="text-base">{candidate.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{candidate.note}</p>
            </CardHeader>
            <CardContent key={run} className="grid min-h-28 content-center gap-3">
              {candidate.render()}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
