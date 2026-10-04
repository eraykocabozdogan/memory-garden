#!/usr/bin/env python3
"""Build a standalone Curtis vs. Flore des Serres visual comparison."""

from __future__ import annotations

import base64
import csv
import html
import json
import mimetypes
import re
import time
from pathlib import Path
from urllib.parse import quote

import requests


ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "visual-source-comparison"
IMAGE_DIR = OUTPUT_DIR / "images"
HTML_PATH = ROOT / "curtis-vs-flore-des-serres-top-10.html"
MANIFEST_PATH = OUTPUT_DIR / "image-manifest.csv"
API_URL = "https://commons.wikimedia.org/w/api.php"

ENTRIES = [
    {
        "flower": "Gül",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Rosa centifolia",
        "file_title": "File:Curtis's botanical magazine (Plate 3475) (8043236078).jpg",
        "note": "Katmerli bahçe gülü; günümüz kesme gülünden daha dolgun bir tarihî form.",
    },
    {
        "flower": "Gül",
        "source": "Flore des Serres",
        "scientific_name": "Rosa çeşidi",
        "file_title": "File:Flore des serres v15 097a.jpg",
        "note": "Serres’in dekoratif bahçe gülü levhalarından biri.",
    },
    {
        "flower": "Lale",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Tulipa sylvestris subsp. australis",
        "file_title": "File:Curtis's botanical magazine (No. 717) (8447528823).jpg",
        "note": "Yabani lale formu; tanıdık kültür lalesi kadar iri ve katmerli değil.",
    },
    {
        "flower": "Lale",
        "source": "Flore des Serres",
        "scientific_name": "Tulipa kültür çeşitleri",
        "file_title": "File:Flore des serres v16 141a.jpg",
        "note": "Birden fazla bahçe lalesini aynı levhada gösteren dekoratif düzenleme.",
    },
    {
        "flower": "Karanfil",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Dianthus caryophyllus",
        "file_title": "File:The Botanical Magazine, Plate 39 (Volume 2, 1788).png",
        "note": "Doğrudan karanfil; erken dönem Curtis levhası.",
    },
    {
        "flower": "Karanfil",
        "source": "Flore des Serres",
        "scientific_name": "Dianthus chinensis",
        "file_title": "File:Flore des Serres v13 011a.jpg",
        "note": "Çin karanfili; çiçekçi karanfilinin birebir çeşidi değil, aynı Dianthus grubu.",
    },
    {
        "flower": "Papatya",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Bellis perennis",
        "file_title": "File:The Botanical Magazine, Plate 228 (Volume 7, 1794).png",
        "note": "Doğrudan çayır papatyası.",
    },
    {
        "flower": "Papatya",
        "source": "Flore des Serres",
        "scientific_name": "Tanacetum coccineum",
        "file_title": "File:Flore des serres v17 033a.jpg",
        "note": "Doğrudan Bellis değil; papatya görünümündeki pembe pireotu. Serres kapsamındaki farkı göstermek için seçildi.",
    },
    {
        "flower": "Lilyum / zambak",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Lilium speciosum",
        "file_title": "File:Curtis's botanical magazine (Plate 3785) (9126690695).jpg",
        "note": "Gösterişli gerçek zambak; modern lilyuma yakın okunur.",
    },
    {
        "flower": "Lilyum / zambak",
        "source": "Flore des Serres",
        "scientific_name": "Lilium auratum",
        "file_title": "File:Flore des serres v15 057a.jpg",
        "note": "Altın şeritli Japon zambağı; Serres’in en gösterişli levhalarından.",
    },
    {
        "flower": "Ayçiçeği",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Helianthus multiflorus",
        "file_title": "File:The Botanical Magazine, Plate 227 (Volume 7, 1794).png",
        "note": "Çok çiçekli süs ayçiçeği; tarla ayçiçeğinden farklı bir bahçe formu.",
    },
    {
        "flower": "Ayçiçeği",
        "source": "Flore des Serres",
        "scientific_name": "Helianthus californicus",
        "file_title": "File:Flore des serres v15 037a.jpg",
        "note": "Katmerli süs ayçiçeği; tek başlı tarla ayçiçeğinin birebir karşılığı değil.",
    },
    {
        "flower": "Krizantem / kasımpatı",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Chrysanthemum indicum",
        "file_title": "File:The Botanical Magazine, Plate 327 (Volume 10, 1796).png",
        "note": "Doğrudan krizantem; erken dönem sade Curtis düzeni.",
    },
    {
        "flower": "Krizantem / kasımpatı",
        "source": "Flore des Serres",
        "scientific_name": "Chrysanthemum indicum",
        "file_title": "File:Flore des serres v15 141a.jpg",
        "note": "Birden fazla kültür çeşidini dekoratif bir buket gibi gösteriyor.",
    },
    {
        "flower": "Sümbül",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Hyacinthus orientalis",
        "file_title": "File:Curtis's botanical magazine (10594749593).jpg",
        "note": "Doğrudan bahçe sümbülü.",
    },
    {
        "flower": "Sümbül",
        "source": "Flore des Serres",
        "scientific_name": "Hyacinthus orientalis",
        "file_title": "File:Flore des serres v14 183a.jpg",
        "note": "Birden fazla renk çeşidini aynı levhada karşılaştırıyor.",
    },
    {
        "flower": "Ortanca",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Hydrangea (tür kaydı belirsiz)",
        "file_title": "File:Curtis's botanical magazine (Plate 4253) (8571547621).jpg",
        "note": "Curtis levhası ortanca olarak sınıflanmış; Commons kaydı türü kesinleştirmiyor.",
    },
    {
        "flower": "Ortanca",
        "source": "Flore des Serres",
        "scientific_name": "Hydrangea macrophylla",
        "file_title": "File:Flore des serres v16 077a.jpg",
        "note": "Günlük hayatta tanınan büyük yapraklı bahçe ortancasına yakın.",
    },
    {
        "flower": "Şakayık",
        "source": "Curtis’s Botanical Magazine",
        "scientific_name": "Paeonia suffruticosa",
        "file_title": "File:Paeonia suffruticosa Bot. Mag. 29.1154.1809.jpg",
        "note": "Ağaç şakayığı; levha yatay kompozisyonlu.",
    },
    {
        "flower": "Şakayık",
        "source": "Flore des Serres",
        "scientific_name": "Paeonia lactiflora",
        "file_title": "File:Flore des serres et des jardins de l'Europe (8595874428).jpg",
        "note": "Süt çiçekli şakayık; kesme çiçekte tanınan dolgun forma daha yakın.",
    },
]


