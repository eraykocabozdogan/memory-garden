# Turkey location data

`turkey-locations.json` is generated and should not be edited manually.

Administrative names are derived from
[`onurusluca/turkey-geo-api`](https://github.com/onurusluca/turkey-geo-api)
at revision `5a16cef20f2335e3fe643c9618f931866bb8134c` (MIT). Province and district
center coordinates are derived from
[`open-admin-data/turkey-administrative-divisions`](https://github.com/open-admin-data/turkey-administrative-divisions)
at revision `6dfe36b4360c4395656edc2ea0730224d269bc86` (CC BY 4.0).

Regenerate the compact runtime file with:

```sh
node scripts/generate-turkey-locations.mjs
```
