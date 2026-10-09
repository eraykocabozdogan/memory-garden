import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/import-flower-catalog.mjs <source.md> <output.json>");
}

const displayNames = {
  "Alcea › rosea": "Gülhatmi",
  Anemone: "Anemon",
  Antirrhinum: "Aslanağzı",
  Aquilegia: "Hasekiküpesi",
  "Bellis › perennis": "Papatya",
  "Bellis › perennis › katmerli": "Katmerli papatya",
  "Calendula › officinalis": "Aynısefa",
  "Campsis › radicans": "Acem borusu",
  "Celosia › argentea › ibik biçimli": "Horozibiği",
  "Cercis › siliquastrum": "Erguvan",
  "Citrus › çiçek": "Portakal çiçeği",
  "Convallaria › majalis": "Müge",
  "Crocus › sativus": "Safran çiçeği",
  Cyclamen: "Siklamen",
  Dahlia: "Yıldız çiçeği",
  "Digitalis › purpurea": "Yüksükotu",
  Erica: "Funda",
  "Fritillaria › imperialis": "Ters lale",
  Fuchsia: "Küpe çiçeği",
  Galanthus: "Kardelen",
  Helianthus: "Ayçiçeği",
  Hyacinthus: "Sümbül",
  "Hydrangea › macrophylla": "Ortanca",
  "Impatiens › balsamina": "Kına çiçeği",
  "Ipomoea › purpurea": "Kahkaha çiçeği",
  Iris: "Süsen",
  "Lavandula › angustifolia": "Lavanta",
  Lilium: "Zambak",
  "Lilium › beyaz": "Beyaz zambak",
  Lonicera: "Hanımeli",
  "Magnolia › grandiflora": "Büyük çiçekli manolya",
  "Malus › çiçek": "Elma çiçeği",
  "Mirabilis › jalapa": "Akşamsefası",
  Myosotis: "Unutma beni",
  Narcissus: "Nergis",
  "Narcissus › pseudonarcissus": "Sarı nergis",
  "Nelumbo › nucifera": "Hint lotusu",
  Nymphaea: "Su zambağı",
  Papaver: "Haşhaş",
  "Papaver › somniferum › beyaz": "Beyaz haşhaş",
  Passiflora: "Çarkıfelek",
  "Primula › vulgaris": "Çuha çiçeği",
  Ranunculus: "Düğün çiçeği",
  Rhododendron: "Ormangülü",
  Rosa: "Gül",
  "Rosa › beyaz": "Beyaz gül",
  "Rosa › beyaz › tomurcuk": "Beyaz gül tomurcuğu",
  "Rosa › kırmızı": "Kırmızı gül",
  "Rosa › kurumuş": "Kurumuş gül",
  "Rosa › tam açmış": "Tam açmış gül",
  "Rosa › tek katlı": "Tek katlı gül",
  "Rosa › tomurcuk": "Gül tomurcuğu",
  "Rosa › yarı açmış": "Yarı açmış gül",
  Spartium: "Süpürgeotu",
  Syringa: "Leylak",
  "Syringa › beyaz": "Beyaz leylak",
  Tulipa: "Lale",
  Vinca: "Cezayir menekşesi",
  Viola: "Menekşe",
  "Viola › odorata": "Kokulu menekşe",
  "Viola › tricolor": "Hercai menekşe",
};

function slugify(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const source = await readFile(inputPath, "utf8");
const headings = [...source.matchAll(/^## (\d+)\. `([^`]+)`$/gm)];
const records = headings.map((heading, index) => {
  const start = heading.index + heading[0].length;
  const end = headings[index + 1]?.index ?? source.indexOf("\n## Bütünlük denetimi", start);
  const block = source.slice(start, end);
  const meaning = block.match(/^\*\*Mevcut birleşik anlam:\*\* (.+)$/m)?.[1];
  const context = block.match(/^\*\*Bağlam:\*\* (.+)$/m)?.[1];
  const narratives = [...block.matchAll(/^\d+\. (.+)$/gm)].map((match) => match[1]);
  const path = heading[2];
  const name = displayNames[path];

  if (!name || !meaning || !context || narratives.length === 0) {
    throw new Error(`Incomplete catalog record: ${path}`);
  }

  return {
    id: slugify(path),
    path,
    name,
    meaning,
    context,
    narratives,
  };
});

if (records.length !== 61 || new Set(records.map((record) => record.id)).size !== 61) {
  throw new Error(`Expected 61 unique records, received ${records.length}`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Imported ${records.length} flower records.`);
