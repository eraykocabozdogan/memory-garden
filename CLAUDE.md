# Memory Garden: Claude için çalışma talimatları

## Önce bunları oku (bu sırayla)

1. `docs/handoff.md`: nerede kaldık, sıradaki adımlar, bekleyen işler
2. `docs/decisions.md`: tüm kararlar, seçenekleri ve gerekçeleri
3. `docs/architecture.md`: kararların teknik karşılığı

## Projenin durumu

Memory Garden, Cloudflare üzerinde sıfırdan yeniden yazılıyor. Planlama bitti, mimari onaylandı.
Eski Next.js + Supabase + Vercel sürümü Aşama 0'da silindi (git geçmişinde ve `v0-nextjs`
etiketinde duruyor). Güncel durum ve sıradaki aşama `docs/handoff.md`'de.

## Çalışma modeli (proje sahibinin açık isteği, mutlaka uy)

- **Kararlar proje sahibine ait.** Claude bir soyutlama katmanı olarak çalışır: bilgiyi toplar,
  seçenekleri karşılaştırır, sunar; seçimi proje sahibi yapar. Onay olmadan teknoloji seçme,
  kapsam değiştirme ya da kod yazma.
- **Her kararı şu formatta sun:** konu ve neden önemli olduğu; 2–4 seçenek (ne olduğu, artısı,
  eksisi, maliyeti, sonraki kararlara etkisi); Claude'un önerisi ayrı ve açıkça işaretli.
  Alt soruları numaralandır (örneğin 5a, T3) ki kısa cevap verilebilsin ("hepsinde önerine uy",
  "T4 a").
- **Her kararı `docs/decisions.md`'ye işle** (seçenekler, seçim, gerekçe); mimariyi etkiliyorsa
  `docs/architecture.md`'yi de güncelle. Sonra commit + push.
- **Kod aşama aşama yazılır** (`docs/architecture.md` §13). Her aşama testleriyle birlikte
  teslim edilir, proje sahibi görüp onaylar.
- Uygulama sırasında karar kaydında olmayan, ürünü etkileyen bir seçim çıkarsa durup sor.
  Ürünü etkilemeyen küçük teknik seçimler için `docs/architecture.md` §15'teki varsayılanları kullan.

## İletişim

- **Türkçe**, sade dil, "sen" hitabı.
- Teknik terimleri ilk kullanımda kısaca açıkla (proje sahibi örneğin shadcn'i, PWA'yı, SSR'yi
  ilk kez bu süreçte öğrendi). Benzetmeler işe yarıyor.
- Yanlış anlaşılma varsa nazikçe düzelt.
- Proje sahibinin öncelikleri: uzun vadede düşük maliyet, yalnızca Cloudflare, ve projenin CV'de
  İK'lar ile mülakatçılara gösterilebilmesi.

## Teknik özet

- Cloudflare Workers (Paid plan), React Router v8 SPA + prerender, Hono + Hono RPC, Zod,
  TanStack Query, D1 + Drizzle, Better Auth, R2, Queues, Cloudflare Images, Containers (ffmpeg),
  Durable Objects (demo), pnpm monorepo (`apps/web`, `apps/media`, `packages/shared`), Biome,
  Vitest + Playwright + Lighthouse CI, GitHub Actions.
- Adresler: `memory-garden.erayai.workers.dev`, `memory-garden-demo.erayai.workers.dev`.
- D1 interaktif transaction desteklemez: çok adımlı yazmalar `batch()` ile.
- Worker'ı Wrangler paketler (Vite eklentisi değil); geliştirmede `pnpm dev` iki süreci birlikte
  başlatır. Komutlar: `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`.
- Bu bulut ortamında Playwright için `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`
  kullan (önceden kurulu tarayıcı).
