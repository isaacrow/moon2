// Helper to generate the new viewer_server.js with full SVG icons and zero emojis
const fs = require('fs');

const code = `const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3456;
const DATA_DIR = "D:\\\\MAN";
const JSONL_PATH = path.join(DATA_DIR, "dromh_marc21_rda_catalog.jsonl");
const LOGO_PATH = path.join(DATA_DIR, "logo.png");
const EDITS_PATH = path.join(DATA_DIR, "edited_records.json");
const WORKFLOW_PATH = path.join(DATA_DIR, "workflow_state.json");
const KIQP_GUIDE_PATH = path.join(DATA_DIR, "kiqp_manuscripts_cataloging_guide.json");
const KIQP_AUTH_PATH = path.join(DATA_DIR, "kiqp_authorities_all.json");

let savedEdits = {};
if (fs.existsSync(EDITS_PATH)) {
  try { savedEdits = JSON.parse(fs.readFileSync(EDITS_PATH, "utf8")); } catch (e) {}
}

let workflowState = {};
if (fs.existsSync(WORKFLOW_PATH)) {
  try { workflowState = JSON.parse(fs.readFileSync(WORKFLOW_PATH, "utf8")); } catch (e) {}
}

// ----------------------------------------------------
// ISO 2709 Binary Generator
// ----------------------------------------------------
function recordToIso2709Buffer(marcFields) {
  let directory = "";
  const fieldBuffers = [];
  let currentOffset = 0;

  for (const field of marcFields) {
    const tag = String(field.tag || "999").padStart(3, "0").slice(0, 3);
    let fieldBuf;
    if (!field.subfields) {
      const val = String(field.value || "");
      fieldBuf = Buffer.concat([Buffer.from(val, "utf8"), Buffer.from([0x1E])]);
    } else {
      const ind = (field.indicators || "\\\\\\\\").padEnd(2, "\\\\").slice(0, 2);
      const subChunks = [Buffer.from(ind, "utf8")];
      for (const sf of field.subfields) {
        const code = sf.code || "a";
        const val = String(sf.value || "");
        subChunks.push(Buffer.from([0x1F]));
        subChunks.push(Buffer.from(code + val, "utf8"));
      }
      subChunks.push(Buffer.from([0x1E]));
      fieldBuf = Buffer.concat(subChunks);
    }
    const len = fieldBuf.length;
    directory += tag + String(len).padStart(4, "0") + String(currentOffset).padStart(5, "0");
    currentOffset += len;
    fieldBuffers.push(fieldBuf);
  }

  const dirBuf = Buffer.concat([Buffer.from(directory, "ascii"), Buffer.from([0x1E])]);
  const baseAddress = 24 + dirBuf.length;
  const contentBuf = Buffer.concat(fieldBuffers);
  const totalLength = baseAddress + contentBuf.length + 1;

  let leader = String(totalLength).padStart(5, "0");
  leader += "ntm a22";
  leader += String(baseAddress).padStart(5, "0");
  leader += " i 4500";

  return Buffer.concat([
    Buffer.from(leader, "ascii"),
    dirBuf,
    contentBuf,
    Buffer.from([0x1D])
  ]);
}

// ----------------------------------------------------
// Parsing Authority Strings
// ----------------------------------------------------
function parseAuthorStringForAuthority(rawAuthor) {
  if (!rawAuthor || rawAuthor === "بلا" || rawAuthor.includes("مجهول")) return null;
  let dateFormatted = "";
  const dMatch = rawAuthor.match(/\\(([^)]*(?:ق|هـ|هجري|ميلادي|توفي|القرن)[^)]*)\\)/);
  if (dMatch) dateFormatted = dMatch[1].trim() + "،";
  let nameOnly = rawAuthor.replace(/\\([^)]*\\)/g, "").replace(/[-–—]/g, " ").replace(/\\s+/g, " ").trim();
  if (!nameOnly) return null;

  const prefixes = [
    "الشيخ", "السيد", "العلامة", "المحقق", "الشهيد", "الميرزا", "الملا", "القاضي", "الإمام", "الحكيم", "الشريف"
  ];
  let prefix = "";
  for (const p of prefixes) {
    if (nameOnly.startsWith(p + " ")) {
      prefix = p;
      nameOnly = nameOnly.slice(p.length).trim();
      break;
    }
  }

  const words = nameOnly.split(" ").filter(Boolean);
  let nameFormatted = nameOnly;
  if (words.length >= 2) {
    const family = words[0];
    const rest = words.slice(1).join(" ");
    nameFormatted = \`\${family}، \${rest}\`;
  }
  if (prefix) nameFormatted = \`\${prefix} \${nameFormatted}\`;
  if (!nameFormatted.endsWith("،")) nameFormatted += "،";

  return {
    cleanKey: nameOnly,
    nameFormatted,
    dateFormatted
  };
}

// ----------------------------------------------------
// Full Fast Byte-Offset Indexing & Authority Extraction
// ----------------------------------------------------
console.log("علقمي (Alqami) Indexing records and Authority Files...");
const t0 = Date.now();
const fd = fs.openSync(JSONL_PATH, "r");
const stats = fs.statSync(JSONL_PATH);
const totalFileSize = stats.size;

const offsets = [];
const lengths = [];
const searchMeta = [];
const authorMap = new Map();
const subjectMap = new Map();

// Load Harvested kiqp.net Authorities if available
if (fs.existsSync(KIQP_AUTH_PATH)) {
  try {
    const ka = JSON.parse(fs.readFileSync(KIQP_AUTH_PATH, "utf8"));
    if (ka.authors) {
      for (const a of ka.authors) {
        authorMap.set(a.name, a);
      }
    }
    if (ka.subjects) {
      for (const s of ka.subjects) {
        subjectMap.set(s.subject, s);
      }
    }
    console.log(\`Loaded \${ka.authors ? ka.authors.length : 0} kiqp.net authors and \${ka.subjects ? ka.subjects.length : 0} subjects from kiqp_authorities_all.json\`);
  } catch (e) {
    console.error("Error reading kiqp_authorities_all.json:", e.message);
  }
}

// Also load kiqp cataloging guide
if (fs.existsSync(KIQP_GUIDE_PATH)) {
  try {
    const guide = JSON.parse(fs.readFileSync(KIQP_GUIDE_PATH, "utf8"));
    if (guide.records) {
      for (const r of guide.records) {
        for (const m of r.marc) {
          if (m.tag === "100" && m.subfields) {
            const aSub = m.subfields.find(s => s.code === "a");
            const dSub = m.subfields.find(s => s.code === "d");
            if (aSub && aSub.value) {
              const name = aSub.value.trim();
              if (!authorMap.has(name)) {
                authorMap.set(name, {
                  name,
                  title: "",
                  dates: dSub ? dSub.value.trim() : "",
                  relator: "مؤلف.",
                  count: 5,
                  source: "kiqp.net (IQ-KaCCS)",
                  marc100: m
                });
              }
            }
          } else if (m.tag === "650" && m.subfields) {
            const aSub = m.subfields.find(s => s.code === "a");
            if (aSub && aSub.value) {
              const subj = aSub.value.trim();
              if (!subjectMap.has(subj)) {
                subjectMap.set(subj, {
                  subject: subj,
                  fullHeading: m.subfields.map(s => s.value).join(" — "),
                  subfields: m.subfields,
                  count: 5,
                  source: "kiqp.net (IQ-KaCCS)",
                  marc650: m
                });
              }
            }
          }
        }
      }
    }
  } catch (e) {}
}

const CHUNK_SIZE = 4 * 1024 * 1024;
const buf = Buffer.alloc(CHUNK_SIZE);
let filePos = 0;
let leftover = "";
let lineStartOffset = 0;

while (filePos < totalFileSize) {
  const bytesRead = fs.readSync(fd, buf, 0, CHUNK_SIZE, filePos);
  if (bytesRead === 0) break;

  let start = 0;
  for (let i = 0; i < bytesRead; i++) {
    if (buf[i] === 0x0A) { // newline
      const lineLen = filePos + i - lineStartOffset;
      offsets.push(lineStartOffset);
      lengths.push(lineLen);

      const curIdx = offsets.length - 1;
      lineStartOffset = filePos + i + 1;

      let sliceStr;
      if (leftover.length > 0) {
        sliceStr = leftover + buf.toString("utf8", start, Math.min(i, 4096));
        leftover = "";
      } else {
        sliceStr = buf.toString("utf8", start, Math.min(start + 4096, i));
      }
      start = i + 1;

      let id = "", title = "", author = "", subject = "", copyNum = "";
      let edited = false;

      if (savedEdits[curIdx]) {
        const sf = savedEdits[curIdx].source_fields || {};
        id = savedEdits[curIdx].id || "";
        title = sf["العنوان"] || "";
        author = sf["المؤلف"] || "";
        subject = sf["الموضوع"] || "";
        copyNum = sf["رقم النسخة"] || "";
        edited = true;
      } else {
        const idM = sliceStr.match(/"id":"([^"]*)"/);
        const titleM = sliceStr.match(/"العنوان":"([^"]*)"/);
        const authM = sliceStr.match(/"المؤلف":"([^"]*)"/);
        const subjM = sliceStr.match(/"الموضوع":"([^"]*)"/);
        const copyM = sliceStr.match(/"رقم النسخة":"([^"]*)"/);
        id = idM ? idM[1] : "";
        title = titleM ? titleM[1] : "";
        author = authM ? authM[1] : "";
        subject = subjM ? subjM[1] : "";
        copyNum = copyM ? copyM[1] : "";
      }

      searchMeta.push({
        idx: curIdx,
        id,
        title,
        author,
        subject,
        copyNum,
        edited
      });

      // Aggregate Author Authority from dromh
      if (author && author !== "بلا" && !author.includes("مجهول")) {
        const existing = authorMap.get(author);
        if (existing) {
          existing.count++;
        } else {
          const parsed = parseAuthorStringForAuthority(author);
          if (parsed && parsed.cleanKey) {
            const exKey = authorMap.get(parsed.cleanKey);
            if (exKey) {
              exKey.count++;
              if (!exKey.dates && parsed.dateFormatted) exKey.dates = parsed.dateFormatted;
            } else {
              const subfields = [{ code: "a", value: parsed.nameFormatted }];
              if (parsed.dateFormatted) subfields.push({ code: "d", value: parsed.dateFormatted });
              subfields.push({ code: "e", value: "مؤلف." });
              authorMap.set(parsed.cleanKey, {
                name: parsed.nameFormatted,
                title: "",
                dates: parsed.dateFormatted,
                relator: "مؤلف.",
                count: 1,
                source: "dromh.org",
                marc100: { tag: "100", indicators: "1\\\\", subfields }
              });
            }
          }
        }
      }

      // Aggregate Subject Authority from dromh
      if (subject && subject !== "بلا" && subject !== "-") {
        const parts = subject.split(/[،,]/).map(s => s.trim()).filter(Boolean);
        for (const sp of parts) {
          const ex = subjectMap.get(sp);
          if (ex) {
            ex.count++;
          } else {
            const subfields = [
              { code: "a", value: sp },
              { code: "v", value: "مخطوطات." }
            ];
            subjectMap.set(sp, {
              subject: sp,
              fullHeading: \`\${sp} — مخطوطات.\`,
              subfields,
              count: 1,
              source: "dromh.org",
              marc650: { tag: "650", indicators: "\\\\4", subfields }
            });
          }
        }
      }
    }
  }
  if (start < bytesRead) {
    leftover += buf.toString("utf8", start, bytesRead);
  }
  filePos += bytesRead;
}

const authorsAuthorityList = [...authorMap.values()].sort((a, b) => {
  if (a.source !== b.source) return a.source.startsWith("kiqp") ? -1 : 1;
  return b.count - a.count;
});
const subjectsAuthorityList = [...subjectMap.values()].sort((a, b) => {
  if (a.source !== b.source) return a.source.startsWith("kiqp") ? -1 : 1;
  return b.count - a.count;
});

console.log(
  \`علقمي indexed \${offsets.length.toLocaleString()} records, \${authorsAuthorityList.length.toLocaleString()} unique authors, and \${subjectsAuthorityList.length.toLocaleString()} subjects in \${((Date.now() - t0) / 1000).toFixed(2)}s!\`
);

function getRecordByIndex(idx) {
  if (idx < 0 || idx >= offsets.length) return null;
  if (savedEdits[idx]) return savedEdits[idx];
  const len = lengths[idx];
  const b = Buffer.alloc(len);
  fs.readSync(fd, b, 0, len, offsets[idx]);
  return JSON.parse(b.toString("utf8"));
}

function saveRecordByIndex(idx, recordObj) {
  if (idx < 0 || idx >= offsets.length) return false;
  savedEdits[idx] = recordObj;
  fs.writeFileSync(EDITS_PATH, JSON.stringify(savedEdits, null, 2), "utf8");
  const sf = recordObj.source_fields || {};
  searchMeta[idx] = {
    idx,
    id: recordObj.id || "",
    title: sf["العنوان"] || "",
    author: sf["المؤلف"] || "",
    subject: sf["الموضوع"] || "",
    copyNum: sf["رقم النسخة"] || "",
    edited: true
  };
  return true;
}

function saveWorkflowByIndex(idx, wf) {
  if (idx < 0 || idx >= offsets.length) return false;
  workflowState[idx] = wf;
  fs.writeFileSync(WORKFLOW_PATH, JSON.stringify(workflowState, null, 2), "utf8");
  return true;
}

const UI_HTML = \`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>علقمي — نظام فهرسة ومقارنة المخطوطات (MARC 21 & RDA)</title>
  <link rel="icon" type="image/png" href="/logo.png" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&family=Cairo:wght@400;500;600;700;800&family=Amiri:wght@400;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

    :root {
      --c-glass: #bbbbbc;
      --c-light: #fff;
      --c-dark: #000;
      --c-content: #224;
      --c-action: #0052f5;
      --c-bg: #E8E8E9;
      --glass-reflex-dark: 1;
      --glass-reflex-light: 1;
      --saturation: 150%;

      --liquid-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 10%), transparent),
        inset 1.8px 3px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 90%), transparent),
        inset -2px -2px 0px -2px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 80%), transparent),
        inset -3px -8px 1px -6px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 60%), transparent),
        inset -0.3px -1px 4px 0px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 12%), transparent),
        inset -1.5px 2.5px 0px -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
        inset 0px 3px 4px -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
        inset 2px -6.5px 1px -4px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
        0px 1px 5px 0px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
        0px 6px 16px 0px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent);

      --liquid-pill-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 10%), transparent),
        inset 2px 1px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 90%), transparent),
        inset -1.5px -1px 0px -1px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 80%), transparent),
        inset -2px -6px 1px -5px color-mix(in srgb, var(--c-light) calc(var(--glass-reflex-light) * 60%), transparent),
        inset -1px 2px 3px -1px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 20%), transparent),
        inset 0px -4px 1px -2px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 10%), transparent),
        0px 3px 6px 0px color-mix(in srgb, var(--c-dark) calc(var(--glass-reflex-dark) * 8%), transparent);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "DM Sans", "Cairo", system-ui, -apple-system, sans-serif;
      font-optical-sizing: auto;
      background: var(--c-bg);
      color: var(--c-content);
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: background 400ms cubic-bezier(1, 0.0, 0.4, 1), color 400ms cubic-bezier(1, 0.0, 0.4, 1);
    }

    body:has(input[value="dark"]:checked) {
      --c-glass: #bbbbbc;
      --c-light: #fff;
      --c-dark: #000;
      --c-content: #e1e1e1;
      --c-action: #03d5ff;
      --c-bg: #1b1b1d;
      --glass-reflex-dark: 2;
      --glass-reflex-light: 0.3;
      --saturation: 150%;
    }

    body:has(input[value="dim"]:checked) {
      --c-light: #99deff;
      --c-dark: #20001b;
      --c-glass: hsl(335 250% 74% / 1);
      --c-content: #d5dbe2;
      --c-action: #ff48a9;
      --c-bg: #152433;
      --glass-reflex-dark: 2;
      --glass-reflex-light: 0.7;
      --saturation: 200%;
    }

    .ambient-bg {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background:
        radial-gradient(ellipse at 20% 10%, color-mix(in srgb, var(--c-light) 35%, transparent) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 90%, color-mix(in srgb, var(--c-glass) 25%, transparent) 0%, transparent 55%);
    }

    /* SVG Icon System (Pure Vector, Zero Text Emojis) */
    .svg-ic {
      width: 14px;
      height: 14px;
      display: inline-block;
      vertical-align: middle;
      flex-shrink: 0;
      stroke-width: 2;
    }
    .svg-ic.stroke {
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .svg-ic.fill {
      fill: currentColor;
      stroke: none;
    }

    header {
      margin: 10px 14px 0 14px;
      padding: 8px 16px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 12%, transparent);
      backdrop-filter: blur(12px) url(#frosted) saturate(var(--saturation));
      -webkit-backdrop-filter: blur(12px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      transition: background-color 400ms cubic-bezier(1, 0.0, 0.4, 1), box-shadow 400ms cubic-bezier(1, 0.0, 0.4, 1);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-glass {
      width: 54px;
      height: 38px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-dark) 84%, var(--c-glass));
      box-shadow: var(--liquid-pill-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
      overflow: hidden;
    }

    .logo-glass img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      mix-blend-mode: screen;
    }

    .brand-title {
      font-size: 1.22rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .brand-sub {
      font-size: 0.7rem;
      opacity: 0.68;
      font-weight: 500;
    }

    /* 3-Way Liquid Glass Switcher */
    .switcher {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 4px;
      width: 180px;
      height: 40px;
      box-sizing: border-box;
      padding: 4px 6px;
      border: none;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 12%, transparent);
      backdrop-filter: blur(8px) url(#switcher) saturate(var(--saturation));
      -webkit-backdrop-filter: blur(8px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow);
      direction: ltr;
      flex-shrink: 0;
    }

    .switcher__legend, .switcher__input {
      position: absolute; width: 1px; height: 1px; margin: -1px; border: 0; padding: 0;
      white-space: nowrap; clip-path: inset(100%); clip: rect(0 0 0 0); overflow: hidden;
    }

    .switcher__icon {
      display: block; width: 16px; height: 16px;
      transition: scale 200ms cubic-bezier(0.5, 0, 0, 1);
      stroke: var(--c); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
    }

    .switcher__option {
      --c: var(--c-content);
      display: flex; justify-content: center; align-items: center;
      width: 52px; height: 100%; border-radius: 99em; transition: all 160ms;
    }
    .switcher__option:hover { --c: var(--c-action); cursor: pointer; }
    .switcher__option:hover .switcher__icon { scale: 1.2; }
    .switcher__option:has(input:checked) { --c: var(--c-content); cursor: auto; }
    .switcher__option:has(input:checked) .switcher__icon { scale: 1; }

    .switcher::after {
      content: ''; position: absolute; left: 4px; top: 4px; display: block;
      width: 56px; height: calc(100% - 8px); border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 36%, transparent);
      z-index: -1; box-shadow: var(--liquid-pill-shadow);
    }
    .switcher:has(input[c-option="1"]:checked)::after {
      translate: 0 0; transition: all 400ms cubic-bezier(1, 0.0, 0.4, 1); animation: scaleToggle 440ms ease;
    }
    .switcher:has(input[c-option="2"]:checked)::after {
      translate: 58px 0; transition: all 400ms cubic-bezier(1, 0.0, 0.4, 1); animation: scaleToggle2 440ms ease;
    }
    .switcher:has(input[c-option="3"]:checked)::after {
      translate: 116px 0; transition: all 400ms cubic-bezier(1, 0.0, 0.4, 1); animation: scaleToggle3 440ms ease;
    }
    @keyframes scaleToggle { 0% { scale: 1 1; } 50% { scale: 1.1 1; } 100% { scale: 1 1; } }
    @keyframes scaleToggle2 { 0% { scale: 1 1; } 50% { scale: 1.2 1; } 100% { scale: 1 1; } }
    @keyframes scaleToggle3 { 0% { scale: 1 1; } 50% { scale: 1.1 1; } 100% { scale: 1 1; } }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 7px;
      flex: 1;
      justify-content: center;
      flex-wrap: wrap;
    }

    .glass-pill {
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 16%, transparent);
      backdrop-filter: blur(8px) saturate(var(--saturation));
      -webkit-backdrop-filter: blur(8px) saturate(var(--saturation));
      box-shadow: var(--liquid-pill-shadow);
      border: none;
      color: var(--c-content);
      font-family: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 6px 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: scale 160ms cubic-bezier(0.5, 0, 0, 1), background-color 220ms, color 180ms;
      text-decoration: none;
      white-space: nowrap;
    }

    .glass-pill:hover {
      background-color: color-mix(in srgb, var(--c-glass) 32%, transparent);
      color: var(--c-action);
      scale: 1.03;
    }
    .glass-pill:active { scale: 0.97; }
    .glass-pill.active {
      background-color: color-mix(in srgb, var(--c-glass) 44%, transparent);
      color: var(--c-action);
      font-weight: 700;
    }

    .glass-pill.save-btn {
      background-color: color-mix(in srgb, var(--c-action) 16%, var(--c-glass));
      color: var(--c-action);
      font-weight: 700;
    }
    .glass-pill.save-btn.dirty {
      background-color: var(--c-action);
      color: #fff;
    }

    .search-capsule {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 6px 3px 10px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 14%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      width: 280px;
      max-width: 100%;
    }

    .search-capsule input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      color: var(--c-content);
      font-family: inherit;
      font-size: 0.8rem;
      padding: 3px 5px;
    }

    .search-capsule input::placeholder {
      color: color-mix(in srgb, var(--c-content) 48%, transparent);
    }

    .nav-group {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 7px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 14%, transparent);
      box-shadow: var(--liquid-pill-shadow);
    }

    .nav-group input[type="number"] {
      width: 72px;
      border: none;
      outline: none;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 26%, transparent);
      color: var(--c-content);
      font-family: "JetBrains Mono", monospace;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 5px;
      text-align: center;
    }

    /* Sub-Toolbar for Tools & Workflow Status */
    .tools-bar {
      margin: 8px 14px 0 14px;
      padding: 7px 16px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 10%, transparent);
      backdrop-filter: blur(10px) saturate(var(--saturation));
      box-shadow: var(--liquid-pill-shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .tools-group {
      display: flex;
      align-items: center;
      gap: 7px;
      flex-wrap: wrap;
    }

    /* Main Workspace */
    .workspace {
      flex: 1;
      display: grid;
      grid-template-columns: 285px 1fr;
      gap: 14px;
      padding: 10px 14px 14px 14px;
      overflow: hidden;
    }

    .glass-surface {
      border-radius: 26px;
      background-color: color-mix(in srgb, var(--c-glass) 12%, transparent);
      backdrop-filter: blur(14px) saturate(var(--saturation));
      -webkit-backdrop-filter: blur(14px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .surface-header {
      padding: 10px 15px;
      border-bottom: 1px solid color-mix(in srgb, var(--c-content) 10%, transparent);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .surface-title {
      font-weight: 700;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .side-tag {
      padding: 2px 9px;
      border-radius: 99em;
      font-size: 0.7rem;
      font-weight: 700;
      background-color: color-mix(in srgb, var(--c-glass) 30%, transparent);
      box-shadow: var(--liquid-pill-shadow);
    }

    .filter-strip {
      display: flex;
      gap: 4px;
      padding: 7px 10px;
      border-bottom: 1px solid color-mix(in srgb, var(--c-content) 8%, transparent);
      overflow-x: auto;
      flex-shrink: 0;
    }

    .filter-chip {
      font-size: 0.7rem;
      padding: 4px 10px;
      border-radius: 99em;
      border: none;
      background-color: color-mix(in srgb, var(--c-glass) 16%, transparent);
      color: var(--c-content);
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .filter-chip.active {
      background-color: var(--c-action);
      color: #fff;
    }

    .results-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .result-item {
      padding: 9px 12px;
      border-radius: 16px;
      background-color: color-mix(in srgb, var(--c-glass) 10%, transparent);
      cursor: pointer;
      transition: all 150ms;
    }
    .result-item:hover {
      background-color: color-mix(in srgb, var(--c-glass) 24%, transparent);
      translate: -2px 0;
    }
    .result-item.active {
      background-color: color-mix(in srgb, var(--c-glass) 38%, transparent);
      box-shadow: var(--liquid-pill-shadow);
    }

    .result-item .r-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.7rem;
      opacity: 0.65;
      margin-bottom: 2px;
      font-family: "JetBrains Mono", monospace;
    }
    .result-item .r-title {
      font-weight: 700;
      font-size: 0.84rem;
      margin-bottom: 2px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .result-item .r-author {
      font-size: 0.74rem;
      opacity: 0.7;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .sidebar-footer {
      padding: 8px 12px;
      border-top: 1px solid color-mix(in srgb, var(--c-content) 10%, transparent);
      display: flex;
      justify-content: space-between;
    }

    .compare-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      height: 100%;
      overflow: hidden;
    }

    .surface-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      scroll-behavior: smooth;
    }

    /* Hover Mapping & Highlight Styles (=TAG connection) */
    .orig-field-box {
      padding: 11px 14px;
      border-radius: 18px;
      background-color: color-mix(in srgb, var(--c-glass) 15%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      margin-bottom: 9px;
      transition: all 180ms;
      border: 1.5px solid transparent;
    }

    .orig-field-box:hover,
    .orig-field-box.mapped-hover {
      background-color: color-mix(in srgb, var(--c-action) 12%, color-mix(in srgb, var(--c-glass) 28%, transparent));
      border-color: color-mix(in srgb, var(--c-action) 65%, transparent);
    }

    .field-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .field-caption {
      font-size: 0.73rem;
      font-weight: 700;
      opacity: 0.68;
    }

    .eq-tag-pills {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      direction: ltr;
    }

    .eq-pill {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 28%, transparent);
      color: var(--c-content);
      opacity: 0.75;
      transition: all 160ms;
    }

    .orig-field-box:hover .eq-pill,
    .orig-field-box.mapped-hover .eq-pill {
      background-color: var(--c-action);
      color: #fff;
      opacity: 1;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-bottom: 2px;
    }
    .meta-grid .orig-field-box { margin-bottom: 0; }
    .span-2 { grid-column: 1 / -1; }

    .editable-input,
    .editable-textarea {
      width: 100%;
      border: 1px solid transparent;
      border-radius: 9px;
      background: transparent;
      color: var(--c-content);
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.5;
      padding: 3px 6px;
      outline: none;
      resize: vertical;
    }
    .editable-input:hover, .editable-textarea:hover {
      background-color: color-mix(in srgb, var(--c-glass) 18%, transparent);
    }
    .editable-input:focus, .editable-textarea:focus {
      background-color: color-mix(in srgb, var(--c-light) 22%, transparent);
      border-color: color-mix(in srgb, var(--c-action) 55%, transparent);
    }
    .hero-input { font-family: "Amiri", "Cairo", serif; font-size: 1.22rem; font-weight: 700; }
    .manuscript-textarea { font-family: "Amiri", "Cairo", serif; font-size: 1.02rem; line-height: 1.7; min-height: 52px; }

    /* MARC 21 + RDA Rows */
    .marc-list { display: flex; flex-direction: column; gap: 7px; }

    .marc-item {
      display: grid;
      grid-template-columns: 70px 44px 128px 1fr 28px;
      align-items: start;
      gap: 7px;
      padding: 9px 11px;
      border-radius: 16px;
      background-color: color-mix(in srgb, var(--c-glass) 14%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      border: 1.5px solid transparent;
      transition: all 180ms;
    }

    .marc-item:hover,
    .marc-item.mapped-hover {
      background-color: color-mix(in srgb, var(--c-action) 14%, color-mix(in srgb, var(--c-glass) 30%, transparent));
      border-color: color-mix(in srgb, var(--c-action) 75%, transparent);
    }

    .m-tag-input {
      font-family: "JetBrains Mono", monospace;
      font-weight: 700;
      font-size: 0.82rem;
      padding: 3px 5px;
      border-radius: 99em;
      border: 1px solid transparent;
      background-color: color-mix(in srgb, var(--c-glass) 34%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      color: var(--c-content);
      text-align: center;
      direction: ltr;
      width: 100%;
      outline: none;
    }
    .marc-item:hover .m-tag-input,
    .marc-item.mapped-hover .m-tag-input {
      background-color: var(--c-action);
      color: #fff;
    }

    .m-ind-input {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--c-content);
      background-color: color-mix(in srgb, var(--c-glass) 22%, transparent);
      border: 1px solid transparent;
      border-radius: 8px;
      padding: 3px 4px;
      text-align: center;
      direction: ltr;
      width: 100%;
      outline: none;
    }

    .m-label { font-size: 0.73rem; font-weight: 700; opacity: 0.68; padding-top: 3px; }
    .m-val { display: flex; flex-direction: column; gap: 4px; }
    .sub-edit-row { display: flex; align-items: center; gap: 5px; }

    .sub-code-badge {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--c-action);
      background-color: color-mix(in srgb, var(--c-glass) 32%, transparent);
      padding: 2px 5px;
      border-radius: 99em;
      direction: ltr;
      border: 1px solid transparent;
      width: 36px;
      text-align: center;
      outline: none;
      flex-shrink: 0;
    }

    .sub-val-input {
      flex: 1;
      border: 1px solid transparent;
      border-radius: 8px;
      background-color: color-mix(in srgb, var(--c-glass) 10%, transparent);
      color: var(--c-content);
      font-family: inherit;
      font-size: 0.86rem;
      padding: 3px 7px;
      outline: none;
    }

    .icon-btn {
      border: none; background: transparent; color: var(--c-content);
      opacity: 0.55; cursor: pointer; padding: 3px; border-radius: 6px;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .icon-btn:hover { opacity: 1; color: var(--c-action); background: color-mix(in srgb, var(--c-glass) 20%, transparent); }

    /* Liquid Glass Modal Overlay */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: color-mix(in srgb, var(--c-dark) 40%, transparent);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-backdrop.open { display: flex; }

    .modal-glass {
      width: 100%;
      max-width: 720px;
      max-height: 85vh;
      border-radius: 28px;
      background-color: color-mix(in srgb, var(--c-bg) 82%, var(--c-glass));
      backdrop-filter: blur(24px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-head {
      padding: 14px 20px;
      border-bottom: 1px solid color-mix(in srgb, var(--c-content) 12%, transparent);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 800;
      font-size: 1rem;
    }

    .modal-body {
      padding: 18px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .template-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .template-card {
      padding: 10px 14px;
      border-radius: 16px;
      background-color: color-mix(in srgb, var(--c-glass) 18%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 3px;
      transition: all 150ms;
    }
    .template-card:hover {
      background-color: color-mix(in srgb, var(--c-action) 14%, color-mix(in srgb, var(--c-glass) 30%, transparent));
      scale: 1.015;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    .glass-input, .glass-select {
      width: 100%;
      padding: 8px 12px;
      border-radius: 14px;
      border: 1px solid color-mix(in srgb, var(--c-content) 15%, transparent);
      background-color: color-mix(in srgb, var(--c-glass) 18%, transparent);
      color: var(--c-content);
      font-family: inherit;
      font-size: 0.86rem;
      outline: none;
    }

    .auth-item {
      padding: 10px 14px;
      border-radius: 16px;
      background-color: color-mix(in srgb, var(--c-glass) 15%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .mrk-interactive-lines {
      display: flex; flex-direction: column; gap: 3px; padding: 12px;
      border-radius: 18px; background-color: color-mix(in srgb, var(--c-glass) 16%, transparent);
      box-shadow: var(--liquid-pill-shadow); direction: ltr; text-align: left;
      font-family: "JetBrains Mono", "Cairo", monospace; font-size: 0.82rem;
    }
    .mrk-line { padding: 4px 8px; border-radius: 8px; border: 1px solid transparent; }
    .mrk-line.mapped-hover, .mrk-line:hover {
      background-color: color-mix(in srgb, var(--c-action) 16%, transparent);
      border-color: color-mix(in srgb, var(--c-action) 70%, transparent);
      font-weight: 700;
    }
    .mrk-eq-tag { color: var(--c-action); font-weight: 700; margin-right: 8px; }

    textarea.code-editor {
      width: 100%; min-height: 400px; direction: ltr; text-align: left; padding: 14px;
      border-radius: 18px; border: 1.5px solid transparent;
      background-color: color-mix(in srgb, var(--c-glass) 18%, transparent);
      box-shadow: var(--liquid-pill-shadow); color: var(--c-content);
      font-family: "JetBrains Mono", "Cairo", monospace; font-size: 0.83rem; line-height: 1.65; outline: none;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--c-content) 22%, transparent); border-radius: 99em; }

    .toast {
      position: fixed; bottom: 22px; left: 22px; z-index: 999; padding: 11px 20px;
      border-radius: 99em; background-color: color-mix(in srgb, var(--c-glass) 45%, var(--c-bg));
      backdrop-filter: blur(16px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow); font-weight: 700; font-size: 0.85rem; display: none;
    }
  </style>
</head>
<body>
  <div class="ambient-bg"></div>

  <svg style="position:absolute;width:0;height:0" aria-hidden="true">
    <filter id="frosted" primitiveUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
      <feDisplacementMap in="blur" in2="noise" scale="0.015" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="switcher" primitiveUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="map" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
      <feDisplacementMap in="blur" in2="map" scale="0.02" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>

  <!-- Top Header Dock -->
  <header>
    <div class="brand">
      <div class="logo-glass" title="علقمي">
        <img src="/logo.png" alt="علقمي" />
      </div>
      <div>
        <div class="brand-title">علقمي</div>
        <div class="brand-sub">نظام فهرسة ومقارنة المخطوطات (MARC 21 &bull; RDA)</div>
      </div>
    </div>

    <div class="controls-row">
      <div class="search-capsule">
        <input type="text" id="searchInput" placeholder="ابحث بالعنوان، المؤلف، رقم النسخة، الموضوع..." />
        <button class="glass-pill" style="padding:4px 10px;" onclick="doSearch()">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
          <span>بحث</span>
        </button>
        <button class="glass-pill" style="padding:4px 8px;" onclick="resetSearch()">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>الكل</span>
        </button>
      </div>

      <div class="nav-group">
        <button class="glass-pill" style="padding:4px 10px;" onclick="stepRecord(-1)">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <input type="number" id="jumpInput" min="1" max="107149" value="18" onchange="jumpToInput()" />
        <span style="font-size:0.74rem; opacity:0.65; padding:0 3px;">/ 107,149</span>
        <button class="glass-pill" style="padding:4px 10px;" onclick="stepRecord(1)">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      <button class="glass-pill" onclick="jumpTo783()">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>سجل (783)</span>
      </button>

      <button class="glass-pill save-btn" id="saveBtn" onclick="saveCurrentRecord()">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span id="saveBtnText">حفظ التعديلات (Ctrl+S)</span>
      </button>
    </div>

    <fieldset class="switcher" id="themeSwitcher" c-previous="1">
      <legend class="switcher__legend">Choose theme</legend>
      <label class="switcher__option" title="Light Glass">
        <input class="switcher__input" type="radio" name="theme" value="light" c-option="1" checked />
        <svg class="switcher__icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
        </svg>
      </label>
      <label class="switcher__option" title="Dark Glass">
        <input class="switcher__input" type="radio" name="theme" value="dark" c-option="2" />
        <svg class="switcher__icon" viewBox="0 0 24 24">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      </label>
      <label class="switcher__option" title="Dim Glass">
        <input class="switcher__input" type="radio" name="theme" value="dim" c-option="3" />
        <svg class="switcher__icon" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
        </svg>
      </label>
    </fieldset>
  </header>

  <!-- Second Liquid Glass Bar: Cataloging Tools + Workflow Status -->
  <div class="tools-bar">
    <div class="tools-group">
      <button class="glass-pill" onclick="openModal('fieldModal')">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span>إضافة حقل MARC (المُنشئ الذكي)</span>
      </button>

      <button class="glass-pill" id="validatorPill" onclick="openValidatorModal()">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span id="validatorPillText">مدقق جودة MARC 21 & RDA</span>
      </button>

      <button class="glass-pill" onclick="openDateConverterModal()">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>محوّل التواريخ (قمري / شمسي / ميلادي)</span>
      </button>

      <button class="glass-pill" onclick="openAuthorityModal()">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 7H3l9-7z"/></svg>
        <span>الملف الاستنادي + API (المؤلفين والموضوعات)</span>
      </button>

      <button class="glass-pill" onclick="openCitationModal()">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <span>توثيق المصادر (=510 الذريعة / كشف الظنون)</span>
      </button>
    </div>

    <div class="tools-group">
      <button class="glass-pill" id="bookmarkBtn" onclick="toggleBookmark()">
        <span id="bookmarkIcon">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </span>
        <span id="bookmarkText">مفضلة</span>
      </button>

      <select class="glass-select" id="workflowSelect" style="width:auto; padding:5px 12px; border-radius:99em; font-size:0.78rem; font-weight:700;" onchange="changeWorkflowStatus(this.value)">
        <option value="none">حالة الفهرسة: غير مصنف</option>
        <option value="review">قيد المراجعة (In Review)</option>
        <option value="approved">معتمد (Approved)</option>
        <option value="attention">يحتاج تدقيق (Needs Attention)</option>
      </select>
    </div>
  </div>

  <!-- Main Workspace -->
  <div class="workspace">
    <!-- Sidebar with Workflow Filters -->
    <aside class="glass-surface">
      <div class="surface-header">
        <span class="surface-title" id="listHeaderTitle">فهرس المخطوطات</span>
        <span id="listPageInfo" style="font-size:0.72rem; opacity:0.6; font-family:'JetBrains Mono', monospace;"></span>
      </div>
      <div class="filter-strip">
        <button class="filter-chip active" id="flt-all" onclick="setListFilter('all')">
          <span>الكل</span>
        </button>
        <button class="filter-chip" id="flt-edited" onclick="setListFilter('edited')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>المعدّلة</span>
        </button>
        <button class="filter-chip" id="flt-bookmarked" onclick="setListFilter('bookmarked')">
          <svg class="svg-ic fill" viewBox="0 0 24 24" style="color:#f6b933;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>المفضلة</span>
        </button>
        <button class="filter-chip" id="flt-approved" onclick="setListFilter('approved')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          <span>معتمد</span>
        </button>
        <button class="filter-chip" id="flt-review" onclick="setListFilter('review')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>قيد المراجعة</span>
        </button>
        <button class="filter-chip" id="flt-attention" onclick="setListFilter('attention')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>يحتاج تدقيق</span>
        </button>
      </div>
      <div class="results-list" id="resultsList"></div>
      <div class="sidebar-footer">
        <button class="glass-pill" style="padding:4px 11px; font-size:0.74rem;" onclick="changeListPage(-1)">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          <span>السابق</span>
        </button>
        <button class="glass-pill" style="padding:4px 11px; font-size:0.74rem;" onclick="changeListPage(1)">
          <span>التالي</span>
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main Split Comparison: RIGHT = Original Record, LEFT = MARC 21 & RDA Record -->
    <main class="compare-split">
      <!-- RIGHT PANEL: Original Record -->
      <section class="glass-surface">
        <div class="surface-header">
          <div class="surface-title">
            <span class="side-tag">اليمين</span>
            <span>السجل الأصلي (مرّر الفأرة لإضاءة =TAG المقابل)</span>
          </div>
          <div style="display:flex; gap:5px;">
            <button class="glass-pill" style="padding:4px 10px; font-size:0.73rem;" onclick="syncOriginalToMarc()">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              <span>تحديث MARC من الأصل</span>
            </button>
            <a id="dromhLink" href="#" target="_blank" class="glass-pill" style="padding:4px 10px; font-size:0.73rem;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
              <span>المصدر</span>
            </a>
          </div>
        </div>
        <div class="surface-body" id="originalContainer"></div>
      </section>

      <!-- LEFT PANEL: MARC 21 & RDA Record -->
      <section class="glass-surface">
        <div class="surface-header">
          <div class="surface-title">
            <span class="side-tag">اليسار</span>
            <span>تسجيلة MARC 21 &bull; RDA</span>
          </div>
          <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
            <button class="glass-pill active" style="padding:4px 9px; font-size:0.73rem;" id="tabTable" onclick="setMarcView('table')">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              <span>جدول (=TAG)</span>
            </button>
            <button class="glass-pill" style="padding:4px 9px; font-size:0.73rem;" id="tabMrk" onclick="setMarcView('mrk')">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>محرر .MRK</span>
            </button>
            <button class="glass-pill" style="padding:4px 9px; font-size:0.73rem;" id="tabJson" onclick="setMarcView('json')">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              <span>محرر JSON</span>
            </button>
            <button class="glass-pill" style="padding:4px 9px; font-size:0.73rem;" onclick="openModal('fieldModal')">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>حقل</span>
            </button>
            <button class="glass-pill" style="padding:4px 9px; font-size:0.73rem;" onclick="downloadMrc()">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              <span>.MRC</span>
            </button>
            <button class="glass-pill" style="padding:4px 9px; font-size:0.73rem;" onclick="copyMarc()">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>نسخ</span>
            </button>
          </div>
        </div>
        <div class="surface-body" id="marcContainer"></div>
      </section>
    </main>
  </div>

  <!-- MODAL 1: Select Which MARC 21 & RDA Field to Add -->
  <div class="modal-backdrop" id="fieldModal" onclick="if(event.target===this)closeModal('fieldModal')">
    <div class="modal-glass">
      <div class="modal-head">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span>اختر حقل MARC 21 & RDA المراد إضافته للتسجيلة</span>
        </div>
        <button class="glass-pill" onclick="closeModal('fieldModal')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>إغلاق</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="template-grid" id="fieldTemplatesGrid"></div>
      </div>
    </div>
  </div>

  <!-- MODAL 2: MARC 21 & RDA Quality Validator -->
  <div class="modal-backdrop" id="validatorModal" onclick="if(event.target===this)closeModal('validatorModal')">
    <div class="modal-glass">
      <div class="modal-head">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>مدقق جودة الفهرسة المعيارية (MARC 21 & RDA Validator)</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="glass-pill save-btn dirty" onclick="autoFixMarcRecord()">
            <svg class="svg-ic fill" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>إصلاح تلقائي شامل (Auto-Fix)</span>
          </button>
          <button class="glass-pill" onclick="closeModal('validatorModal')">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span>إغلاق</span>
          </button>
        </div>
      </div>
      <div class="modal-body" id="validatorResultsBody"></div>
    </div>
  </div>

  <!-- MODAL 3: Hijri Qamari / Hijri Shamsi / Gregorian Date Converter -->
  <div class="modal-backdrop" id="dateModal" onclick="if(event.target===this)closeModal('dateModal')">
    <div class="modal-glass">
      <div class="modal-head">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>محوّل التواريخ الهجرية (قمري / شمسي) والميلادية والقرون</span>
        </div>
        <button class="glass-pill" onclick="closeModal('dateModal')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>إغلاق</span>
        </button>
      </div>
      <div class="modal-body">
        <div style="font-size:0.84rem; opacity:0.8;">أدخل السنة بأي تقويم (هجري قمري، هجري شمسي، أو ميلادي) أو القرن ليتم تحويلها فوراً وتحديث الحقلين <code>=264$c</code> و <code>=008</code>:</div>
        <div class="form-row">
          <div>
            <label class="field-caption">السنة بالهجري القمري (هـ)</label>
            <input type="number" class="glass-input" id="inpQamari" placeholder="مثال: 949" oninput="convertFromQamari(this.value)" />
          </div>
          <div>
            <label class="field-caption">السنة بالهجري الشمسي (هـ.ش)</label>
            <input type="number" class="glass-input" id="inpShamsi" placeholder="مثال: 921" oninput="convertFromShamsi(this.value)" />
          </div>
          <div>
            <label class="field-caption">السنة بالميلادي (م)</label>
            <input type="number" class="glass-input" id="inpGregorian" placeholder="مثال: 1542" oninput="convertFromGregorian(this.value)" />
          </div>
        </div>
        <div class="form-row">
          <div>
            <label class="field-caption">أو تحويل القرن الهجري القمري (مثال: 13 &rarr; ق13هـ)</label>
            <input type="number" class="glass-input" id="inpCentury" min="1" max="15" placeholder="مثال: 13" oninput="convertFromCentury(this.value)" />
          </div>
          <div>
            <label class="field-caption">صيغة حقل <code>=264 $c</code> المقترحة</label>
            <input type="text" class="glass-input" id="out264c" />
          </div>
          <div>
            <label class="field-caption">صيغة التاريخ في <code>=008</code> (خانة 06–10)</label>
            <input type="text" class="glass-input" id="out008Date" style="direction:ltr; font-family:'JetBrains Mono', monospace;" />
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:6px;">
          <button class="glass-pill save-btn dirty" onclick="applyConvertedDateToMarc()">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>تطبيق على حقل =264$c وحقل =008</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 4: Authority Lookup & REST API Explorer (Authors & Subjects) -->
  <div class="modal-backdrop" id="authorityModal" onclick="if(event.target===this)closeModal('authorityModal')">
    <div class="modal-glass" style="max-width:840px;">
      <div class="modal-head">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 3l9 7H3l9-7z"/></svg>
          <span>الملف الاستنادي للمؤلفين والموضوعات (kiqp.net & dromh.org API)</span>
        </div>
        <button class="glass-pill" onclick="closeModal('authorityModal')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>إغلاق</span>
        </button>
      </div>
      <div class="modal-body">
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <button class="glass-pill active" id="authTabAuthors" onclick="switchAuthTab('authors')">
            <span>المؤلفون (=100 / =700)</span>
          </button>
          <button class="glass-pill" id="authTabSubjects" onclick="switchAuthTab('subjects')">
            <span>رؤوس الموضوعات (=650)</span>
          </button>
          <input type="text" class="glass-input" id="authSearchInput" style="flex:1;" placeholder="ابحث في الملف الاستنادي..." oninput="searchAuthorities()" />
          <a id="authApiUrlLink" href="/api/authorities/authors?limit=50" target="_blank" class="glass-pill" style="font-family:'JetBrains Mono', monospace; font-size:0.72rem; direction:ltr;">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
            <span id="authApiUrlText">GET /api/authorities/authors</span>
          </a>
        </div>
        <div id="authorityResultsList" style="display:flex; flex-direction:column; gap:7px; max-height:52vh; overflow-y:auto;"></div>
      </div>
    </div>
  </div>

  <!-- MODAL 5: Reference Citation Helper (=510) -->
  <div class="modal-backdrop" id="citationModal" onclick="if(event.target===this)closeModal('citationModal')">
    <div class="modal-glass">
      <div class="modal-head">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span>أداة الاستشهاد المرجعي والتوثيق الببليوغرافي (=510)</span>
        </div>
        <button class="glass-pill" onclick="closeModal('citationModal')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>إغلاق</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div style="grid-column: 1 / -1;">
            <label class="field-caption">اختر المصدر المرجعي ($a)</label>
            <select class="glass-select" id="citSource">
              <option value="الذريعة إلى تصانيف الشيعة،">الذريعة إلى تصانيف الشيعة — آقا بزرگ الطهراني</option>
              <option value="كشف الظنون عن أسامي الكتب والفنون،">كشف الظنون عن أسامي الكتب والفنون — حاجي خليفة</option>
              <option value="إيضاح المكنون في الذيل على كشف الظنون،">إيضاح المكنون في الذيل على كشف الظنون — إسماعيل باشا البغدادي</option>
              <option value="هدية العارفين،">هدية العارفين — إسماعيل باشا البغدادي</option>
              <option value="الأعلام،">الأعلام — خير الدين الزركلي</option>
              <option value="معجم المؤلفين،">معجم المؤلفين — عمر رضا كحالة</option>
              <option value="تاريخ التراث العربي (سزكين)،">تاريخ التراث العربي — فؤاد سزكين (GAS)</option>
              <option value="تاريخ الأدب العربي (بروكلمان)،">تاريخ الأدب العربي — كارل بروكلمان (GAL)</option>
            </select>
          </div>
          <div>
            <label class="field-caption">الجزء / المجلد</label>
            <input type="text" class="glass-input" id="citVol" placeholder="مثال: 11" />
          </div>
          <div>
            <label class="field-caption">الصفحة</label>
            <input type="text" class="glass-input" id="citPage" placeholder="مثال: 192" />
          </div>
          <div>
            <label class="field-caption">رقم التسجيلة (اختياري)</label>
            <input type="text" class="glass-input" id="citNum" placeholder="مثال: 1179" />
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:6px;">
          <button class="glass-pill save-btn dirty" onclick="insertCitation510()">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>إدراج حقل =510 في التسجيلة</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast">تم الحفظ بنجاح</div>

  <script>
    const switcher = document.getElementById('themeSwitcher');
    let prevOption = "1";
    switcher.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        switcher.setAttribute('c-previous', prevOption);
        prevOption = input.getAttribute('c-option');
      });
    });

    const SVG_ICONS = {
      edit: '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:12px; height:12px;"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
      star: '<svg class="svg-ic fill" viewBox="0 0 24 24" style="color:#f6b933; width:12px; height:12px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      starEmpty: '<svg class="svg-ic stroke" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      check: '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:12px; height:12px; color:#2ecc71;"><polyline points="20 6 9 17 4 12"/></svg>',
      clock: '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:12px; height:12px; color:#f39c12;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      alert: '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:12px; height:12px; color:#e74c3c;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      plus: '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:11px; height:11px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      trash: '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:12px; height:12px;"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
    };

    const MARC_FIELD_TEMPLATES = [
      { tag: "100", title: "=100 المؤلف الرئيسي (شخص)", desc: "$a الاسم، $d التواريخ، $e مؤلف.", indicators: "1\\\\", subfields: [{ code: "a", value: "اسم المؤلف،" }, { code: "d", value: "توفي ... هجري،" }, { code: "e", value: "مؤلف." }] },
      { tag: "240", title: "=240 العنوان المقنن للمخطوطة", desc: "$a العنوان الموحد للعمل", indicators: "10", subfields: [{ code: "a", value: "" }] },
      { tag: "246", title: "=246 العنوان البديل / الموازي", desc: "$a عنوان آخر للمخطوطة", indicators: "33", subfields: [{ code: "a", value: "" }] },
      { tag: "264", title: "=264 بيانات الإنتاج والنسخ (RDA)", desc: "$a مكان النسخ : $c تاريخ النسخ", indicators: "00", subfields: [{ code: "a", value: "مكان النسخ :" }, { code: "c", value: "سنة ... هـ = [... م]" }] },
      { tag: "300", title: "=300 الوصف المادي (الأوراق والأسطر والمقاس)", desc: "$a عدد الأوراق والأسطر ؛ $c المقاس بالسم", indicators: "00", subfields: [{ code: "a", value: "... ورقة (... سطراً) ؛" }, { code: "c", value: "21×15 سم" }] },
      { tag: "340", title: "=340 الوسط المادي والمداد والخط (RDA)", desc: "$a ورق $c حبر $g اللون $d نوع الخط", indicators: "00", subfields: [{ code: "a", value: "ورق" }, { code: "c", value: "حبر" }, { code: "g", value: "اسود واحمر" }, { code: "d", value: "خط النسخ." }] },
      { tag: "351", title: "=351 نظام الترتيب والتعقيبات", desc: "$b مرتبة بنظام التعقيبات.", indicators: "00", subfields: [{ code: "b", value: "مرتبة بنظام التعقيبات." }] },
      { tag: "500", title: "=500 تبصرة بداية المخطوطة (أوله)", desc: "$a اوله : ...", indicators: "00", subfields: [{ code: "a", value: "اوله : " }] },
      { tag: "500", title: "=500 تبصرة نهاية المخطوطة (آخره)", desc: "$a اخره : ...", indicators: "00", subfields: [{ code: "a", value: "اخره : " }] },
      { tag: "500", title: "=500 تبصرة عامة", desc: "$a ملاحظة وصفية عامة", indicators: "00", subfields: [{ code: "a", value: "" }] },
      { tag: "505", title: "=505 تبصرة المحتويات (للمجاميع)", desc: "$a رسائل المجموع...", indicators: "00", subfields: [{ code: "a", value: "يشتمل المجموع على : " }] },
      { tag: "510", title: "=510 الاستشهاد المرجعي (الذريعة / كشف الظنون)", desc: "$a اسم المصدر، $c الجزء والصفحة", indicators: "40", subfields: [{ code: "a", value: "الذريعة،" }, { code: "c", value: "الجزء ...، الصفحة ...." }] },
      { tag: "520", title: "=520 تبصرة الملخص والمستخلص", desc: "$a ملخص موضوع المخطوطة", indicators: "00", subfields: [{ code: "a", value: "" }] },
      { tag: "535", title: "=535 موقع النسخة الأصلية", desc: "$a الخزانة والرقم، $c الدولة $g الرمز", indicators: "10", subfields: [{ code: "a", value: "مكتبة العتبة العباسية المقدسة : " }, { code: "c", value: "العراق" }, { code: "g", value: "iq" }] },
      { tag: "561", title: "=561 تاريخ الملكية والوقف والأختام", desc: "$a قيود التملك والوقف والأختام", indicators: "00", subfields: [{ code: "a", value: "عليها قيد تملك وختم : " }] },
      { tag: "562", title: "=562 تحديد النسخة (الجدولة والمقابلة والحواشي)", desc: "$a الجدولة والتصحيحات والتعليقات", indicators: "00", subfields: [{ code: "a", value: "النسخة مجدولة ومصححة وعليها حواشٍ." }] },
      { tag: "563", title: "=563 وصف التجليد والغلاف", desc: "$a الغلاف : جلد ...", indicators: "00", subfields: [{ code: "a", value: "الغلاف : جلد " }] },
      { tag: "583", title: "=583 حالة الحفظ والترميم والنقص", desc: "$a آثار الرطوبة أو الأرضة أو الخرم", indicators: "00", subfields: [{ code: "a", value: "النسخة عليها آثار رطوبة." }] },
      { tag: "650", title: "=650 رأس موضوع موضوعي", desc: "$a الموضوع $v مخطوطات.", indicators: "\\\\4", subfields: [{ code: "a", value: "" }, { code: "v", value: "مخطوطات." }] },
      { tag: "700", title: "=700 مدخل إضافي (الناسخ / الشارح / الجامع)", desc: "$a الاسم، $e ناسخ. / شارح. / جامع.", indicators: "10", subfields: [{ code: "a", value: "" }, { code: "e", value: "ناسخ." }] }
    ];

    const FIELD_TO_MARC_TAGS = {
      "العنوان": ["240", "245", "246"],
      "المؤلف": ["100", "245"],
      "الموضوع": ["050", "650"],
      "اللغة": ["008", "041", "546"],
      "رقم النسخة": ["098", "535"],
      "الناسخ": ["700"],
      "تاريخ النسخ": ["008", "264"],
      "عدد الاوراق": ["300"],
      "نوع الخط": ["340"],
      "مكان النسخ": ["264"],
      "المصدر": ["535", "949"],
      "أول النسخة": ["500:incipit", "583"],
      "آخر النسخة": ["500:explicit", "583"],
      "وصف النسخة": ["340", "351", "500:desc", "561", "562", "563", "583"]
    };

    const TAG_NAMES = {
      "000": "الفاتح (=LDR)", "001": "الرقم الضابط (=001)", "008": "البيانات الثابتة (=008)",
      "035": "رقم النظام (=035)", "040": "مصدر الفهرسة (=040)", "041": "رمز اللغة (=041)",
      "050": "تصنيف الكونغرس (=050)", "066": "المحارف (=066)", "098": "رقم النسخة (=098)",
      "100": "المؤلف الرئيسي (=100)", "240": "العنوان المقنن (=240)", "245": "العنوان والمسؤولية (=245)",
      "246": "العنوان البديل (=246)", "264": "بيانات النسخ (=264)", "300": "الوصف المادي (=300)",
      "336": "نوع المحتوى (=336)", "337": "نوع الوسيط (=337)", "338": "نوع الحامل (=338)",
      "340": "الوسط والخط (=340)", "351": "التعقيبات (=351)", "500": "تبصرة عامة (=500)",
      "505": "المحتويات (=505)", "510": "الاستشهاد (=510)", "520": "الملخص (=520)",
      "535": "موقع الأصل (=535)", "546": "تبصرة اللغة (=546)", "561": "الملكية والوقف (=561)",
      "562": "الجدولة والمقابلة (=562)", "563": "التجليد والغلاف (=563)", "583": "حالة الحفظ (=583)",
      "650": "رأس الموضوع (=650)", "700": "الناسخ / إضافي (=700)", "856": "الرابط الإلكتروني (=856)",
      "949": "المصدر المقتني (=949)"
    };

    let currentIdx = 17;
    let currentRecord = null;
    let currentWorkflow = { bookmarked: false, status: "none" };
    let marcViewMode = 'table';
    let listOffset = 0;
    const LIST_LIMIT = 50;
    let currentQuery = '';
    let currentFilter = 'all';
    let isDirty = false;
    let currentAuthMode = 'authors';

    document.getElementById('fieldTemplatesGrid').innerHTML = MARC_FIELD_TEMPLATES.map((tpl, i) => \`
      <div class="template-card" onclick="insertTemplateField(\${i})">
        <div style="font-weight:700; font-size:0.86rem; color:var(--c-action);">\${escapeHtml(tpl.title)}</div>
        <div style="font-size:0.74rem; opacity:0.72;">\${escapeHtml(tpl.desc)}</div>
      </div>
    \`).join('');

    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModal(id) { document.getElementById(id).classList.remove('open'); }

    function insertTemplateField(tplIdx) {
      if (!currentRecord) return;
      const tpl = MARC_FIELD_TEMPLATES[tplIdx];
      const newField = JSON.parse(JSON.stringify({
        tag: tpl.tag,
        indicators: tpl.indicators,
        subfields: tpl.subfields
      }));
      currentRecord.marc21_rda.push(newField);
      currentRecord.marc21_rda.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
      closeModal('fieldModal');
      showToast(\`تم إدراج الحقل =\${tpl.tag} بنجاح\`);
    }

    function markDirty(dirty = true) {
      isDirty = dirty;
      const btn = document.getElementById('saveBtn');
      const text = document.getElementById('saveBtnText');
      if (dirty) {
        btn.classList.add('dirty');
        text.textContent = 'حفظ التعديلات (Ctrl+S) *';
      } else {
        btn.classList.remove('dirty');
        text.textContent = 'حفظ التعديلات (Ctrl+S)';
      }
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 2400);
    }

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function getMarcRowMatchKey(m) {
      if (m.tag === "500" && m.subfields && m.subfields[0]) {
        const v = String(m.subfields[0].value || "");
        if (v.startsWith("اوله") || v.startsWith("أوله")) return "500:incipit";
        if (v.startsWith("اخره") || v.startsWith("آخره")) return "500:explicit";
        return "500:desc";
      }
      return m.tag;
    }

    function highlightFromOriginal(fieldKey, active) {
      const targets = FIELD_TO_MARC_TAGS[fieldKey] || [];
      const allMarcItems = document.querySelectorAll('[data-marc-key]');
      let firstMatched = null;
      allMarcItems.forEach(el => {
        const k = el.getAttribute('data-marc-key');
        const tag = el.getAttribute('data-marc-tag');
        if (targets.includes(k) || targets.includes(tag)) {
          if (active) {
            el.classList.add('mapped-hover');
            if (!firstMatched) firstMatched = el;
          } else {
            el.classList.remove('mapped-hover');
          }
        }
      });
      if (active && firstMatched) {
        firstMatched.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function highlightFromMarc(marcKey, marcTag, active) {
      const origBoxes = document.querySelectorAll('[data-orig-field]');
      let firstMatched = null;
      origBoxes.forEach(box => {
        const fKey = box.getAttribute('data-orig-field');
        const mapped = FIELD_TO_MARC_TAGS[fKey] || [];
        if (mapped.includes(marcKey) || mapped.includes(marcTag)) {
          if (active) {
            box.classList.add('mapped-hover');
            if (!firstMatched) firstMatched = box;
          } else {
            box.classList.remove('mapped-hover');
          }
        }
      });
      if (active && firstMatched) {
        firstMatched.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // ==================== TOOL 1: MARC 21 & RDA VALIDATOR & AUTO-FIX ====================
    function validateCurrentMarcRecord() {
      if (!currentRecord || !currentRecord.marc21_rda) return [];
      const marc = currentRecord.marc21_rda;
      const issues = [];

      const hasTag = t => marc.some(m => m.tag === t);
      const getTag = t => marc.find(m => m.tag === t);

      const t040 = getTag("040");
      if (!t040 || !t040.subfields || !t040.subfields.some(s => s.code === "e" && s.value.toLowerCase() === "rda")) {
        issues.push({ code: "RDA_040", title: "حقل =040 يفتقر إلى رمز قواعد وصف المصادر وإتاحتها ($e rda)", severity: "تحذير" });
      }

      if (!hasTag("336") || !hasTag("337") || !hasTag("338")) {
        issues.push({ code: "RDA_TRIPLET", title: "حقول RDA الأساسية (=336 نوع المحتوى، =337 نوع الوسيط، =338 نوع الحامل) غير مكتملة", severity: "خطأ" });
      }

      const has100 = hasTag("100");
      const t245 = getTag("245");
      if (t245) {
        const expectedInd1 = has100 ? "1" : "0";
        const curInd = String(t245.indicators || "00");
        if (curInd[0] !== expectedInd1) {
          issues.push({ code: "IND_245", title: \`المؤشر الأول في حقل =245 هو (\${curInd}) بينما يجب أن يكون (\${expectedInd1}0) بناءً على وجود/عدم وجود حقل =100\`, severity: "خطأ" });
        }
      } else {
        issues.push({ code: "MISSING_245", title: "التسجيلة تفتقر إلى حقل العنوان الأساسي (=245)", severity: "خطأ" });
      }

      const t100 = getTag("100");
      if (t100 && t100.subfields && !t100.subfields.some(s => s.code === "e")) {
        issues.push({ code: "RDA_100E", title: "حقل المؤلف (=100) يفتقر إلى تسمية العلاقة في RDA ($e مؤلف.)", severity: "تحذير" });
      }

      marc.filter(m => m.tag === "700").forEach(t700 => {
        if (t700.subfields && !t700.subfields.some(s => s.code === "e")) {
          issues.push({ code: "RDA_700E", title: "حقل المدخل الإضافي (=700) يفتقر إلى تسمية العلاقة في RDA ($e ناسخ. / جامع.)", severity: "تحذير" });
        }
      });

      const t650s = marc.filter(m => m.tag === "650");
      if (t650s.length === 0) {
        issues.push({ code: "MISSING_650", title: "لا يوجد رأس موضوع (=650) في التسجيلة", severity: "تحذير" });
      } else {
        t650s.forEach(t650 => {
          if (t650.subfields && !t650.subfields.some(s => s.code === "v" && s.value.includes("مخطوطات"))) {
            issues.push({ code: "SUBJ_V", title: "رأس الموضوع (=650) يفتقر إلى التفريع الشكلي ($v مخطوطات.) حسب معيار kiqp.net", severity: "تحذير" });
          }
        });
      }

      const t008 = getTag("008");
      if (!t008 || String(t008.value || "").length !== 40) {
        issues.push({ code: "LEN_008", title: "طول حقل البيانات الثابتة (=008) يجب أن يكون 40 خانة بالضبط", severity: "تحذير" });
      }

      return issues;
    }

    function runLiveValidation() {
      const issues = validateCurrentMarcRecord();
      const text = document.getElementById('validatorPillText');
      if (issues.length === 0) {
        text.textContent = 'مدقق الجودة: مطابق لمعيار RDA (0 تنبيهات)';
      } else {
        text.textContent = \`مدقق الجودة (\${issues.length} ملاحظة قابلة للإصلاح)\`;
      }
    }

    function openValidatorModal() {
      const issues = validateCurrentMarcRecord();
      const body = document.getElementById('validatorResultsBody');
      if (issues.length === 0) {
        body.innerHTML = \`
          <div class="auth-item" style="justify-content:center; padding:24px; font-weight:700; gap:8px;">
            <svg class="svg-ic stroke" viewBox="0 0 24 24" style="color:#2ecc71; width:20px; height:20px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>جميع حقول التسجيلة مطابقة تماماً لقواعد MARC 21 ومعيار RDA (IQ-KaCCS)!</span>
          </div>
        \`;
      } else {
        body.innerHTML = issues.map(iss => \`
          <div class="auth-item">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24" style="color:#e67e22; width:16px; height:16px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <div style="font-weight:700; font-size:0.88rem;">\${escapeHtml(iss.title)}</div>
                <div style="font-size:0.74rem; opacity:0.65;">الرمز المعياري: \${iss.code} — المستوى: \${iss.severity}</div>
              </div>
            </div>
          </div>
        \`).join('');
      }
      openModal('validatorModal');
    }

    function autoFixMarcRecord() {
      if (!currentRecord || !currentRecord.marc21_rda) return;
      const marc = currentRecord.marc21_rda;
      const getTag = t => marc.find(m => m.tag === t);

      let t040 = getTag("040");
      if (!t040) {
        marc.push({
          tag: "040", indicators: "00",
          subfields: [{ code: "a", value: "IQ-KaCCS" }, { code: "b", value: "ara" }, { code: "c", value: "IQ-KaCCS" }, { code: "e", value: "rda" }]
        });
      } else if (t040.subfields && !t040.subfields.some(s => s.code === "e")) {
        t040.subfields.push({ code: "e", value: "rda" });
      }

      if (!getTag("336")) marc.push({ tag: "336", indicators: "00", subfields: [{ code: "a", value: "نص" }, { code: "b", value: "txt" }, { code: "2", value: "rdacontent" }, { code: "3", value: "مخطوط" }] });
      if (!getTag("337")) marc.push({ tag: "337", indicators: "00", subfields: [{ code: "a", value: "بدون وسيط" }, { code: "b", value: "n" }, { code: "2", value: "rdamedia" }] });
      if (!getTag("338")) marc.push({ tag: "338", indicators: "00", subfields: [{ code: "a", value: "مجلد" }, { code: "b", value: "nc" }, { code: "2", value: "rdacarrier" }] });

      const t100 = getTag("100");
      if (t100 && t100.subfields && !t100.subfields.some(s => s.code === "e")) {
        t100.subfields.push({ code: "e", value: "مؤلف." });
      }
      const t245 = getTag("245");
      if (t245) t245.indicators = t100 ? "10" : "00";
      const t240 = getTag("240");
      if (t240) t240.indicators = t100 ? "10" : "00";

      marc.filter(m => m.tag === "700").forEach(t700 => {
        if (t700.subfields && !t700.subfields.some(s => s.code === "e")) {
          t700.subfields.push({ code: "e", value: "ناسخ." });
        }
      });

      marc.filter(m => m.tag === "650").forEach(t650 => {
        if (t650.subfields && !t650.subfields.some(s => s.code === "v" && s.value.includes("مخطوطات"))) {
          t650.subfields.push({ code: "v", value: "مخطوطات." });
        }
      });

      let t008 = getTag("008");
      if (!t008) {
        marc.push({ tag: "008", value: "261016nuuuu    xx            000 0 ara d" });
      } else {
        t008.value = String(t008.value || "").padEnd(40, " ").slice(0, 40);
      }

      marc.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
      openValidatorModal();
      showToast('تم إصلاح ومطابقة جميع حقول MARC 21 & RDA تلقائياً');
    }

    // ==================== TOOL 2: HIJRI QAMARI / SHAMSI / GREGORIAN CONVERTER ====================
    function openDateConverterModal() {
      if (currentRecord && currentRecord.source_fields) {
        const rawDate = currentRecord.source_fields['تاريخ النسخ'] || '';
        const yMatch = rawDate.match(/(\\d{3,4})/);
        const cMatch = rawDate.match(/ق\\s*(\\d{1,2})/);
        if (yMatch) {
          document.getElementById('inpQamari').value = yMatch[1];
          convertFromQamari(yMatch[1]);
        } else if (cMatch) {
          document.getElementById('inpCentury').value = cMatch[1];
          convertFromCentury(cMatch[1]);
        }
      }
      openModal('dateModal');
    }

    function convertFromQamari(val) {
      const hq = parseInt(val, 10);
      if (isNaN(hq)) return;
      const g = Math.round(hq - (hq / 33) + 622);
      const hs = g - 621;
      document.getElementById('inpGregorian').value = g;
      document.getElementById('inpShamsi').value = hs;
      document.getElementById('out264c').value = \`\${hq} هـ.ق (\${hs} هـ.ش) = [\${g} م]\`;
      document.getElementById('out008Date').value = \`s\${String(g).padStart(4, '0')}\`;
    }

    function convertFromShamsi(val) {
      const hs = parseInt(val, 10);
      if (isNaN(hs)) return;
      const g = hs + 621;
      const hq = Math.round((g - 622) * (33 / 32));
      document.getElementById('inpGregorian').value = g;
      document.getElementById('inpQamari').value = hq;
      document.getElementById('out264c').value = \`\${hs} هـ.ش (\${hq} هـ.ق) = [\${g} م]\`;
      document.getElementById('out008Date').value = \`s\${String(g).padStart(4, '0')}\`;
    }

    function convertFromGregorian(val) {
      const g = parseInt(val, 10);
      if (isNaN(g)) return;
      const hs = g - 621;
      const hq = Math.round((g - 622) * (33 / 32));
      document.getElementById('inpQamari').value = hq;
      document.getElementById('inpShamsi').value = hs;
      document.getElementById('out264c').value = \`\${hq} هـ.ق (\${hs} هـ.ش) = [\${g} م]\`;
      document.getElementById('out008Date').value = \`s\${String(g).padStart(4, '0')}\`;
    }

    function convertFromCentury(val) {
      const c = parseInt(val, 10);
      if (isNaN(c) || c < 1 || c > 15) return;
      const midHq = (c - 1) * 100 + 50;
      const g = Math.round(midHq - (midHq / 33) + 622);
      const gCent = Math.floor(g / 100) + 1;
      const gPrefix = String(g).slice(0, 2);
      document.getElementById('out264c').value = \`القرن \${c} هـ = [القرن \${gCent} م]\`;
      document.getElementById('out008Date').value = \`s\${gPrefix}uu\`;
    }

    function applyConvertedDateToMarc() {
      if (!currentRecord) return;
      const v264 = document.getElementById('out264c').value.trim();
      const v008 = document.getElementById('out008Date').value.trim();
      if (!v264) return;

      const marc = currentRecord.marc21_rda;
      let t264 = marc.find(m => m.tag === "264");
      if (!t264) {
        t264 = { tag: "264", indicators: "00", subfields: [{ code: "c", value: v264 }] };
        marc.push(t264);
      } else {
        const cSub = (t264.subfields || []).find(s => s.code === "c");
        if (cSub) cSub.value = v264;
        else t264.subfields.push({ code: "c", value: v264 });
      }

      if (v008 && v008.length === 5) {
        let t008 = marc.find(m => m.tag === "008");
        if (t008 && t008.value && t008.value.length >= 11) {
          t008.value = t008.value.slice(0, 6) + v008 + t008.value.slice(11);
        }
      }

      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
      closeModal('dateModal');
      showToast('تم تحديث التاريخ في حقل =264$c وحقل =008');
    }

    // ==================== TOOL 3: AUTHORITY LOOKUP & API (AUTHORS & SUBJECTS) ====================
    function openAuthorityModal() {
      openModal('authorityModal');
      searchAuthorities();
    }

    function switchAuthTab(mode) {
      currentAuthMode = mode;
      document.getElementById('authTabAuthors').classList.toggle('active', mode === 'authors');
      document.getElementById('authTabSubjects').classList.toggle('active', mode === 'subjects');
      searchAuthorities();
    }

    async function searchAuthorities() {
      const q = document.getElementById('authSearchInput').value.trim();
      const apiPath = \`/api/authorities/\${currentAuthMode}?q=\${encodeURIComponent(q)}&limit=50\`;
      const link = document.getElementById('authApiUrlLink');
      const text = document.getElementById('authApiUrlText');
      link.href = apiPath;
      text.textContent = \`GET \${apiPath}\`;

      const res = await fetch(apiPath);
      const data = await res.json();
      const listEl = document.getElementById('authorityResultsList');

      if (currentAuthMode === 'authors') {
        listEl.innerHTML = (data.items || []).map((item, i) => \`
          <div class="auth-item">
            <div>
              <div style="font-weight:700; font-size:0.9rem;">\${escapeHtml(item.name)} <span style="opacity:0.75;">\${escapeHtml(item.dates || '')}</span></div>
              <div style="font-size:0.73rem; opacity:0.65;">المصدر: \${escapeHtml(item.source)} — عدد المخطوطات: \${item.count}</div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="glass-pill" onclick='applyAuthorAuthority(\${JSON.stringify(item.marc100).replace(/'/g, "&#39;")}, "100")'>
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>تعيين كمؤلف (=100)</span>
              </button>
              <button class="glass-pill" onclick='applyAuthorAuthority(\${JSON.stringify(item.marc100).replace(/'/g, "&#39;")}, "700")'>
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                <span>إضافة كمدخل (=700)</span>
              </button>
            </div>
          </div>
        \`).join('');
      } else {
        listEl.innerHTML = (data.items || []).map(item => \`
          <div class="auth-item">
            <div>
              <div style="font-weight:700; font-size:0.9rem;">\${escapeHtml(item.fullHeading)}</div>
              <div style="font-size:0.73rem; opacity:0.65;">المصدر: \${escapeHtml(item.source)} — عدد المخطوطات: \${item.count}</div>
            </div>
            <button class="glass-pill" onclick='applySubjectAuthority(\${JSON.stringify(item.marc650).replace(/'/g, "&#39;")})'>
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span>إدراج رأس الموضوع (=650)</span>
            </button>
          </div>
        \`).join('');
      }
    }

    function applyAuthorAuthority(marc100Obj, targetTag) {
      if (!currentRecord) return;
      const cloned = JSON.parse(JSON.stringify(marc100Obj));
      cloned.tag = targetTag;
      if (targetTag === "100") {
        const idx = currentRecord.marc21_rda.findIndex(m => m.tag === "100");
        if (idx !== -1) currentRecord.marc21_rda[idx] = cloned;
        else currentRecord.marc21_rda.push(cloned);
      } else {
        currentRecord.marc21_rda.push(cloned);
      }
      currentRecord.marc21_rda.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
      closeModal('authorityModal');
      showToast(\`تم تطبيق الاسم الاستنادي في حقل =\${targetTag}\`);
    }

    function applySubjectAuthority(marc650Obj) {
      if (!currentRecord) return;
      const cloned = JSON.parse(JSON.stringify(marc650Obj));
      currentRecord.marc21_rda.push(cloned);
      currentRecord.marc21_rda.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
      closeModal('authorityModal');
      showToast('تم إدراج رأس الموضوع الاستنادي في حقل =650');
    }

    // ==================== TOOL 4: REFERENCE CITATION HELPER (=510) ====================
    function openCitationModal() {
      openModal('citationModal');
    }

    function insertCitation510() {
      if (!currentRecord) return;
      const src = document.getElementById('citSource').value;
      const vol = document.getElementById('citVol').value.trim();
      const page = document.getElementById('citPage').value.trim();
      const num = document.getElementById('citNum').value.trim();

      const parts = [];
      if (vol) parts.push(\`الجزء \${vol}\`);
      if (page) parts.push(\`الصفحة \${page}\`);
      if (num) parts.push(\`الرقم \${num}\`);
      const cVal = parts.length > 0 ? parts.join('، ') + '.' : 'جزء ...، صفحة ....';

      currentRecord.marc21_rda.push({
        tag: "510",
        indicators: "40",
        subfields: [
          { code: "a", value: src },
          { code: "c", value: cVal }
        ]
      });
      currentRecord.marc21_rda.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
      markDirty(true);
      renderMarc(currentRecord);
      closeModal('citationModal');
      showToast('تم إدراج الاستشهاد المرجعي في حقل =510');
    }

    // ==================== TOOL 5: WORKFLOW STATUS & BOOKMARKS ====================
    function renderWorkflowControls() {
      const bBtn = document.getElementById('bookmarkBtn');
      const bIcon = document.getElementById('bookmarkIcon');
      const bText = document.getElementById('bookmarkText');
      if (currentWorkflow.bookmarked) {
        bBtn.classList.add('active');
        bIcon.innerHTML = SVG_ICONS.star;
        bText.textContent = 'في المفضلة';
      } else {
        bBtn.classList.remove('active');
        bIcon.innerHTML = SVG_ICONS.starEmpty;
        bText.textContent = 'مفضلة';
      }
      document.getElementById('workflowSelect').value = currentWorkflow.status || 'none';
    }

    async function toggleBookmark() {
      currentWorkflow.bookmarked = !currentWorkflow.bookmarked;
      renderWorkflowControls();
      await saveWorkflowState();
      showToast(currentWorkflow.bookmarked ? 'تمت إضافة المخطوطة إلى المفضلة' : 'تمت إزالة المخطوطة من المفضلة');
    }

    async function changeWorkflowStatus(statusVal) {
      currentWorkflow.status = statusVal;
      await saveWorkflowState();
      showToast('تم تحديث حالة الفهرسة للمخطوطة');
    }

    async function saveWorkflowState() {
      await fetch(\`/api/workflow?idx=\${currentIdx}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentWorkflow)
      });
      loadList();
    }

    function setListFilter(flt) {
      currentFilter = flt;
      ['all', 'edited', 'bookmarked', 'approved', 'review', 'attention'].forEach(k => {
        document.getElementById('flt-' + k).classList.toggle('active', k === flt);
      });
      listOffset = 0;
      loadList();
    }

    // ==================== CORE LIST & RECORD RENDERING ====================
    async function loadList() {
      const url = \`/api/list?offset=\${listOffset}&limit=\${LIST_LIMIT}&q=\${encodeURIComponent(currentQuery)}&filter=\${encodeURIComponent(currentFilter)}\`;
      const res = await fetch(url);
      const data = await res.json();
      const listEl = document.getElementById('resultsList');
      document.getElementById('listHeaderTitle').textContent = \`المخطوطات (\${data.total.toLocaleString()})\`;
      document.getElementById('listPageInfo').textContent = data.total > 0 ? \`\${listOffset + 1}-\${Math.min(listOffset + LIST_LIMIT, data.total)}\` : '0';

      const statusBadge = (s) => {
        if (s === 'approved') return SVG_ICONS.check;
        if (s === 'review') return SVG_ICONS.clock;
        if (s === 'attention') return SVG_ICONS.alert;
        return '';
      };

      listEl.innerHTML = data.items.map(item => \`
        <div class="result-item \${item.idx === currentIdx ? 'active' : ''}" id="item-\${item.idx}" onclick="selectRecord(\${item.idx})">
          <div class="r-top">
            <span style="display:inline-flex; align-items:center; gap:4px;">
              <span>#\${(item.idx + 1).toLocaleString()}</span>
              \${item.edited ? SVG_ICONS.edit : ''}
              \${item.bookmarked ? SVG_ICONS.star : ''}
              \${statusBadge(item.status)}
            </span>
            <span>نسخة: \${escapeHtml(item.copyNum || '-')}</span>
          </div>
          <div class="r-title">\${escapeHtml(item.title || 'بدون عنوان')}</div>
          <div class="r-author">\${escapeHtml(item.author || 'مجهول')}</div>
        </div>
      \`).join('');
    }

    async function selectRecord(idx) {
      if (idx < 0 || idx >= 107149) return;
      currentIdx = idx;
      document.getElementById('jumpInput').value = idx + 1;

      document.querySelectorAll('.result-item').forEach(el => el.classList.remove('active'));
      const activeEl = document.getElementById(\`item-\${idx}\`);
      if (activeEl) activeEl.classList.add('active');

      const res = await fetch(\`/api/record?idx=\${idx}\`);
      const payload = await res.json();
      currentRecord = payload.record;
      currentWorkflow = payload.workflow || { bookmarked: false, status: 'none' };
      markDirty(false);
      renderWorkflowControls();
      renderOriginal(currentRecord);
      renderMarc(currentRecord);
      runLiveValidation();
    }

    function updateOriginalField(key, val) {
      if (!currentRecord) return;
      if (!currentRecord.source_fields) currentRecord.source_fields = {};
      currentRecord.source_fields[key] = val;
      markDirty(true);
    }

    function renderFieldBox(key, label, val, eqTagsText, isTextarea = false, extraClass = '') {
      const safeVal = escapeHtml(val || '');
      const pills = eqTagsText.map(t => \`<span class="eq-pill">\${t}</span>\`).join('');
      const inputEl = isTextarea
        ? \`<textarea class="editable-textarea manuscript-textarea" oninput="updateOriginalField('\${key}', this.value)">\${safeVal}</textarea>\`
        : \`<input type="text" class="editable-input \${key === 'العنوان' ? 'hero-input' : ''}" value="\${safeVal}" oninput="updateOriginalField('\${key}', this.value)" />\`;

      return \`
        <div class="orig-field-box \${extraClass}"
             data-orig-field="\${key}"
             onmouseenter="highlightFromOriginal('\${key}', true)"
             onmouseleave="highlightFromOriginal('\${key}', false)">
          <div class="field-header-row">
            <span class="field-caption">\${label}</span>
            <div class="eq-tag-pills">\${pills}</div>
          </div>
          \${inputEl}
        </div>
      \`;
    }

    function renderOriginal(rec) {
      const f = rec.source_fields || {};
      const link = document.getElementById('dromhLink');
      link.href = rec.viewUrl || 'https://dromh.org/?field=0&filter=list&type=reg';

      const html = \`
        \${renderFieldBox('العنوان', 'العنوان', f['العنوان'], ['=240', '=245$a', '=246'])}

        <div class="meta-grid">
          \${renderFieldBox('المؤلف', 'المؤلف', f['المؤلف'], ['=100$a$d', '=245$c'])}
          \${renderFieldBox('الموضوع', 'الموضوع', f['الموضوع'], ['=050', '=650$a'])}
          \${renderFieldBox('اللغة', 'اللغة', f['اللغة'], ['=008', '=041', '=546'])}
          \${renderFieldBox('رقم النسخة', 'رقم النسخة', f['رقم النسخة'], ['=098$a', '=535$a'])}
          \${renderFieldBox('الناسخ', 'الناسخ', f['الناسخ'], ['=700$a$e'])}
          \${renderFieldBox('تاريخ النسخ', 'تاريخ النسخ', f['تاريخ النسخ'], ['=008', '=264$c'])}
          \${renderFieldBox('عدد الاوراق', 'عدد الأوراق', f['عدد الاوراق'], ['=300$a'])}
          \${renderFieldBox('نوع الخط', 'نوع الخط', f['نوع الخط'], ['=340$d'])}
          \${renderFieldBox('مكان النسخ', 'مكان النسخ', f['مكان النسخ'], ['=264$a'], false, 'span-2')}
          \${renderFieldBox('المصدر', 'المصدر (خزانة المخطوطات)', f['المصدر'], ['=535$a', '=949$a'], false, 'span-2')}
        </div>

        <div style="margin-top:9px;">
          \${renderFieldBox('أول النسخة', 'أول النسخة (Incipit)', f['أول النسخة'], ['=500$a (اوله)', '=583'], true)}
          \${renderFieldBox('آخر النسخة', 'آخر النسخة (Explicit)', f['آخر النسخة'], ['=500$a (اخره)', '=583'], true)}
          \${renderFieldBox('وصف النسخة', 'وصف النسخة', f['وصف النسخة'], ['=340$g', '=500$a', '=561', '=562', '=563', '=583'], true)}
        </div>
      \`;
      document.getElementById('originalContainer').innerHTML = html;
    }

    function toMrkString(marc) {
      return (marc || []).map(field => {
        if (!field.subfields) {
          return \`=\${field.tag === '000' ? 'LDR' : field.tag}  \${field.value}\`;
        }
        const ind = (field.indicators || '\\\\\\\\').padEnd(2, '\\\\').slice(0, 2);
        const subs = field.subfields.map(s => \`$\${s.code}\${s.value}\`).join('');
        return \`=\${field.tag}  \${ind}\${subs}\`;
      }).join('\\n');
    }

    function parseMrkStringToMarc(mrkText) {
      const lines = mrkText.split(/\\r?\\n/).map(l => l.trim()).filter(Boolean);
      const out = [];
      for (const line of lines) {
        const m = line.match(/^=([A-Z0-9]{3})\\s{1,2}(.*)$/i);
        if (!m) continue;
        const rawTag = m[1].toUpperCase() === 'LDR' ? '000' : m[1];
        const rest = m[2];
        if ((rawTag === '000' || parseInt(rawTag, 10) < 10) && !rest.includes('$')) {
          out.push({ tag: rawTag, value: rest });
        } else {
          const ind = rest.slice(0, 2);
          const subPart = rest.slice(2);
          const subfields = [];
          const parts = subPart.split('$').filter(Boolean);
          for (const p of parts) {
            subfields.push({ code: p[0] || 'a', value: p.slice(1) });
          }
          out.push({ tag: rawTag, indicators: ind, subfields });
        }
      }
      return out;
    }

    function renderMarc(rec) {
      const container = document.getElementById('marcContainer');
      const marc = rec.marc21_rda || [];

      if (marcViewMode === 'mrk') {
        const interactiveLines = marc.map(m => {
          const mKey = getMarcRowMatchKey(m);
          const dispTag = m.tag === '000' ? '=LDR' : \`=\${m.tag}\`;
          const rest = !m.subfields
            ? m.value
            : \`\${(m.indicators || '\\\\\\\\').padEnd(2, '\\\\')} \${m.subfields.map(s => '$' + s.code + s.value).join(' ')}\`;
          return \`
            <div class="mrk-line"
                 data-marc-key="\${escapeHtml(mKey)}"
                 data-marc-tag="\${escapeHtml(m.tag)}"
                 onmouseenter="highlightFromMarc('\${escapeHtml(mKey)}', '\${escapeHtml(m.tag)}', true)"
                 onmouseleave="highlightFromMarc('\${escapeHtml(mKey)}', '\${escapeHtml(m.tag)}', false)">
              <span class="mrk-eq-tag">\${escapeHtml(dispTag)}</span>
              <span>\${escapeHtml(rest)}</span>
            </div>
          \`;
        }).join('');

        container.innerHTML = \`
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div class="mrk-interactive-lines">\${interactiveLines}</div>
            <textarea class="code-editor" id="mrkTextarea" oninput="onMrkTextEdit(this.value)">\${escapeHtml(toMrkString(marc))}</textarea>
          </div>
        \`;
        return;
      }

      if (marcViewMode === 'json') {
        container.innerHTML = \`
          <textarea class="code-editor" id="jsonTextarea" oninput="onJsonTextEdit(this.value)">\${escapeHtml(JSON.stringify(rec, null, 2))}</textarea>
        \`;
        return;
      }

      const items = marc.map((m, rowIdx) => {
        const mKey = getMarcRowMatchKey(m);
        const tagName = TAG_NAMES[m.tag] || \`حقل (=\${m.tag})\`;
        const dispTag = \`=\${m.tag}\`;

        if (!m.subfields) {
          return \`
            <div class="marc-item"
                 data-marc-key="\${escapeHtml(mKey)}"
                 data-marc-tag="\${escapeHtml(m.tag)}"
                 onmouseenter="highlightFromMarc('\${escapeHtml(mKey)}', '\${escapeHtml(m.tag)}', true)"
                 onmouseleave="highlightFromMarc('\${escapeHtml(mKey)}', '\${escapeHtml(m.tag)}', false)">
              <input class="m-tag-input" value="\${escapeHtml(dispTag)}" onchange="updateMarcTag(\${rowIdx}, this.value)" />
              <span class="m-ind" style="padding-top:4px; text-align:center;">—</span>
              <span class="m-label">\${escapeHtml(tagName)}</span>
              <div class="m-val">
                <input class="sub-val-input" style="direction:ltr; font-family:'JetBrains Mono', monospace;" value="\${escapeHtml(m.value)}" oninput="updateMarcFixed(\${rowIdx}, this.value)" />
              </div>
              <button class="icon-btn" title="حذف الحقل" onclick="deleteMarcRow(\${rowIdx})">
                \${SVG_ICONS.trash}
              </button>
            </div>
          \`;
        }

        const subsHtml = m.subfields.map((s, subIdx) => \`
          <div class="sub-edit-row">
            <input class="sub-code-badge" value="$\${escapeHtml(s.code)}" onchange="updateSubCode(\${rowIdx}, \${subIdx}, this.value)" />
            <input class="sub-val-input" value="\${escapeHtml(s.value)}" oninput="updateSubVal(\${rowIdx}, \${subIdx}, this.value)" />
            <button class="icon-btn" title="إضافة حقل فرعي" onclick="addSubfield(\${rowIdx}, \${subIdx})">\${SVG_ICONS.plus}</button>
            <button class="icon-btn" title="حذف الحقل الفرعي" onclick="deleteSubfield(\${rowIdx}, \${subIdx})">\${SVG_ICONS.trash}</button>
          </div>
        \`).join('');

        return \`
          <div class="marc-item"
               data-marc-key="\${escapeHtml(mKey)}"
               data-marc-tag="\${escapeHtml(m.tag)}"
               onmouseenter="highlightFromMarc('\${escapeHtml(mKey)}', '\${escapeHtml(m.tag)}', true)"
               onmouseleave="highlightFromMarc('\${escapeHtml(mKey)}', '\${escapeHtml(m.tag)}', false)">
            <input class="m-tag-input" value="\${escapeHtml(dispTag)}" onchange="updateMarcTag(\${rowIdx}, this.value)" />
            <input class="m-ind-input" value="\${escapeHtml(m.indicators || '\\\\\\\\')}" oninput="updateMarcInd(\${rowIdx}, this.value)" />
            <span class="m-label">\${escapeHtml(tagName)}</span>
            <div class="m-val">\${subsHtml}</div>
            <button class="icon-btn" title="حذف الحقل" onclick="deleteMarcRow(\${rowIdx})">
              \${SVG_ICONS.trash}
            </button>
          </div>
        \`;
      }).join('');

      container.innerHTML = \`<div class="marc-list">\${items}</div>\`;
    }

    function updateMarcTag(rowIdx, val) {
      const clean = val.replace(/^=/, '').trim();
      currentRecord.marc21_rda[rowIdx].tag = clean;
      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
    }

    function updateMarcInd(rowIdx, val) {
      currentRecord.marc21_rda[rowIdx].indicators = val;
      markDirty(true);
      runLiveValidation();
    }

    function updateMarcFixed(rowIdx, val) {
      currentRecord.marc21_rda[rowIdx].value = val;
      markDirty(true);
      runLiveValidation();
    }

    function updateSubCode(rowIdx, subIdx, val) {
      const clean = val.replace(/^\\$/, '').trim() || 'a';
      currentRecord.marc21_rda[rowIdx].subfields[subIdx].code = clean;
      markDirty(true);
      runLiveValidation();
    }

    function updateSubVal(rowIdx, subIdx, val) {
      currentRecord.marc21_rda[rowIdx].subfields[subIdx].value = val;
      markDirty(true);
      runLiveValidation();
    }

    function addSubfield(rowIdx, afterSubIdx) {
      currentRecord.marc21_rda[rowIdx].subfields.splice(afterSubIdx + 1, 0, { code: 'a', value: '' });
      markDirty(true);
      renderMarc(currentRecord);
    }

    function deleteSubfield(rowIdx, subIdx) {
      const subs = currentRecord.marc21_rda[rowIdx].subfields;
      if (subs.length > 1) subs.splice(subIdx, 1);
      else currentRecord.marc21_rda.splice(rowIdx, 1);
      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
    }

    function deleteMarcRow(rowIdx) {
      currentRecord.marc21_rda.splice(rowIdx, 1);
      markDirty(true);
      renderMarc(currentRecord);
      runLiveValidation();
    }

    function onMrkTextEdit(val) {
      const parsed = parseMrkStringToMarc(val);
      if (parsed.length > 0) {
        currentRecord.marc21_rda = parsed;
        markDirty(true);
        runLiveValidation();
      }
    }

    function onJsonTextEdit(val) {
      try {
        const parsed = JSON.parse(val);
        if (parsed && parsed.marc21_rda) {
          currentRecord = parsed;
          markDirty(true);
          runLiveValidation();
        }
      } catch (e) {}
    }

    async function syncOriginalToMarc() {
      if (!currentRecord) return;
      const res = await fetch('/api/regenerate-marc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRecord)
      });
      if (res.ok) {
        const updated = await res.json();
        currentRecord.marc21_rda = updated.marc21_rda;
        markDirty(true);
        renderMarc(currentRecord);
        runLiveValidation();
        showToast('تم تحديث حقول MARC 21 & RDA من السجل الأصلي');
      }
    }

    async function saveCurrentRecord() {
      if (!currentRecord) return;
      const res = await fetch(\`/api/save?idx=\${currentIdx}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentRecord)
      });
      if (res.ok) {
        markDirty(false);
        loadList();
        showToast('تم حفظ التعديلات على السجل #' + (currentIdx + 1));
      } else {
        showToast('حدث خطأ أثناء الحفظ');
      }
    }

    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentRecord();
      }
    });

    function setMarcView(mode) {
      marcViewMode = mode;
      ['tabTable', 'tabMrk', 'tabJson'].forEach(id => document.getElementById(id).classList.remove('active'));
      if (mode === 'table') document.getElementById('tabTable').classList.add('active');
      if (mode === 'mrk') document.getElementById('tabMrk').classList.add('active');
      if (mode === 'json') document.getElementById('tabJson').classList.add('active');
      if (currentRecord) renderMarc(currentRecord);
    }

    function stepRecord(delta) {
      const next = currentIdx + delta;
      if (next >= 0 && next < 107149) {
        selectRecord(next);
        if (!currentQuery && currentFilter === 'all' && (next < listOffset || next >= listOffset + LIST_LIMIT)) {
          listOffset = Math.floor(next / LIST_LIMIT) * LIST_LIMIT;
          loadList();
        }
      }
    }

    function jumpToInput() {
      const v = parseInt(document.getElementById('jumpInput').value, 10);
      if (!isNaN(v) && v >= 1 && v <= 107149) {
        const idx = v - 1;
        listOffset = Math.floor(idx / LIST_LIMIT) * LIST_LIMIT;
        loadList();
        selectRecord(idx);
      }
    }

    function jumpTo783() {
      listOffset = 0;
      loadList();
      selectRecord(17);
    }

    function changeListPage(dir) {
      const nextOffset = listOffset + dir * LIST_LIMIT;
      if (nextOffset >= 0) {
        listOffset = nextOffset;
        loadList();
      }
    }

    function doSearch() {
      currentQuery = document.getElementById('searchInput').value.trim();
      listOffset = 0;
      loadList();
    }

    function resetSearch() {
      document.getElementById('searchInput').value = '';
      currentQuery = '';
      currentFilter = 'all';
      ['all', 'edited', 'bookmarked', 'approved', 'review', 'attention'].forEach(k => {
        document.getElementById('flt-' + k).classList.toggle('active', k === 'all');
      });
      listOffset = Math.floor(currentIdx / LIST_LIMIT) * LIST_LIMIT;
      loadList();
    }

    document.getElementById('searchInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch();
    });

    function downloadMrc() {
      window.location.href = \`/api/download-mrc?idx=\${currentIdx}\`;
    }

    function copyMarc() {
      if (!currentRecord) return;
      const text = marcViewMode === 'json'
        ? JSON.stringify(currentRecord, null, 2)
        : toMrkString(currentRecord.marc21_rda);
      navigator.clipboard.writeText(text).then(() => {
        showToast('تم نسخ تسجيلة MARC 21 إلى الحافظة');
      });
    }

    loadList();
    selectRecord(17);
  </script>
</body>
</html>\`;

const server = http.createServer((req, res) => {
  const u = new URL(req.url, \`http://localhost:\${PORT}\`);

  if (u.pathname === "/logo.png") {
    if (fs.existsSync(LOGO_PATH)) {
      res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" });
      return fs.createReadStream(LOGO_PATH).pipe(res);
    }
    res.writeHead(404);
    return res.end();
  }

  // REST API 1: Authors Authority API (harvested from kiqp.net + 107,149 dromh.org records)
  if (u.pathname === "/api/authorities/authors") {
    const q = (u.searchParams.get("q") || "").trim();
    const limit = Math.min(500, Math.max(1, parseInt(u.searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(u.searchParams.get("offset") || "0", 10));
    const filtered = q
      ? authorsAuthorityList.filter(a => a.name.includes(q) || (a.dates && a.dates.includes(q)))
      : authorsAuthorityList;
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      total: filtered.length,
      offset,
      limit,
      items: filtered.slice(offset, offset + limit)
    }, null, 2));
  }

  // REST API 2: Subjects Authority API (harvested from kiqp.net + 107,149 dromh.org records)
  if (u.pathname === "/api/authorities/subjects") {
    const q = (u.searchParams.get("q") || "").trim();
    const limit = Math.min(500, Math.max(1, parseInt(u.searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(u.searchParams.get("offset") || "0", 10));
    const filtered = q
      ? subjectsAuthorityList.filter(s => s.fullHeading.includes(q))
      : subjectsAuthorityList;
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      total: filtered.length,
      offset,
      limit,
      items: filtered.slice(offset, offset + limit)
    }, null, 2));
  }

  if (u.pathname === "/api/record") {
    const idx = parseInt(u.searchParams.get("idx") || "0", 10);
    const rec = getRecordByIndex(idx);
    if (!rec) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ error: "Not found" }));
    }
    const wf = workflowState[idx] || { bookmarked: false, status: "none" };
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ record: rec, workflow: wf }));
  }

  if (u.pathname === "/api/save" && req.method === "POST") {
    const idx = parseInt(u.searchParams.get("idx") || "0", 10);
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const recObj = JSON.parse(body);
        saveRecordByIndex(idx, recObj);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (u.pathname === "/api/workflow" && req.method === "POST") {
    const idx = parseInt(u.searchParams.get("idx") || "0", 10);
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const wf = JSON.parse(body);
        saveWorkflowByIndex(idx, wf);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (u.pathname === "/api/download-mrc") {
    const idx = parseInt(u.searchParams.get("idx") || "0", 10);
    const rec = getRecordByIndex(idx);
    if (!rec) {
      res.writeHead(404);
      return res.end("Not found");
    }
    const mrcBuf = recordToIso2709Buffer(rec.marc21_rda);
    res.writeHead(200, {
      "Content-Type": "application/marc",
      "Content-Disposition": \`attachment; filename="manuscript_\${rec.id}.mrc"\`
    });
    return res.end(mrcBuf);
  }

  if (u.pathname === "/api/list") {
    const offset = Math.max(0, parseInt(u.searchParams.get("offset") || "0", 10));
    const limit = Math.min(200, Math.max(1, parseInt(u.searchParams.get("limit") || "50", 10)));
    const q = (u.searchParams.get("q") || "").trim();
    const filter = (u.searchParams.get("filter") || "all").trim();

    const matched = [];
    for (let i = 0; i < searchMeta.length; i++) {
      const m = searchMeta[i];
      const wf = workflowState[i] || { bookmarked: false, status: "none" };

      if (filter === "edited" && !m.edited) continue;
      if (filter === "bookmarked" && !wf.bookmarked) continue;
      if (filter === "approved" && wf.status !== "approved") continue;
      if (filter === "review" && wf.status !== "review") continue;
      if (filter === "attention" && wf.status !== "attention") continue;

      if (
        !q ||
        m.title.includes(q) ||
        m.author.includes(q) ||
        m.copyNum === q ||
        m.subject.includes(q) ||
        m.id === q
      ) {
        matched.push({
          ...m,
          bookmarked: wf.bookmarked,
          status: wf.status
        });
      }
    }

    const slice = matched.slice(offset, offset + limit);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ total: matched.length, items: slice }));
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(UI_HTML);
});

server.listen(PORT, () => {
  console.log(\`علقمي (Alqami) Full Cataloging Suite & Authorities API running at http://localhost:\${PORT}\`);
});
`;

fs.writeFileSync('D:/MAN/viewer_server.js', code, 'utf8');
console.log('Successfully written updated D:/MAN/viewer_server.js with full SVG icons!');
