const fs = require("fs");
const https = require("https");

const agent = new https.Agent({ keepAlive: true, maxSockets: 2 });

function httpsGet(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      agent,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Connection": "keep-alive"
      },
      timeout: timeoutMs
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(httpsGet(new URL(res.headers.location, url).toString(), timeoutMs));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Request timeout"));
    });
  });
}

async function getWithRetry(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      return await httpsGet(url);
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

function parseKiqpBib(html, id) {
  const fields = {};
  const fieldRegex = /<label class="record-field-label">[\s\S]*?<span>\s*([^<:]+?)\s*:?\s*(?:&nbsp;)?\s*<\/span>\s*<\/label>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  let m;
  while ((m = fieldRegex.exec(html)) !== null) {
    const label = m[1].trim();
    const valHtml = m[2];
    const vals = [...valHtml.matchAll(/<span class=['"]subfield-value['"][^>]*>([\s\S]*?)<\/span>/g)]
      .map(x => x[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim())
      .filter(Boolean);
    fields[label] = vals;
  }

  const marc = [];
  const navProfileIdx = html.indexOf('id="nav-profile"');
  if (navProfileIdx !== -1) {
    const marcSection = html.slice(navProfileIdx);
    const rowRegex = /<div class="row marc-dir">([\s\S]*?)<\/div>\s*<\/div>/g;
    let rm;
    while ((rm = rowRegex.exec(marcSection)) !== null) {
      const block = rm[1];
      const tagMatch = block.match(/<h5>\s*(\d{3})\s*(?:<span[^>]*>([\s\S]*?)<\/span>)?\s*<\/h5>/);
      if (!tagMatch) continue;
      const tag = tagMatch[1].trim();
      const ind = (tagMatch[2] || "").trim();
      const subfields = [];
      const subRegex = /<span class='subfield subfield-symbol'>\$<\/span><span class='subfield subfield-symbol'>([^<]+)<\/span><span class='subfield-value'>([\s\S]*?)<\/span>/g;
      let sm;
      while ((sm = subRegex.exec(block)) !== null) {
        subfields.push({
          code: sm[1].trim(),
          value: sm[2].replace(/&nbsp;/g, " ").trim()
        });
      }
      if (subfields.length === 0) {
        const rawVal = block.match(/<div class="col-6">\s*<span class="subfield-value">([\s\S]*?)<\/span>/);
        if (rawVal) {
          marc.push({ tag, value: rawVal[1].replace(/&nbsp;/g, " ").trim() });
        }
      } else {
        marc.push({ tag, indicators: ind, subfields });
      }
    }
  }
  return { id, url: `https://kiqp.net/bibliography/${id}`, fields, marc };
}

async function run() {
  const existing = JSON.parse(fs.readFileSync("D:/MAN/kiqp_sample_records.json", "utf8"));
  const byId = new Map(existing.map(r => [r.id, r]));

  // Also get page 2 IDs
  const p2Html = await getWithRetry("https://kiqp.net/search?types%5B%5D=%D9%85%D8%AE%D8%B7%D9%88%D8%B7%D8%A7%D8%AA&page=2");
  const p2Ids = p2Html ? [...new Set([...p2Html.matchAll(/https:\/\/kiqp\.net\/bibliography\/(\d+)/g)].map(m => m[1]))] : [];

  const extraIds = [
    ...p2Ids,
    "126841", "126842", "126869", "126914", "126918", "126970", "126975", "126990", "126995", "127038",
    "127057", "127140", "127223", "127240", "127267", "127305", "120033", "120656", "120755", "120758",
    "120766", "121040", "121311", "121601", "121681", "121796", "122213", "122637", "118820", "118823"
  ];

  for (const id of extraIds) {
    if (byId.has(id)) continue;
    const html = await getWithRetry(`https://kiqp.net/bibliography/${id}`);
    if (html) {
      const parsed = parseKiqpBib(html, id);
      if (parsed.marc.length > 0) {
        byId.set(id, parsed);
        console.log(`Fetched ${id} (total: ${byId.size})`);
      }
    }
  }

  const allRecords = [...byId.values()];
  const guide = {
    source: "https://kiqp.net/search?types%5B%5D=مخطوطات",
    cataloging_standard: "MARC 21 + RDA (Resource Description and Access) - Iraqi Center for Cataloging and Classification (IQ-KaCCS)",
    total_reference_records_downloaded: allRecords.length,
    rda_marc21_rules_for_arabic_manuscripts: {
      "000": "Leader: manuscript text (tm), RDA descriptive cataloging form (i), character coding UCS/Unicode (a)",
      "001": "Control Number (e.g., b<id>)",
      "008": "Fixed-Length Data Elements (40 chars): YYMMDDsYYYY (or nuuuu if undated) + place (xx or iq/ir) + language code (ara, per, tur, etc.) + 'd'",
      "035": "System Control Number ($a)",
      "040": "Cataloging Source: 00 $a IQ-KaCCS $b ara $c IQ-KaCCS $e rda",
      "050": "Library of Congress Classification ($a class $b item number)",
      "066": "Character Sets Present: 00 $c (3 (Arabic script)",
      "098": "Manuscript Shelfmark / Call Number: 00 $a MS<number>",
      "100": "Main Entry - Personal Name (Author): 1\\ $a Surname, Forename, $c Title/Epithet, $d Hijri birth-death dates (هجري), $e مؤلف.",
      "240": "Uniform Title: 10 (or 00) $a Standardized title of the manuscript work",
      "245": "Title Statement: 10 (or 00) $a Title proper : $b Other title info / $c Statement of responsibility (as transcribed from manuscript)",
      "246": "Varying Form of Title: 30 $a Alternative title(s)",
      "264": "Production Statement (RDA Manuscript): 00 $a Place of copying : $b Producer/Scribe, $c Date of copying in Hijri = [Gregorian] or [تاريخ الانتاج غير محدد]",
      "300": "Physical Description: 00 $a Extent in folios/leaves (<N> ورقة) (lines per page) ؛ $c Dimensions in cm",
      "336": "Content Type (RDA): 00 $a نص $b txt $2 rdacontent $3 مخطوط",
      "337": "Media Type (RDA): 00 $a بدون وسيط $b n $2 rdamedia",
      "338": "Carrier Type (RDA): 00 $a مجلد $b nc $2 rdacarrier",
      "340": "Physical Medium (RDA): 00 $a Base material (ورق) $c Applied material (حبر) $g Color content (اسود واحمر) $d Production method/Script (خط النسخ / خط النستعليق / إلخ.)",
      "351": "Organization and Arrangement of Materials: 00 $b مرتبة بنظام التعقيبات.",
      "500": "General Note: 00 $a Incipit ('اوله : ...'), Explicit ('اخره : ...'), and general copy/completeness notes",
      "510": "Citation/References Note: 40 $a Reference source (كشف الظنون / الذريعة) $c Volume and page",
      "520": "Summary/Scope Note: 00 $a Summary of contents",
      "535": "Location of Originals/Duplicates Note: 10 $a Repository : number, $c City, Country $g Country code",
      "546": "Language Note: 00 $a Language of manuscript text (عربي / فارسي / تركي)",
      "561": "Ownership and Custodial History: 00 $a Ownership notes, endowments (وقفية), and seals (أختام)",
      "562": "Copy and Version Identification Note: 00 $a Marginalia/collation notes (تعليقات / بلاغات / تصحيحات), framing/rubrication (مجدولة بالحبر الاحمر), $b Stamps",
      "563": "Binding Information: 00 $a Binding description ('الغلاف : ...')",
      "600": "Subject Added Entry - Personal Name: 14 $a Name $d Dates $t Work",
      "630": "Subject Added Entry - Uniform Title: 24 $a Uniform title $x Topic $v مخطوطات.",
      "650": "Subject Added Entry - Topical Term: \\4 $a Subject term $x Subdivision $v مخطوطات.",
      "700": "Added Entry - Personal Name (Scribe / Compiler / Commentator): 10 or 1\\ $a Name, $d Dates, $e ناسخ. / جامع. / شارح.",
      "856": "Electronic Location and Access: 40 $u Direct URL to digital record",
      "949": "Holding Institution / Local Holding: 00 $a Holding library name (e.g. مكتبة العتبة العباسية المقدسة)"
    },
    records: allRecords
  };

  fs.writeFileSync("D:/MAN/kiqp_manuscripts_cataloging_guide.json", JSON.stringify(guide, null, 2), "utf8");
  console.log("Saved kiqp_manuscripts_cataloging_guide.json with", allRecords.length, "records.");
}

run().catch(console.error);
