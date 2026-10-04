# John H. Ingram — *Flora Symbolica* (catalogued 1869): Stage 1 final-candidate report

## Scope and locked source

- Locked primary: Cornell copy digitized in BHL/Internet Archive, identifier [`florasymbolica00ingr`](https://archive.org/details/florasymbolica00ingr), catalogue date 1869. BHL title record: [DOI 10.5962/bhl.title.159895](https://doi.org/10.5962/bhl.title.159895). Cornell record: [catalogue](https://digital.library.cornell.edu/catalog/flow2295724).
- Enumeration source: **The Vocabulary, Part First**, printed pp. **355–362** (IA scan pages **n400–n407**). Part Second, printed pp. 362–368, was used only as an inverse-index completeness check.
- Google 1870/1887 witnesses were not merged. No application-facing contract is defined here.

## Final cleanup result

- Original source options enumerated: **790**.
- Final Stage 1 candidates retained in [`ingram-1869.csv`](./ingram-1869.csv): **206**.
- Rows physically removed at owner request: **584**.
- Exclusive removal breakdown, evaluated in gate order: **530 insufficient source narrative**, **48 not ordinarily treated as a flower**, **2 succulent**, **4 arrangement/composite presentation**.
- The CSV now contains final candidates only. Every retained row has `classification=include`; removed rows are represented only by the aggregate counts above.

## Approved inclusion rules

A retained record must pass both gates:

1. **Flower eligibility:** ordinarily perceived as a flower, or a prominent flowering ornamental/wild/medicinal plant. Classic ornamental flowers remain eligible even when botanically woody. Explicit blossom entries remain eligible. A meaning based on a leaf, seed head, or another feature does not disqualify a plant that is ordinarily perceived as a flower.
2. **Narrative adequacy:** the source must explain the flower–sentiment link or supply concrete historical, cultural, mythological, traditional, etymological, or event context. A bare vocabulary equation or decorative quotation is insufficient.

Trees, grains, grasses, crops, culinary herbs, foliage-oriented woody plants, succulents, wreaths, garlands, bouquets, and mixed/multi-element arrangements are not final candidates unless an approved rule above clearly applies.

Examples retained after the final consistency review include `Flowering Almond`, `Apple Blossom`, `Lemon Blossoms`, `Orange Blossoms`, classic ornamentals such as camellia, jasmine, lilac, and magnolia, and the source-specific `Dandelion, or Thistle-seed-head` and `Lotus Leaf` records. The last two remain because the underlying plants are ordinarily perceived as flowers and the owner approved meanings based on another plant feature.

## Extraction and verification method

1. IA DjVu XML was used only to discover and geometrically separate the two name/sentiment column pairs.
2. Printed pp. 355–362 were checked against page images; wrapped headings, sentiment continuations, column bleed, typography, variants, and the transition to Part Second were repaired against those images.
3. Part Second was used as a reverse-index checksum, not as a second entry source.
4. The printed contents supplied exact ranges for 100 dedicated narrative essays. Retention requires a matched, source-specific narrative; terminal-vocabulary-only rows were removed during final cleanup.
5. Working normalized names and automatic Turkish glosses remain non-authoritative research aids.

## Context retained separately

- **The Dial of Flowers**, printed pp. **345–346** ([IA n390](https://archive.org/details/florasymbolica00ingr/page/n390/mode/1up)): retained as source context, not converted into sentiment rows.
- **Holy Flowers**, printed pp. **347–352** ([IA n392](https://archive.org/details/florasymbolica00ingr/page/n392/mode/1up)): retained as source context, not merged into the vocabulary.
- Other source context: The Floral Oracle pp. 330–335; Typical Bouquets pp. 336–341; Emblematic Garlands pp. 342–344.

## Illustration assessment and validation

The scan contains fifteen full-page colour plates. Row-level mappings are retained only when a caption supports the exact subject; a generic plate subject is not silently assigned to a colour, species, form, arrangement, or plant-part variant. `botanical_image_still_missing=yes` means that no standalone botanical image asset was acquired in Stage 1, not that the source contains no visual material.

Final validation confirms **206 unique source rows**, nonblank required evidence fields, `classification=include` on every row, a source-specific narrative on every row, and valid direct Internet Archive page URLs. Historical spellings remain in `source_heading`; normalized labels and Turkish glosses still require later authority/language review.
