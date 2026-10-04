# Stage 1 merged flower candidates

## Purpose and scope

[`stage-1-merged.csv`](./stage-1-merged.csv) merges the final candidates from Ingram 1869, Phillips 1825, and Tyas 1869 at the research layer. It does not alter the three source-specific evidence tables and does not define an application data model or import contract.

The owner-approved identity rule is:

- One flower identity and approved colour/form is one merged entry.
- Different sentiments for that identity stay together in the same entry.
- Every sentiment and narrative retains compact source attribution.
- Meaningful colour, bud, leaf, dried/withered, seed-head, species/form, and named cultivar distinctions remain separate.
- Historical spelling, punctuation, pluralization, and clear common-name synonyms do not create separate entries.

## Result

- Final source evidence rows consumed: **527**.
- Merged flower/form entries produced: **331**.
- Source rows consolidated through identity merging: **196**.
- Entries backed by more than one source: **124**.
- Entries backed by all three sources: **41**.
- Entries containing more than one distinct source sentiment wording: **85**.
- Entries containing more than one source record: **128**.
- Entries with at least one acquired original-source illustration: **48**.
- Original-source illustration crops linked: **52**.

The 331 count is a conservative research result. Ambiguous historical identities remain separate rather than being merged on speculation.

## Compact source notation

- `I:<row>` — John H. Ingram, *Flora Symbolica* (1869)
- `P:<number>` — Henry Phillips, *Floral Emblems* (1825)
- `T:<number>` — Robert Tyas, *The Sentiment of Flowers* (1869)

For example, a merged meaning such as `Love [I:603] || Beauty [T:280]` records both meanings in one flower entry without losing their provenance. `contexts_with_sources` uses the same compact codes and keeps the context attached to the sentiment it supports. Identical context repeated by duplicate source rows is stored once with the combined references.

## Merge method

1. All 527 retained source rows were consumed exactly once.
2. Working names were normalized only for comparison; exact source wording remains in `source_names`.
3. Obvious historical spelling and common-name aliases were consolidated. Examples include `Marygold/Marigold`, `Pansy/Heart's-ease/Pansée`, `Stock/Gillyflower`, `Cornflower/Blue-Bottle Centaury`, `Forget-me-not/Myosotis`, `Cuckoo-pint/Wake Robin`, and `Hortensia/Hydrangea`.
4. Different meanings were grouped inside the resulting flower/form entry rather than split into separate entries.
5. Colour and material form remained identity-significant. For example, generic rose, white rose, yellow rose, white rosebud, rose leaf, dried white rose, and withered white rose remain separate entries.
6. Every original record reference, direct scan URL, source wording, context note, source-illustration mapping, and botanical-image status was retained in the merged row.

## CSV fields

- `merged_id`: stable Stage 1 research identifier.
- `canonical_flower_form`: conservative merged identity label.
- `meanings_with_sources`: all source sentiments, grouped when their normalized wording is identical.
- `contexts_with_sources`: source narratives with record and sentiment attribution.
- `source_names`: exact source flower/plant wording by record.
- `source_records`: compact provenance references.
- `source_urls`: direct scan-page URLs for every source record.
- `source_illustrations`: retained source-plate mappings where available.
- `botanical_image_statuses`: source-record image-gap statuses.
- `source_count` and `source_record_count`: distinct books and evidence-row counts.
- `merge_note`: scope warning for the conservative research merge.
- `original_source_illustration_assets`: acquired historical-illustration asset IDs.
- `original_source_illustration_paths`: local paths to the corresponding flower-focused crops.

## Validation and remaining caution

Validation confirms **331 unique `merged_id` values**, unique canonical identity labels, complete coverage of all **527** source records exactly once, nonblank meanings and contexts in every row, compact attribution for every meaning/context, and valid direct scan URLs. The source-specific CSVs remain the controlling evidence when a merged label is questioned.

Canonical labels are not modern botanical determinations. Similar-looking but historically ambiguous names were not forced together; resolving those would require a separate botanical authority/synonym pass.

An image follow-up acquired **26** complete historical plate scans and produced **52** flower-focused crops for **48** merged entries. Their source pages, crop coordinates, confidence levels, hashes, and rights notes are recorded in [`images/image-manifest.csv`](./images/image-manifest.csv) and summarized in [`images/image-manifest.md`](./images/image-manifest.md). These assets are original-source illustrations, not modern botanical photographs; **283** merged entries still have no original-source illustration. A portable owner-review gallery is available at [`illustrated-48-review-standalone.html`](./illustrated-48-review-standalone.html).
