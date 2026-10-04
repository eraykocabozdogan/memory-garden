const xml = await (await fetch(
  "https://ia800703.us.archive.org/32/items/florasymbolica00ingr/florasymbolica00ingr_djvu.xml",
)).text();

const pages = xml.match(/<OBJECT[\s\S]*?<\/OBJECT>/g) ?? [];

function unescapeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function pageLines(pageIndex) {
  const lines = [];
  for (const match of (pages[pageIndex] ?? "").matchAll(/<LINE>([\s\S]*?)<\/LINE>/g)) {
    const words = [...match[1].matchAll(
      /<WORD coords="(\d+),(\d+),(\d+),(\d+),\d+">([^<]*)<\/WORD>/g,
    )].map((word) => ({
      x1: Number(word[1]),
      y1: Number(word[4]),
      x2: Number(word[3]),
      y2: Number(word[2]),
      text: unescapeXml(word[5]),
    }));
    if (!words.length) continue;

    const zones = [[], [], [], []];
    for (const word of words) {
      const zone = word.x1 < 500 ? 0 : word.x1 < 900 ? 1 : word.x1 < 1300 ? 2 : 3;
      zones[zone].push(word);
    }
    for (let zone = 0; zone < zones.length; zone += 1) {
      if (!zones[zone].length) continue;
      lines.push({
        zone,
        x: zones[zone][0].x1,
        y: Math.min(...zones[zone].map((word) => word.y1)),
        text: zones[zone].map((word) => word.text).join(" "),
      });
    }
  }
  return lines.sort((a, b) => a.y - b.y || a.zone - b.zone);
}

function clean(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:?!])/g, "$1")
    .replace(/¬\s*/g, "")
    .trim();
}

function columnRows(pageIndex, nameZone, sentimentZone) {
  const lines = pageLines(pageIndex);
  const minimumY = pageIndex === 400 ? 900 : 250;
  const names = lines.filter((line) => line.zone === nameZone && line.y >= minimumY);
  const sentiments = lines.filter((line) => line.zone === sentimentZone && line.y >= minimumY);
  const base = nameZone === 0 ? 225 : 1020;
  const groups = [];

  for (const line of names) {
    const previous = groups.at(-1);
    const nearSentiment = sentiments.some((sentiment) => Math.abs(sentiment.y - line.y) <= 12);
    const likelyContinuation = previous && !nearSentiment && line.x > base;

    if (likelyContinuation) {
      previous.lines.push(line);
    } else {
      groups.push({ startY: line.y, lines: [line] });
    }
  }

  return groups.map((group, index) => {
    const nextY = groups[index + 1]?.startY ?? 10000;
    const sentimentLines = sentiments.filter(
      (line) => line.y >= group.startY - 25 && line.y < nextY - 5,
    );
    return {
      y: group.startY,
      name: clean(group.lines.map((line) => line.text).join(" ")),
      sentiment: clean(sentimentLines.map((line) => line.text).join(" ")),
    };
  });
}

const rawRows = [];
for (let pageIndex = 400; pageIndex <= 407; pageIndex += 1) {
  const printedPage = pageIndex - 45;
  for (const [nameZone, sentimentZone, column] of [[0, 1, "left"], [2, 3, "right"]]) {
    for (const row of columnRows(pageIndex, nameZone, sentimentZone)
      .filter((item) => pageIndex !== 407 || item.y < 1100)) {
      rawRows.push({ ...row, printedPage, scanPage: `n${pageIndex}`, column });
    }
  }
}

