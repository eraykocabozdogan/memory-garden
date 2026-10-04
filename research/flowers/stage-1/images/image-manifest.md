# Original-source flower illustrations

## Result

- Downloaded full source plates: **26** (Ingram 8, Phillips 10, Tyas 8).
- Produced flower-level crops: **52** (Ingram 9, Phillips 25, Tyas 18).
- Merged entries with at least one original-source illustration: **48 / 331**.
- Merged entries still without an original-source illustration: **283**.
- Identification confidence: **48 exact**, **3 probable**, **1 possible**.

The full audit table is [`image-manifest.csv`](./image-manifest.csv). Each asset records its source row, merged entry, scan page, original plate, crop coordinates, confidence, file hash, and Internet Archive URLs. The corresponding merged rows in [`../stage-1-merged.csv`](../stage-1-merged.csv) now contain the asset IDs and crop paths.

## Usage boundary

These are cropped historical source illustrations, not modern botanical photographs or clean transparent cut-outs. Most crops are target-dominant; assets marked `shared multi-flower crop` deliberately retain neighbouring flowers because the historical composition does not permit a reliable isolated crop. `probable` and `possible` assets should receive owner review before product use.

The underlying books date from 1825 or 1869 and are public-domain-era works. The files retain Internet Archive scan provenance and direct page links; host or contributing-institution terms should still be checked before redistribution. Sources: [Ingram 1869](https://archive.org/details/florasymbolica00ingr), [Phillips 1825](https://archive.org/details/floralemblems00philrich), [Tyas 1869](https://archive.org/details/sentimentofflowe00tyas).

## Directory layout

- `source-plates/`: complete downloaded scan pages, kept as provenance masters.
- `flower-crops/`: usable flower-focused JPEG crops.
- `image-manifest.csv`: one row per crop asset.

No modern photographs were downloaded in this pass.

The simple portable owner-review file is [`../illustrated-48-review-standalone.html`](../illustrated-48-review-standalone.html). It embeds all 52 crops and lists every retained Stage 1 source-context summary under its corresponding flower.
