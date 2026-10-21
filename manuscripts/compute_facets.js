const fs = require("fs");
const path = require("path");

const JSONL_PATH = "D:\\MAN\\dromh_marc21_rda_catalog.jsonl";
const CACHE_PATH = "D:\\MAN\\analytics_cache.json";

console.log("Computing full analytics across 107,149 records...");
const t0 = Date.now();

const fd = fs.openSync(JSONL_PATH, "r");
const stat = fs.fstatSync(fd);
const CHUNK_SIZE = 4 * 1024 * 1024;
const buf = Buffer.alloc(CHUNK_SIZE);
let pos = 0;

const centuries = {};
const scripts = {
  "نسخ": 0,
  "نستعليق": 0,
  "شكستة": 0,
  "كوفي": 0,
  "ثلث": 0,
  "رقعة": 0,
  "مغربي": 0,
  "أخرى": 0
};
const languages = {
  "عربي": 0,
  "فارسي": 0,
  "عثماني / تركي": 0,
  "أردو": 0,
  "أخرى": 0
};
const topSubjects = {};

let leftover = "";

while (pos < stat.size) {
  const bytesRead = fs.readSync(fd, buf, 0, CHUNK_SIZE, pos);
  if (bytesRead === 0) break;
  const chunkText = leftover + buf.toString("utf8", 0, bytesRead);
  const lines = chunkText.split("\n");
  leftover = lines.pop() || "";

  for (const l of lines) {
    if (l.length < 50) continue;

    // Script
    const sMatch = l.match(/"نوع الخط":"([^"]*)"/);
    if (sMatch) {
      const s = sMatch[1];
      if (s.includes("نسخ")) scripts["نسخ"]++;
      else if (s.includes("نستعليق") || s.includes("تعليق")) scripts["نستعليق"]++;
      else if (s.includes("شكست")) scripts["شكستة"]++;
      else if (s.includes("كوفي")) scripts["كوفي"]++;
      else if (s.includes("ثلث")) scripts["ثلث"]++;
      else if (s.includes("رقعة")) scripts["رقعة"]++;
      else if (s.includes("مغرب")) scripts["مغربي"]++;
      else scripts["أخرى"]++;
    }

    // Language
    const lMatch = l.match(/"اللغة":"([^"]*)"/);
    if (lMatch) {
      const lg = lMatch[1];
      if (lg.includes("عرب")) languages["عربي"]++;
      else if (lg.includes("فارس")) languages["فارسي"]++;
      else if (lg.includes("ترك") || lg.includes("عثمان")) languages["عثماني / تركي"]++;
      else if (lg.includes("أرد") || lg.includes("ارد")) languages["أردو"]++;
      else languages["أخرى"]++;
    }

    // Century
    const yMatch = l.match(/(?:سنة|عام)\s*(\d{3,4})\s*هـ/) || l.match(/ت\s*(\d{3,4})\s*هـ/);
    if (yMatch) {
      const y = parseInt(yMatch[1], 10);
      if (y >= 100 && y <= 1450) {
        const c = Math.floor(y / 100) + 1;
        const cKey = `ق ${c} هـ`;
        centuries[cKey] = (centuries[cKey] || 0) + 1;
      }
    }

    // Subject
    const subMatch = l.match(/"الموضوع":"([^"]*)"/);
    if (subMatch) {
      const sParts = subMatch[1].split(/[،,]/).map(x => x.trim()).filter(Boolean);
      for (const sp of sParts) {
        if (sp && sp !== "بلا" && sp !== "-") {
          topSubjects[sp] = (topSubjects[sp] || 0) + 1;
        }
      }
    }
  }

  pos += bytesRead;
}
fs.closeSync(fd);

// Sort centuries logically
const centuryOrder = [
  "ق 5 هـ", "ق 6 هـ", "ق 7 هـ", "ق 8 هـ", "ق 9 هـ",
  "ق 10 هـ", "ق 11 هـ", "ق 12 هـ", "ق 13 هـ", "ق 14 هـ", "ق 15 هـ"
];
const sortedCenturies = {};
for (const c of centuryOrder) {
  if (centuries[c]) sortedCenturies[c] = centuries[c];
}
// Any other centuries
for (const [k, v] of Object.entries(centuries)) {
  if (!sortedCenturies[k]) sortedCenturies[k] = v;
}

const sortedTopSubjects = Object.entries(topSubjects)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
  .map(([subject, count]) => ({ subject, count }));

const result = {
  calculatedAt: new Date().toISOString(),
  durationMs: Date.now() - t0,
  scripts,
  languages,
  centuries: sortedCenturies,
  topSubjects: sortedTopSubjects
};

fs.writeFileSync(CACHE_PATH, JSON.stringify(result, null, 2), "utf8");
console.log(`Analytics computed in ${Date.now() - t0}ms and saved to ${CACHE_PATH}`);
console.log("Sample result:", JSON.stringify(result, null, 2).slice(0, 500));