function normalizeOcr(value) {
  return value
    .replace(/^\W*[A-Z]\s+(?=[A-Z])/u, (match) => match.replace(/\s+/g, ""))
    .replaceAll("A Iways", "Always")
    .replaceAll("A lways", "Always")
    .replaceAll("R econcilia tion", "Reconciliation")
    .replaceAll("R evenge", "Revenge")
    .replaceAll("R eserve", "Reserve")
    .replaceAll("A rdour", "Ardour")
    .replaceAll("A fter-thought", "After-thought")
    .replaceAll("A mbition", "Ambition")
    .replaceAll("A version", "Aversion")
    .replaceAll("A miability", "Amiability")
    .replaceAll("A miableness", "Amiableness")
    .replaceAll("A ttachment", "Attachment")
    .replaceAll("A nger", "Anger")
    .replaceAll("P'ire", "Fire")
    .replaceAll("P'amily", "Family")
    .replaceAll("E7ichantment", "Enchantment")
    .replaceAll("Faithfibiess", "Faithfulness")
    .replaceAll("Watchfubiess", "Watchfulness")
    .replaceAll("R ural", "Rural")
    .replaceAll("Intoxicatio7i", "Intoxication")
    .replaceAll("Stratage7/u", "Stratagem")
    .replaceAll("yotc", "you")
    .replaceAll("7ne", "me")
    .replaceAll("i>t", "in")
    .replaceAll("su77shi7te", "sunshine")
    .replaceAll("a7td", "and")
    .replaceAll("dons", "done")
    .replaceAll("Chtirch", "Church")
    .replaceAll("wotcnd", "wound")
    .replaceAll("Didependence", "Independence")
    .replaceAll("Hospitalily", "Hospitality")
    .replaceAll("Diffidetice", "Diffidence")
    .replaceAll("Lameiitation", "Lamentation")
    .replaceAll("Matrimo?iy", "Matrimony")
    .replaceAll("Religions superstition", "Religious superstition")
    .replaceAll("beatety", "beauty")
    .replaceAll("Couldyou", "Could you")
    .replaceAll("Sttipidity", "Stupidity")
    .replaceAll("A cknowledgment", "Acknowledgment")
    .replaceAll("Scattdal", "Scandal")
    .replaceAll("Enchan tmen t", "Enchantment")
    .replaceAll("Protectioti", "Protection")
    .replaceAll("trobhy", "trophy")
    .replaceAll("Betray a l", "Betrayal")
    .replaceAll("attractions", "attractions")
    .replaceAll("Ptire", "Pure")
    .replaceAll("ajid", "and")
    .replaceAll("R emembrance", "Remembrance")
    .replaceAll("7oy", "Joy")
    .replaceAll("R esistance", "Resistance")
    .replaceAll("excelle7ice", "excellence")
    .replaceAll("fa Isefriends", "false friends")
    .replaceAll("I,mpatience", "Impatience")
    .replace(/([A-Za-z])-\s+([a-z])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

const mergedRows = [];
for (let index = 0; index < rawRows.length; index += 1) {
  const current = { ...rawRows[index] };
  while (/^\.?$/.test(current.sentiment.trim()) && rawRows[index + 1]
    && rawRows[index + 1].printedPage === current.printedPage
    && rawRows[index + 1].column === current.column) {
    const next = rawRows[++index];
    current.name = `${current.name} ${next.name}`;
    current.sentiment = next.sentiment;
  }
  mergedRows.push(current);
}

const headingFixes = new Map([
  ["A becedary", "Abecedary"],
  ["Althaea Frutex Syrian) Mallow)..", "Althæa Frutex (Syrian Mallow)"],
  ["Anemone (Zephyr", "Anemone (Zephyr Flr.)"],
  ["Ash-leaved Trumpet Flower", "Ash-leaved Trumpet Flower"],
  ["T)ACHELOR’S J3 Button", "Bachelor’s Button"],
  ["Bay (Rose) Rhododen dron.,,", "Bay (Rose) Rhododendron"],
  ["Bittersweet; Night shade", "Bittersweet; Nightshade"],
  ["C ABBAGE", "Cabbage"],
  ["Calla AJthiopica", "Calla Æthiopica"],
  ["Cobma", "Cobæa"],
  ["Com", "Corn"],
  ["Com, Broken", "Corn, Broken"],
  ["Com Bottle", "Corn Bottle"],
  ["Cosmelia Subra", "Cosmelia Rubra"],
  ["0AFFODIL", "Daffodil"],
  ["E BON Y TREE", "Ebony Tree"],
  ["Mesernbryanthemum", "Mesembryanthemum"],
  ["Mimosa (Sensitive Pit.)", "Mimosa (Sensitive Plt.)"],
  ["Moon wort", "Moonwort"],
  ["MonardaAmplexicaulis", "Monarda Amplexicaulis"],
  ["TCELAND Moss", "Iceland Moss"],
  ["J^ABURNUM", "Laburnum"],
  ["Lagerstrsemia, Indian", "Lagerstræmia, Indian"],
  ["Laurel-leavd. Magnolia", "Laurel-leaved Magnolia"],
  ["Geranium, Rose-scntd", "Geranium, Rose-scented"],
  ["Geranium, Silver-leavd", "Geranium, Silver-leaved"],
  ["Flax-lvd. Golden-locks", "Flax-leaved Golden-locks"],
  ["Crowsbill", "Crow’s-bill"],
  ["Crowfoot (Aconite-lvd.)", "Crowfoot (Aconite-leaved)"],
  ["Diplademia Crassinoda", "Dipladenia Crassinoda"],
  ["Angrec", "Angræc"],
  ["Grammanthus Chloraflora", "Grammanthus Chloræflora"],
  ["Imperial Montague", "Imperial Montagu"],
  ["Indian Jasmine (Ipomcea)", "Indian Jasmine (Ipomœa)"],
  ["Marian thus", "Marianthus"],
  ["Tussilage, Sweet-scent ed", "Tussilage, Sweet-scented"],
  ["-y'ALERIAN", "Valerian"],
  ["X ANTHIUM", "Xanthium"],
  ["ysw", "Yew"],
  ["Z EPHYR Flower", "Zephyr Flower"],
  ["\"IXTALNUT", "Walnut"],
  ["VV Wallflower", "Wallflower"],
]);

function cleanHeading(value) {
  let cleaned = normalizeOcr(value)
    .replace(/^[-■"\\/]+/, "")
    .replace(/\\\.?/g, "")
    .replace(/\.{2,}$/g, "")
    .replace(/[.,]$/g, "")
    .trim();
  cleaned = headingFixes.get(cleaned) ?? cleaned;
  return cleaned;
}

function cleanSentiment(value) {
  return normalizeOcr(value)
    .replace(/^[_.,' ]+/, "")
    .replace(/\s+([,.;:?!])/g, "$1")
    .replace(/\.\s*\.$/, ".")
    .trim();
}

const rows = mergedRows.map((row) => ({
  ...row,
  name: cleanHeading(row.name),
  sentiment: cleanSentiment(row.sentiment),
}));

console.log(JSON.stringify({ raw: rawRows.length, merged: rows.length, rows }, null, 2));
