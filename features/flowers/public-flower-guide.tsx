import { BookOpenText, Images, LogIn, LogOut, Search, Sprout } from "lucide-react";
import Link from "next/link";

import { logout } from "@/features/auth/actions";
import { ThemeControl } from "@/features/memories/memory-navigation";
import { flowerGuideSessionState } from "./flower-guide-session";

const sources = [
  { author: "Robert Tyas", title: "The Sentiment of Flowers" },
  { author: "Henry Phillips", title: "Floral Emblems" },
  { author: "John H. Ingram", title: "Flora Symbolica" },
  { author: "William Curtis ve ardılları", title: "Curtis's Botanical Magazine" },
];

type PublicFlowerGuideProps = {
  isMember?: boolean;
};

export function PublicFlowerGuide({ isMember = false }: PublicFlowerGuideProps) {
  const sessionState = flowerGuideSessionState(isMember);

  return (
    <main className="flower-guide-shell">
      <header className="flower-guide-header">
        <Link href="/" className="brand-mark" aria-label="İkimize ana sayfa">
          ikimize<span className="brand-dot">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeControl />
          {sessionState.showLogin ? (
            <Link href="/login" className="flower-login-link">
              <LogIn />
              <span>Giriş</span>
            </Link>
          ) : null}
          {sessionState.showMemberControls ? (
            <>
              <Link href="/memories" className="flower-login-link">
                <Images />
                <span>Anılara dön</span>
              </Link>
              <form action={logout}>
                <button type="submit" className="flower-login-link">
                  <LogOut />
                  <span>Çıkış</span>
                </button>
              </form>
            </>
          ) : null}
        </div>
      </header>

      <section className="flower-book" aria-labelledby="flower-guide-title">
        <div className="flower-book-spine" aria-hidden="true" />
        <div className="flower-book-page flower-book-page-left">
          <p className="eyebrow">Herkese açık</p>
          <h1 id="flower-guide-title" className="flower-guide-title">
            Çiçeklerin<br />sakladığı sözler
          </h1>
          <p className="flower-guide-intro">
            Tarihsel anlatılar, semboller ve Curtis&apos;s Botanical Magazine çizimleriyle
            hazırlanmış sade bir rehber.
          </p>
          <div className="flower-search-shell" aria-label="Çiçek arama yakında açılacak">
            <Search />
            <span>Çiçeklerde ara</span>
            <small>yakında</small>
          </div>
          <div className="flower-ornament" aria-hidden="true">
            <Sprout />
          </div>
        </div>

        <div className="flower-book-page flower-book-page-right">
          <div>
            <p className="eyebrow">Kaynak kitaplar</p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight">Dört eski kaynak, tek rehber</h2>
          </div>
          <ol className="flower-source-list">
            {sources.map((source, index) => (
              <li key={source.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{source.title}</strong>
                  <small>{source.author}</small>
                </div>
              </li>
            ))}
          </ol>
          <p className="flower-book-note">
            <BookOpenText />
            Yalnızca gerçekten çiçek olan girdiler yer alacak; her anlam kendi tarihsel
            bağlamıyla anlatılacak.
          </p>
        </div>
      </section>
    </main>
  );
}
