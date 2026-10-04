# Memory Garden: a private shared memory space for two

A private web app for a couple. It has two parts:

- **Memories:** a shared timeline of multimedia "memory days". Each package can hold
  up to 20 mixed photos, videos and text notes (5 GB total), with day, month, year or no
  date precision and one or more Turkish province/district locations shown on a map.
- **Diary garden:** short diary entries that stay visible to the partner for
  24 hours. The partner answers by leaving a flower from a 61-entry catalog
  illustrated with public-domain plates from Curtis's Botanical Magazine. The flowers persist as a growing garden.

Personal media is never stored in this repository. It lives in a private R2 bucket
behind signed, short-lived URLs.

## Architecture

```
Browser ──(signed multipart upload)──► Cloudflare R2  incoming/
   │                                         ▲
   ▼                                         │ short-lived per-part URLs
Next.js 16 app (Vercel) ──dispatch──► Cloud Run Job: media-worker
   │  Supabase Auth + Postgres (Drizzle)        ffmpeg / WebP / H.264, HDR→SDR
   ◄────────────── signed callback ─────────────┘
```

- **App:** Next.js 16 (App Router, React 19), TypeScript, Tailwind 4, shadcn/Base UI,
  Motion, MapLibre GL.
- **Auth/DB:** Supabase Auth with a two-member allow-list. Postgres schema and
  migrations are managed with Drizzle ORM.
- **Uploads:** browser → R2 multipart uploads (two files in flight), verified by
  signed upload tokens. Memory items and media rows are inserted in one short
  transaction, and processing is dispatched only after commit.
- **Media worker:** a Cloud Run Job container that normalizes each asset into a
  full-size WebP or H.264/AAC MP4 plus a 720px preview, and tone-maps HDR
  (BT.2020 PQ/HLG) video to SDR. It receives only a short-lived job token, never
  database or permanent storage credentials. Keyless GCP auth uses Vercel OIDC and
  Workload Identity Federation. See [`docs/media-processing.md`](docs/media-processing.md).
- **Tests:** Playwright end-to-end tests in `tests/e2e`.

## Run locally

```bash
cp .env.example .env.local   # fill in Supabase, R2 and GCP values
npm install
npm run db:migrate
npm run dev
```

Members sign in with a username that maps to a Supabase Auth email. Set your two
usernames in `features/auth/login-identity.ts` and create matching users in Supabase.
`/prototype` and `/prototype/diary` render the UI with mock data and need no backend.

> This is the public source of an app I use privately. Personal data, credentials and
> research material are not part of this repository.