def clean_markup(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", " ", value or "")).strip()


def fetch_metadata(session: requests.Session) -> dict[str, dict]:
    result: dict[str, dict] = {}
    titles = [entry["file_title"] for entry in ENTRIES]
    for offset in range(0, len(titles), 10):
        response = session.get(
            API_URL,
            params={
                "action": "query",
                "titles": "|".join(titles[offset : offset + 10]),
                "prop": "categories|imageinfo",
                "cllimit": "max",
                "iiprop": "url|size|extmetadata",
                "iiurlwidth": 1200,
                "format": "json",
                "formatversion": 2,
            },
            timeout=60,
        )
        response.raise_for_status()
        for page in response.json()["query"]["pages"]:
            if page.get("missing"):
                raise RuntimeError(f"Commons file is missing: {page['title']}")
            result[page["title"]] = page
        time.sleep(1)
    return result


def slugify(value: str) -> str:
    table = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosuCGIOSU")
    return re.sub(r"[^a-z0-9]+", "-", value.translate(table).lower()).strip("-")


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"


def commons_page_url(title: str) -> str:
    return "https://commons.wikimedia.org/wiki/" + quote(title.replace(" ", "_"), safe="():,'")


def download_with_retry(session: requests.Session, url: str, attempts: int = 6) -> bytes:
    for attempt in range(attempts):
        response = session.get(url, timeout=120)
        if response.status_code == 200:
            return response.content
        if response.status_code != 429 or attempt == attempts - 1:
            response.raise_for_status()
        time.sleep(3 * (attempt + 1))
    raise RuntimeError(f"Download failed: {url}")


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    IMAGE_DIR.mkdir(exist_ok=True)

    session = requests.Session()
    session.headers["User-Agent"] = "GF-Flower-Research/1.0 (local source comparison)"
    metadata = fetch_metadata(session)

    rows = []
    for index, entry in enumerate(ENTRIES, start=1):
        page = metadata[entry["file_title"]]
        image_info = page["imageinfo"][0]
        suffix = Path(image_info["url"].split("?", 1)[0]).suffix.lower() or ".jpg"
        filename = f"{index:02d}-{slugify(entry['flower'])}-{slugify(entry['source'])}{suffix}"
        image_path = IMAGE_DIR / filename
        if not image_path.exists():
            image_path.write_bytes(download_with_retry(session, image_info["thumburl"]))
            time.sleep(1)

        ext = image_info.get("extmetadata", {})
        categories = [category["title"].replace("Category:", "") for category in page.get("categories", [])]
        row = {
            **entry,
            "local_file": str(image_path.relative_to(ROOT)),
            "commons_page": commons_page_url(entry["file_title"]),
            "original_width": image_info.get("width", ""),
            "original_height": image_info.get("height", ""),
            "license": clean_markup(ext.get("LicenseShortName", {}).get("value", "")),
            "usage_terms": clean_markup(ext.get("UsageTerms", {}).get("value", "")),
            "categories": "; ".join(categories),
            "data_uri": data_uri(image_path),
        }
        if row["license"].lower() != "public domain":
            raise RuntimeError(f"Unexpected license for {entry['file_title']}: {row['license']}")
        rows.append(row)

    manifest_fields = [
        "flower",
        "source",
        "scientific_name",
        "file_title",
        "note",
        "local_file",
        "commons_page",
        "original_width",
        "original_height",
        "license",
        "usage_terms",
        "categories",
    ]
    with MANIFEST_PATH.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=manifest_fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

    grouped: dict[str, list[dict]] = {}
    for row in rows:
        grouped.setdefault(row["flower"], []).append(row)

    sections = []
    for number, (flower, pair) in enumerate(grouped.items(), start=1):
        cards = []
        for row in pair:
            cards.append(
                f"""
                <article class="source-card">
                  <h3>{html.escape(row['source'])}</h3>
                  <a class="image-link" href="{html.escape(row['commons_page'])}" target="_blank" rel="noreferrer">
                    <img src="{row['data_uri']}" alt="{html.escape(flower)} — {html.escape(row['source'])}">
                  </a>
                  <div class="details">
                    <p class="latin"><i>{html.escape(row['scientific_name'])}</i></p>
                    <p>{html.escape(row['note'])}</p>
                    <p class="meta">Orijinal: {row['original_width']} × {row['original_height']} px · {html.escape(row['license'])}</p>
                    <a href="{html.escape(row['commons_page'])}" target="_blank" rel="noreferrer">Commons kaydını aç</a>
                  </div>
                </article>
                """
            )
        sections.append(
            f"""
            <section class="flower-section" id="flower-{number}">
              <h2><span>{number}</span>{html.escape(flower)}</h2>
              <div class="pair">{''.join(cards)}</div>
            </section>
            """
        )

    document = f"""<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Curtis ve Flore des Serres — 10 yaygın çiçek</title>
  <style>
    :root {{ color-scheme: light; --ink:#262421; --muted:#67625b; --line:#d8d3ca; --paper:#f7f5f0; --card:#fff; --accent:#315c4d; }}
    * {{ box-sizing: border-box; }}
    body {{ margin:0; background:var(--paper); color:var(--ink); font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif; }}
    header, main, footer {{ width:min(1180px, calc(100% - 32px)); margin-inline:auto; }}
    header {{ padding:48px 0 28px; border-bottom:1px solid var(--line); }}
    h1 {{ margin:0 0 12px; font:700 clamp(30px,5vw,48px)/1.08 Georgia,serif; letter-spacing:-.025em; }}
    header p {{ max-width:850px; margin:7px 0; color:var(--muted); }}
    .legend {{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:24px; }}
    .legend div {{ padding:14px 16px; background:var(--card); border:1px solid var(--line); border-radius:8px; }}
    .legend strong {{ display:block; color:var(--accent); }}
    main {{ padding:12px 0 56px; }}
    .flower-section {{ padding:34px 0 42px; border-bottom:1px solid var(--line); }}
    h2 {{ display:flex; align-items:center; gap:11px; margin:0 0 16px; font:700 28px/1.2 Georgia,serif; }}
    h2 span {{ display:grid; place-items:center; width:30px; height:30px; border-radius:50%; background:var(--accent); color:white; font:600 14px/1 system-ui,sans-serif; }}
    .pair {{ display:grid; grid-template-columns:1fr 1fr; gap:18px; align-items:stretch; }}
    .source-card {{ display:flex; flex-direction:column; min-width:0; overflow:hidden; background:var(--card); border:1px solid var(--line); border-radius:10px; }}
    h3 {{ margin:0; padding:13px 16px; border-bottom:1px solid var(--line); font-size:17px; }}
    .image-link {{ display:grid; place-items:center; height:600px; padding:16px; background:#f1eee7; }}
    img {{ display:block; max-width:100%; width:auto; height:100%; object-fit:contain; filter:saturate(.96); }}
    .details {{ padding:15px 16px 17px; }}
    .details p {{ margin:0 0 8px; }}
    .latin {{ font-family:Georgia,serif; }}
    .meta {{ color:var(--muted); font-size:13px; }}
    a {{ color:#235a49; text-underline-offset:2px; }}
    footer {{ padding:0 0 40px; color:var(--muted); font-size:14px; }}
    @media (max-width:760px) {{ .pair,.legend {{ grid-template-columns:1fr; }} .image-link {{ height:520px; }} header {{ padding-top:28px; }} }}
    @media print {{ body {{ background:white; }} .image-link {{ height:480px; }} .flower-section {{ break-inside:avoid; }} }}
  </style>
</head>
<body>
  <header>
    <h1>Curtis mi, Flore des Serres mi?</h1>
    <p>Türkiye’de yüksek bilinirlik veya çiçekçi önemi taşıyan 10 başlık, iki tarihî koleksiyondan yan yana örneklerle karşılaştırıldı. Görseller dosyanın içine gömülüdür; internet olmadan da görünür.</p>
    <p><strong>Bu bir tür eşitliği testi değil, görsel kaynak seçimi.</strong> Kaynakta günlük çiçekle birebir aynı tür bulunmadığında en yakın kültür veya süs formu açıkça yazıldı.</p>
    <div class="legend">
      <div><strong>Curtis’s Botanical Magazine</strong>Daha sade, tek örneği inceleyen botanik levha yaklaşımı.</div>
      <div><strong>Flore des Serres</strong>Daha gösterişli, zengin ve zaman zaman birden çok çeşidi kullanan bahçe dergisi yaklaşımı.</div>
    </div>
  </header>
  <main>{''.join(sections)}</main>
  <footer>Tüm örneklerin Wikimedia Commons kaydı “Public domain” olarak doğrulandı. Tam dosya adı, çözünürlük ve kategori kayıtları yan manifest CSV’sinde saklandı.</footer>
</body>
</html>
"""
    HTML_PATH.write_text(document, encoding="utf-8")
    print(json.dumps({"html": str(HTML_PATH), "manifest": str(MANIFEST_PATH), "images": len(rows)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
