# Media worker

This Cloud Run Job container normalizes one uploaded media asset per execution.
It receives only `MEDIA_JOB_TOKEN` and `MEDIA_PROCESSING_API_URL`; database and R2
credentials remain in the Next.js application.

## Outputs

- Photo: full-size WebP display image and a max-720px WebP preview.
- Video: H.264/AAC MP4 display video and a max-720px WebP poster.
- HDR video: BT.2020/PQ or HLG input is tone-mapped to BT.709 SDR.
