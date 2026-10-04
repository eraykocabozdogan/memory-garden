# Media processing

The application uploads raw media to R2 under `incoming/`, creates a queued
`media_assets` row, and starts one Google Cloud Run Job execution. The worker
receives a short-lived signed job token, obtains temporary R2 URLs from the
application, uploads normalized display output in fixed-size multipart chunks,
uploads the bounded preview with an explicit content length, and calls the
application back.

The worker never receives database credentials or permanent R2 credentials.
Each display part receives its own short-lived URL after the application verifies
that the processing run is still active. This keeps large outputs out of worker
memory while satisfying R2's content-length requirement.
The application marks verified outputs ready before deleting the raw object.
Failed processing keeps the raw object so a member can retry with a new run ID.

## Memory package contract

The composer sends one `POST /api/memories` request with shared `datePrecision`,
`date`, and `locations` fields plus an ordered `items[]` array. A package may
contain up to 20 mixed photo, video, and text items. Its media files may total no
more than 5,000,000,000 bytes.

The browser uploads at most two media files concurrently. The application
verifies every signed upload token and R2 object before opening one short
Postgres transaction that inserts the ordered memory items and media assets.
Processing jobs are dispatched only after the transaction commits, with at most
two dispatch requests in flight. A dispatch failure affects only its media item.

`POST /api/uploads/abort` discards an uncommitted single or multipart raw upload.
It refuses to delete an object that is already referenced by `media_assets`.
Abandoning a partially uploaded package calls this endpoint for every completed
raw upload retained by the draft.

## Required application environment

```dotenv
APP_BASE_URL=https://your-public-application.example
MEDIA_PROCESSING_TOKEN_SECRET=replace-with-a-random-secret
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=europe-west1
GOOGLE_CLOUD_MEDIA_JOB_NAME=gf-media-worker
GOOGLE_CLOUD_MEDIA_CONTAINER_NAME=media-worker
GOOGLE_CLOUD_PROJECT_NUMBER=your-numeric-project-number
GOOGLE_CLOUD_SERVICE_ACCOUNT_EMAIL=gf-media-dispatcher@your-project-id.iam.gserviceaccount.com
GOOGLE_CLOUD_WORKLOAD_IDENTITY_POOL_ID=vercel
GOOGLE_CLOUD_WORKLOAD_IDENTITY_PROVIDER_ID=vercel
```

The production Next.js application runs on Vercel. It exchanges Vercel's
request-scoped OIDC token through Google Cloud Workload Identity Federation and
does not store a Google service-account key. Grant the dispatcher service
account only `run.jobs.runWithOverrides` on the media job. Restrict the workload
identity provider binding to this Vercel project and its production environment.

Set these variables only for the Vercel production environment until a separate
preview data and job environment is approved. `APP_BASE_URL` must be the
canonical production URL so the worker callback never targets a transient
preview deployment.

Local development uses Google Application Default Credentials. Developers may
set `GOOGLE_APPLICATION_CREDENTIALS` to a credential file outside the repository
when ADC is not otherwise available. The Vercel runtime deliberately fails if
the workload identity variables are incomplete; it never falls back to a stored
service-account key.

## Supabase connection on Vercel

Use the Supabase transaction pooler connection on port 6543 for `DATABASE_URL`.
Keep `DATABASE_MIGRATION_URL` out of the Vercel runtime; it is only for controlled
migration commands through a direct or session-pooler connection. Supabase
publishable values may be available to the browser, but database, R2, processing,
and Google Cloud credentials must remain server-only variables.

## Worker contract

- Photo display: full-size WebP.
- Photo preview: WebP, maximum 720 by 720 pixels.
- Video display: fragmented MP4 with H.264 video and optional AAC audio.
- Video preview: WebP poster, maximum 720 by 720 pixels.
- HDR video: BT.2020/PQ or HLG is tone-mapped to BT.709 SDR.

Build the worker from `media-worker/Dockerfile`. Configure the Cloud Run Job
with one task, no automatic retries, a container named `media-worker`, and a
timeout no longer than the 48-hour signed processing window. Automatic retries
must remain disabled because retries are issued by the application with a new,
idempotent run ID.

## Local worker verification

```bash
docker build -t gf-media-worker:local media-worker
docker run --rm \
  -v "$PWD/media-worker/tests:/tests:ro" \
  --entrypoint node \
  gf-media-worker:local \
  /tests/smoke.mjs
```
