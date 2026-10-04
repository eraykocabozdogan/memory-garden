# Henry Phillips — *Floral Emblems* (1825): Stage 1 final-candidate report

## Scope and locked source

- Primary scan: [Internet Archive item `floralemblems00philrich`](https://archive.org/details/floralemblems00philrich).
- Dictionary boundary: **ABSENCE**, printed p. 55 ([scan n108](https://archive.org/details/floralemblems00philrich/page/n108/mode/1up)), through **ZEST**, printed p. 338 ([scan n431](https://archive.org/details/floralemblems00philrich/page/n431/mode/1up)).
- The following index begins on printed p. 339 ([scan n432](https://archive.org/details/floralemblems00philrich/page/n432/mode/1up)) and was not treated as another entry sequence.
- Plate directions on printed pp. 351–352 ([scan n444](https://archive.org/details/floralemblems00philrich/page/n444/mode/1up), [scan n445](https://archive.org/details/floralemblems00philrich/page/n445/mode/1up)) control illustration mappings.
- No later-edition content was merged and no application-facing contract is defined here.

## Final cleanup result

- Original sentiment headings enumerated: **311**.
- Original evidence records: **312**, because **MUSIC** supplies two explicit source alternatives.
- Final Stage 1 candidates retained in [`phillips-1825.csv`](./phillips-1825.csv): **184**.
- Rows physically removed at owner request: **128**.
- Exclusive removal breakdown, evaluated in gate order: **6 insufficient source narrative**, **113 not ordinarily treated as a flower**, **6 succulent**, **3 arrangement/composite presentation**.
- The CSV now contains final candidates only. Every retained row has `classification=include`; removed rows are represented only by the aggregate counts above.

## Approved inclusion rules

A retained record must both be ordinarily perceived as a flower (or have an approved prominent flowering/ornamental use) and carry a source explanation or concrete history, belief, tradition, myth, event, or etymological context. Classic ornamental flowers and explicit blossom entries remain eligible. A meaning based on a seed vessel, root, leaf, or another feature does not disqualify an otherwise eligible flower.

Trees, grains, grasses, crops, culinary herbs, foliage-oriented woody plants, succulents, and floral arrangements are excluded. A poem or quotation alone is not narrative support.

The final consistency review restored adequately explained flower records that the earlier taxonomy pass had excluded: Fuller's Teasel (two sentiments), Borage, Bugloss, Honesty, Balsam, Asphodel, Dandelion, and Persicaria. It removed such earlier false positives as thyme, marjoram, basil, flax, whole-tree/composite orange, almond, hawthorn, horse chestnut, mistletoe, laurel, mountain ash, succulents/cacti, crowns, and multi-flower arrangements.

## Narrative audit

The linked primary OCR and page sequence were used to reopen weak-looking CSV summaries; the full source prose, not summary length, controlled the decision. **194 of the 200 formerly included rows** passed that direct audit. The six failures were:

- `P1825-072` — Jonquil / Desire
- `P1825-191` — Ox-eye / Obstacle
- `P1825-217` — Lythrum / Pretension
- `P1825-243` — Various coloured Lantana / Rigour
- `P1825-244` — Blue-flowered Greek Valerian / Rupture
- `P1825-259` — Common Fumitory / Spleen

Those six records were removed because the relevant text did not meet the approved narrative threshold. `P1825-245` is French Honeysuckle and remains a valid, separate record.

## Extraction and verification method

1. IA line-level DjVu text was used for discovery; the UC scan and its printed-page sequence control headings, plant wording, sentiments, and page ranges.
2. The continuous dictionary on printed pp. 55–338 was reconciled in order. Adjacent entries may share a boundary page.
3. Cornell 1831 and the UIUC 1825 copy were consulted only for unclear letterforms; no later-edition entry or wording was imported.
4. `contextual_material` remains a concise source-specific inventory/paraphrase, not a polished story or diplomatic transcription.
5. Printed historical names and Latin strings are preserved; working normalized names are non-authoritative.

## Illustration assessment and validation

Source-plate mappings remain only where Phillips's directions/captions identify the emblem component. `botanical_image_missing=yes` means no standalone botanical image file was acquired in Stage 1; it does not erase retained source-plate evidence.

Final validation confirms **184 unique `record_id` values**, nonblank required evidence fields, `classification=include` on every row, no retained narrative-audit failure, and valid direct Internet Archive page URLs. Colour/form distinctions remain source-specific and have not been collapsed.
