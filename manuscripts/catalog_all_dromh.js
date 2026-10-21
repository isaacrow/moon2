const fs = require("fs");
const path = require("path");
const https = require("https");

const TOTAL_PAGES = 1072; // page 0 to 1071 (107,149 records total with result=4)
const CONCURRENCY = 10;   // Fast keep-alive concurrency
const RAW_CACHE_DIR = "D:/MAN/raw_pages";

function stripDiacritics(str) {
  return (str || "").replace(/[\u064B-\u065F\u0670]/g, "");
}

if (!fs.existsSync(RAW_CACHE_DIR)) {
  fs.mkdirSync(RAW_CACHE_DIR, { recursive: true });
}
if (!fs.existsSync("D:/MAN/dromh_marc21_rda_chunks")) {
  fs.mkdirSync("D:/MAN/dromh_marc21_rda_chunks", { recursive: true });
}

const agent = new https.Agent({ keepAlive: true, maxSockets: CONCURRENCY });

function fetchPage(p) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `https://dromh.org/?ajax_search&field=0&filter=list&result=4&page=${p}&asc=1`,
      {
        agent,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Connection": "keep-alive"
        },
        timeout: 30000
      },
      res => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("timeout")));
  });
}

async function fetchPageWithRetry(p, maxRetries = 6) {
  const cacheFile = path.join(RAW_CACHE_DIR, `page_${p}.html`);
  if (fs.existsSync(cacheFile)) {
    const cached = fs.readFileSync(cacheFile, "utf8");
    if (cached.includes("search_item")) {
      return cached;
    }
  }
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const html = await fetchPage(p);
      if (html && html.includes("search_item")) {
        fs.writeFileSync(cacheFile, html, "utf8");
        return html;
      }
      throw new Error("Empty or invalid search_item html");
    } catch (e) {
      await new Promise(r => setTimeout(r, 800 * attempt));
    }
  }
  throw new Error(`Failed to fetch page ${p} after ${maxRetries} retries`);
}

function normalizeDigits(str) {
  if (!str) return "";
  const arabicIndic = "٠١٢٣٤٥٦٧٨٩";
  const easternArabic = "۰۱۲۳۴۵۶۷۸۹";
  let out = "";
  for (const ch of str) {
    const i1 = arabicIndic.indexOf(ch);
    if (i1 !== -1) { out += i1; continue; }
    const i2 = easternArabic.indexOf(ch);
    if (i2 !== -1) { out += i2; continue; }
    out += ch;
  }
  return out;
}

// Convert Hijri year or century to approximate Gregorian year for MARC 008 and 264 $c
function parseCopyDate(dateStr) {
  if (!dateStr || dateStr === "بلا" || dateStr === "-") {
    return { marc008Date: "nuuuu", display264c: "[تاريخ الانتاج غير محدد]" };
  }
  const norm = normalizeDigits(dateStr);
  // Look for 3 or 4 digit Hijri year near هـ or سنة
  const yearMatch = norm.match(/(?:سنة\s*|عام\s*|^|\D)(\d{3,4})\s*هـ/) || norm.match(/\b(1[0-4]\d{2}|[3-9]\d{2})\b/);
  if (yearMatch) {
    const hYear = parseInt(yearMatch[1], 10);
    if (hYear >= 100 && hYear <= 1500) {
      const gYear = Math.round(hYear - hYear / 33 + 622);
      const gStr = String(gYear).padStart(4, "0");
      return {
        marc008Date: `s${gStr}`,
        display264c: `${dateStr} = [${gYear}]`,
        gregorianYear: gStr
      };
    }
  }
  // Check for century like ق13هـ or القرن 12
  const centMatch = norm.match(/ق\s*(\d{1,2})\s*هـ|القرن\s*(\d{1,2})/);
  if (centMatch) {
    const hCent = parseInt(centMatch[1] || centMatch[2], 10);
    if (hCent >= 2 && hCent <= 15) {
      const approxH = (hCent - 1) * 100 + 50;
      const gYear = Math.round(approxH - approxH / 33 + 622);
      const gPrefix = String(gYear).slice(0, 2);
      return {
        marc008Date: `s${gPrefix}uu`,
        display264c: `${dateStr} = [القرن ${Math.floor(gYear / 100) + 1} م]`
      };
    }
  }
  return { marc008Date: "nuuuu", display264c: dateStr };
}

function parseLangCodes(langStr) {
  if (!langStr || langStr === "بلا") return ["ara"];
  const codes = [];
  if (langStr.includes("عربي") || langStr.includes("العربية")) codes.push("ara");
  if (langStr.includes("فارسي") || langStr.includes("الفارسية")) codes.push("per");
  if (langStr.includes("تركي") || langStr.includes("التركية") || langStr.includes("عثماني")) codes.push("ota");
  if (langStr.includes("أردو") || langStr.includes("اردو") || langStr.includes("الأردية")) codes.push("urd");
  if (langStr.includes("كردي") || langStr.includes("الكردية")) codes.push("kur");
  if (langStr.includes("سرياني")) codes.push("syr");
  if (langStr.includes("عبري")) codes.push("heb");
  if (codes.length === 0) codes.push("ara");
  return codes;
}

// Map subject to LC Classification (050) like kiqp.net
function mapSubjectToLcc(subject) {
  if (!subject) return { a: "BP1", b: ".M36" };
  if (subject.includes("تفسير") || subject.includes("قرآن") || subject.includes("القرآن") || subject.includes("تجويد") || subject.includes("قراءات")) {
    return { a: "BP130.4", b: ".M36" };
  }
  if (subject.includes("حديث") || subject.includes("الحديث") || subject.includes("دراية") || subject.includes("رجال")) {
    return { a: "BP135", b: ".M36" };
  }
  if (subject.includes("فقه") || subject.includes("أصول") || subject.includes("اصول") || subject.includes("فرائض") || subject.includes("ميراث")) {
    return { a: "BP144", b: ".M36" };
  }
  if (subject.includes("كلام") || subject.includes("عقائد") || subject.includes("توحيد")) {
    return { a: "BP166", b: ".M36" };
  }
  if (subject.includes("دعاء") || subject.includes("أدعية") || subject.includes("ادعية") || subject.includes("زيارات") || subject.includes("أوراد")) {
    return { a: "BP183.3", b: ".M36" };
  }
  if (subject.includes("أخلاق") || subject.includes("اخلاق") || subject.includes("تصوف") || subject.includes("عرفان") || subject.includes("وعظ")) {
    return { a: "BP188", b: ".M36" };
  }
  if (subject.includes("سيرة") || subject.includes("تاريخ") || subject.includes("تراجم") || subject.includes("أنساب")) {
    return { a: "DS38.2", b: ".M36" };
  }
  if (subject.includes("نحو") || subject.includes("صرف") || subject.includes("لغة") || subject.includes("بلاغة") || subject.includes("عروض") || subject.includes("معاجم")) {
    return { a: "PJ6101", b: ".M36" };
  }
  if (subject.includes("أدب") || subject.includes("ادب") || subject.includes("شعر") || subject.includes("ديوان")) {
    return { a: "PJ7541", b: ".M36" };
  }
  if (subject.includes("منطق") || subject.includes("فلسفة") || subject.includes("حكمة")) {
    return { a: "B741", b: ".M36" };
  }
  if (subject.includes("طب") || subject.includes("تشريح") || subject.includes("صيدلة")) {
    return { a: "R128.3", b: ".M36" };
  }
  if (subject.includes("فلك") || subject.includes("هيئة") || subject.includes("حساب") || subject.includes("رياضيات") || subject.includes("هندسة")) {
    return { a: "QB23", b: ".M36" };
  }
  return { a: "BP20", b: ".M36" };
}

// Convert a single dromh.org record into kiqp.net MARC 21 + RDA structure
function convertToMarc21Rda(rec) {
  const f = rec.fields;
  const rawTitle = (f["العنوان"] || "مخطوط بدون عنوان").trim();
  const rawAuthor = (f["المؤلف"] || "").trim();
  const rawSubject = (f["الموضوع"] || "").trim();
  const rawLang = (f["اللغة"] || "عربي").trim();
  const rawCopyNum = (f["رقم النسخة"] || "").trim();
  const rawScribe = (f["الناسخ"] || "").trim();
  const rawDate = (f["تاريخ النسخ"] || "").trim();
  const rawFolios = (f["عدد الاوراق"] || "").trim();
  const rawSource = (f["المصدر"] || "").trim();
  const rawIncipit = (f["أول النسخة"] || "").trim();
  const rawExplicit = (f["آخر النسخة"] || "").trim();
  const rawScript = (f["نوع الخط"] || "").trim();
  const rawPlace = (f["مكان النسخ"] || "").trim();
  const rawDesc = (f["وصف النسخة"] || "").trim();

  const marc = [];

  // 000 Leader (RDA Manuscript Text)
  marc.push({ tag: "000", value: "00000ctm a2200000 i 4500" });

  // 001 Control Number
  marc.push({
    tag: "001",
    indicators: "\\\\",
    subfields: [{ code: "a", value: `b${rec.id}` }]
  });

  // 008 Fixed-Length Data Elements
  const dateInfo = parseCopyDate(rawDate);
  const langCodes = parseLangCodes(rawLang);
  const primaryLang = langCodes[0];
  const marc008 = `261016${dateInfo.marc008Date}    xx            000 0 ${primaryLang} d`;
  marc.push({ tag: "008", value: marc008 });

  // 035 System Control Number
  marc.push({
    tag: "035",
    indicators: "00",
    subfields: [{ code: "a", value: `(DROMH) dromh-${rec.id}${rec.viewId ? "-" + rec.viewId : ""}` }]
  });

  // 040 Cataloging Source (MARC 21 + RDA per kiqp.net IQ-KaCCS standard)
  marc.push({
    tag: "040",
    indicators: "00",
    subfields: [
      { code: "a", value: "IQ-KaCCS" },
      { code: "b", value: "ara" },
      { code: "c", value: "IQ-KaCCS" },
      { code: "e", value: "rda" }
    ]
  });

  // 041 Language Code (when multiple languages or non-Arabic)
  if (langCodes.length > 1 || primaryLang !== "ara") {
    marc.push({
      tag: "041",
      indicators: "00",
      subfields: langCodes.map(c => ({ code: "a", value: c }))
    });
  }

  // 050 Library of Congress Classification
  const lcc = mapSubjectToLcc(rawSubject);
  marc.push({
    tag: "050",
    indicators: "04",
    subfields: [
      { code: "a", value: lcc.a },
      { code: "b", value: dateInfo.gregorianYear ? `${lcc.b} ${dateInfo.gregorianYear}` : lcc.b }
    ]
  });

  // 066 Character Sets Present
  marc.push({
    tag: "066",
    indicators: "00",
    subfields: [{ code: "c", value: "(3" }]
  });

  // 098 Manuscript Shelfmark / Copy Number
  if (rawCopyNum && rawCopyNum !== "بلا" && rawCopyNum !== "-") {
    marc.push({
      tag: "098",
      indicators: "00",
      subfields: [{ code: "a", value: `MS${rawCopyNum}` }]
    });
  }

  // Parse Author (100 or 700 if compiler/unknown)
  let has100 = false;
  let isCompiler = false;
  let cleanAuthor = rawAuthor;
  if (cleanAuthor.startsWith("الجامع:")) {
    isCompiler = true;
    cleanAuthor = cleanAuthor.replace(/^الجامع:\s*/, "").trim();
  }
  const isUnknownAuthor =
    !cleanAuthor ||
    cleanAuthor === "بلا" ||
    cleanAuthor === "مجهول" ||
    cleanAuthor.includes("مجهول") ||
    cleanAuthor === "غير معروف" ||
    cleanAuthor === "-";

  if (!isUnknownAuthor) {
    // Extract death/life dates in parentheses e.g. (ت842هـ) or (ت 1072 هـ)
    let authorName = cleanAuthor;
    let authorDate = null;
    const dateMatch = cleanAuthor.match(/\(([^)]+)\)/);
    if (dateMatch) {
      const inner = dateMatch[1].trim();
      if (/\d|ت|وفا|قرن|هـ|م/.test(inner)) {
        authorDate = inner
          .replace(/^ت\s*/, "توفي ")
          .replace(/هـ/g, " هجري")
          .replace(/\s+/g, " ")
          .trim();
        authorName = cleanAuthor.replace(dateMatch[0], "").trim();
      }
    }
    const sub100 = [{ code: "a", value: authorName.endsWith("،") ? authorName : `${authorName}،` }];
    if (authorDate) {
      sub100.push({ code: "d", value: authorDate.endsWith("،") ? authorDate : `${authorDate}،` });
    }
    sub100.push({ code: "e", value: isCompiler ? "جامع." : "مؤلف." });

    marc.push({
      tag: "100",
      indicators: "1\\",
      subfields: sub100
    });
    has100 = true;
  }

  // Parse Title and Alternative Titles (split by '=')
  const titleParts = rawTitle.split(/\s*=\s*/).map(s => s.trim()).filter(Boolean);
  const mainTitle = titleParts[0] || rawTitle;
  const altTitles = titleParts.slice(1);

  // 240 Uniform Title
  marc.push({
    tag: "240",
    indicators: has100 ? "10" : "00",
    subfields: [{ code: "a", value: mainTitle }]
  });

  // 245 Title Statement
  const sub245 = [];
  if (has100 || !isUnknownAuthor) {
    sub245.push({ code: "a", value: `${rawTitle} /` });
    sub245.push({ code: "c", value: `${rawAuthor}.` });
  } else {
    sub245.push({ code: "a", value: `${rawTitle}.` });
  }
  marc.push({
    tag: "245",
    indicators: has100 ? "10" : "00",
    subfields: sub245
  });

  // 246 Varying Form of Title (for each alternative title after '=')
  for (const alt of altTitles) {
    marc.push({
      tag: "246",
      indicators: "33",
      subfields: [{ code: "a", value: alt }]
    });
  }

  // 264 Production Statement (RDA Manuscript Production)
  const sub264 = [];
  if (rawPlace && rawPlace !== "بلا" && rawPlace !== "-") {
    sub264.push({ code: "a", value: `${rawPlace} :` });
  }
  sub264.push({ code: "c", value: dateInfo.display264c });
  marc.push({
    tag: "264",
    indicators: "00",
    subfields: sub264
  });

  // 300 Physical Description (Extent in folios/leaves)
  const extentVal =
    rawFolios && rawFolios !== "بلا" && rawFolios !== "-"
      ? `${rawFolios} ورقة`
      : "1 مجلد (أوراق غير مرقمة)";
  marc.push({
    tag: "300",
    indicators: "00",
    subfields: [{ code: "a", value: extentVal }]
  });

  // 336 Content Type (RDA)
  marc.push({
    tag: "336",
    indicators: "00",
    subfields: [
      { code: "a", value: "نص" },
      { code: "b", value: "txt" },
      { code: "2", value: "rdacontent" },
      { code: "3", value: "مخطوط" }
    ]
  });

  // 337 Media Type (RDA)
  marc.push({
    tag: "337",
    indicators: "00",
    subfields: [
      { code: "a", value: "بدون وسيط" },
      { code: "b", value: "n" },
      { code: "2", value: "rdamedia" }
    ]
  });

  // 338 Carrier Type (RDA)
  marc.push({
    tag: "338",
    indicators: "00",
    subfields: [
      { code: "a", value: "مجلد" },
      { code: "b", value: "nc" },
      { code: "2", value: "rdacarrier" }
    ]
  });

  const cleanDesc = stripDiacritics(rawDesc);
  const cleanIncipit = stripDiacritics(rawIncipit);
  const cleanExplicit = stripDiacritics(rawExplicit);

  // 340 Physical Medium (RDA)
  const sub340 = [
    { code: "a", value: "ورق" },
    { code: "c", value: "حبر" }
  ];
  let inkColors = "اسود";
  if (/أحمر|احمر|بالحمرة/.test(cleanDesc)) {
    inkColors = "اسود واحمر";
  }
  sub340.push({ code: "g", value: inkColors });
  if (rawScript && rawScript !== "بلا" && rawScript !== "-") {
    const scriptText = rawScript.startsWith("خط") ? `${rawScript}.` : `خط ${rawScript}.`;
    sub340.push({ code: "d", value: scriptText });
  }
  marc.push({
    tag: "340",
    indicators: "00",
    subfields: sub340
  });

  // 351 Organization and Arrangement of Materials (if catchwords mentioned)
  if (cleanDesc.includes("تعقيب") || cleanDesc.includes("التعقيبات")) {
    marc.push({
      tag: "351",
      indicators: "00",
      subfields: [{ code: "b", value: "مرتبة بنظام التعقيبات." }]
    });
  }

  // 500 General Notes: Incipit (أول النسخة), Explicit (آخر النسخة), Copy Description (وصف النسخة)
  if (rawIncipit && rawIncipit !== "بلا" && rawIncipit !== "-") {
    marc.push({
      tag: "500",
      indicators: "00",
      subfields: [{ code: "a", value: `اوله : ${rawIncipit}` }]
    });
  }
  if (rawExplicit && rawExplicit !== "بلا" && rawExplicit !== "-") {
    marc.push({
      tag: "500",
      indicators: "00",
      subfields: [{ code: "a", value: `اخره : ${rawExplicit}` }]
    });
  }
  if (rawDesc && rawDesc !== "بلا" && rawDesc !== "-") {
    marc.push({
      tag: "500",
      indicators: "00",
      subfields: [{ code: "a", value: rawDesc }]
    });
  }

  // 535 Location of Originals/Duplicates Note (from المصدر & رقم النسخة)
  if (rawSource && rawSource !== "بلا") {
    const sub535 = [
      {
        code: "a",
        value: rawCopyNum && rawCopyNum !== "بلا" ? `${rawSource} : ${rawCopyNum}،` : rawSource
      }
    ];
    if (rawSource.includes("العراق")) {
      sub535.push({ code: "c", value: "العراق" });
      sub535.push({ code: "g", value: "iq" });
    } else if (rawSource.includes("إيران") || rawSource.includes("ايران") || rawSource.includes("طهران") || rawSource.includes("قم") || rawSource.includes("مشهد")) {
      sub535.push({ code: "c", value: "ايران" });
      sub535.push({ code: "g", value: "ir" });
    } else if (rawSource.includes("السعودية")) {
      sub535.push({ code: "c", value: "السعودية" });
      sub535.push({ code: "g", value: "su" });
    }
    marc.push({
      tag: "535",
      indicators: "10",
      subfields: sub535
    });
  }

  // 546 Language Note
  if (rawLang && rawLang !== "بلا") {
    marc.push({
      tag: "546",
      indicators: "00",
      subfields: [{ code: "a", value: `اللغة : ${rawLang}.` }]
    });
  }

  // 561 Ownership and Custodial History (if ownership/endowment/seal mentioned in وصف النسخة)
  if (/تملك|تمليكات|وقف|وقفية|ختم|أختام|اختام/.test(cleanDesc)) {
    marc.push({
      tag: "561",
      indicators: "00",
      subfields: [{ code: "a", value: rawDesc }]
    });
  }

  // 562 Copy and Version Identification Note (if rubricated/framed/collated/marginalia mentioned)
  if (/مجدول|مصحح|مقابلة|بلاغات|تعاليق|تعليقات|حواشي|مشكل/.test(cleanDesc)) {
    marc.push({
      tag: "562",
      indicators: "00",
      subfields: [{ code: "a", value: rawDesc }]
    });
  }

  // 563 Binding Information (if binding mentioned in وصف النسخة)
  if (/غلاف|جلد|تجليد|دفتا|دفتر|مقوى/.test(cleanDesc)) {
    marc.push({
      tag: "563",
      indicators: "00",
      subfields: [{ code: "a", value: rawDesc }]
    });
  }

  // 583 Action / Condition Note (if moisture/wormholes/lacuna mentioned)
  if (/رطوبة|أرضة|ارضة|مخروم|خرم|تلف|ترميم|سقط|ناقص/.test(cleanDesc)) {
    marc.push({
      tag: "583",
      indicators: "00",
      subfields: [{ code: "a", value: rawDesc }]
    });
  } else if (/ناقص|مخروم/.test(cleanIncipit)) {
    marc.push({
      tag: "583",
      indicators: "00",
      subfields: [{ code: "a", value: "النسخة ناقصة الأول." }]
    });
  } else if (/ناقص|مخروم/.test(cleanExplicit)) {
    marc.push({
      tag: "583",
      indicators: "00",
      subfields: [{ code: "a", value: "النسخة ناقصة الآخر." }]
    });
  }

  // 650 Subject Added Entry - Topical Term
  if (rawSubject && rawSubject !== "بلا" && rawSubject !== "-") {
    const subjects = rawSubject.split(/[،,]/).map(s => s.trim()).filter(Boolean);
    for (const subj of subjects) {
      marc.push({
        tag: "650",
        indicators: "\\4",
        subfields: [
          { code: "a", value: subj },
          { code: "v", value: "مخطوطات." }
        ]
      });
    }
  } else {
    marc.push({
      tag: "650",
      indicators: "\\4",
      subfields: [
        { code: "a", value: "المخطوطات العربية" },
        { code: "v", value: "مخطوطات." }
      ]
    });
  }

  // 700 Added Entry - Personal Name (Scribe / Copyist)
  if (rawScribe && rawScribe !== "بلا" && rawScribe !== "-" && !rawScribe.includes("مجهول")) {
    marc.push({
      tag: "700",
      indicators: "10",
      subfields: [
        { code: "a", value: rawScribe.endsWith("،") ? rawScribe : `${rawScribe}،` },
        { code: "e", value: "ناسخ." }
      ]
    });
  }

  // 856 Electronic Location and Access
  if (rec.viewId) {
    marc.push({
      tag: "856",
      indicators: "40",
      subfields: [{ code: "u", value: `https://dromh.org/?view=${rec.viewId}` }]
    });
  }

  // 949 Holding Institution
  marc.push({
    tag: "949",
    indicators: "00",
    subfields: [
      { code: "a", value: rawSource && rawSource !== "بلا" ? rawSource : "المرجع الرقمي للتراث المخطوط - مكتبة العتبة العباسية المقدسة" }
    ]
  });

  return marc;
}

function formatMarcBreaker(marc) {
  const lines = [];
  for (const field of marc) {
    if (!field.subfields) {
      lines.push(`=${field.tag === "000" ? "LDR" : field.tag}  ${field.value}`);
    } else {
      const ind = (field.indicators || "\\\\").padEnd(2, "\\");
      const subs = field.subfields.map(s => `$${s.code}${s.value}`).join("");
      lines.push(`=${field.tag}  ${ind}${subs}`);
    }
  }
  return lines.join("\n");
}

function parseDromhPage(html) {
  const records = [];
  const parts = html.split('<div class="search_item">').slice(1);
  for (const part of parts) {
    const idMatch = part.match(/id="comp_(\d+)"/);
    const viewMatch = part.match(/\?view=([a-f0-9]+)/i);
    const compIdx = part.indexOf('class="complete"');
    const compHtml = compIdx !== -1 ? part.slice(compIdx) : part;

    const fields = {};
    const fieldRegex = /<div class="search_titles"><span class="col-sm-2 search_cont_title">([^<]+)<\/span><span class="col-sm-(?:10|4)"\s*>([\s\S]*?)<(?:\/span|span)>/g;
    let m;
    while ((m = fieldRegex.exec(compHtml)) !== null) {
      const k = m[1].replace(/:/g, "").trim();
      const v = m[2].replace(/<[^>]+>/g, "").trim();
      fields[k] = v;
    }
    records.push({
      id: idMatch ? idMatch[1] : null,
      viewId: viewMatch ? viewMatch[1] : null,
      fields
    });
  }
  return records;
}

async function main() {
  console.log(`Starting download and MARC 21 / RDA cataloging of all ${TOTAL_PAGES} pages (107,149 records)...`);
  const tStart = Date.now();
  let nextPage = 0;
  let completedPages = 0;

  async function worker() {
    while (true) {
      const p = nextPage++;
      if (p >= TOTAL_PAGES) break;
      await fetchPageWithRetry(p);
      completedPages++;
      if (completedPages % 50 === 0 || completedPages === TOTAL_PAGES) {
        const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
        const rate = (completedPages / (elapsed || 1)).toFixed(2);
        const eta = (((TOTAL_PAGES - completedPages) / (rate || 1)) / 60).toFixed(1);
        console.log(`Downloaded ${completedPages}/${TOTAL_PAGES} pages (${completedPages * 100} records) in ${elapsed}s [${rate} p/s, ETA ${eta} min]`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  agent.destroy();

  console.log("All 1,072 pages downloaded! Now assembling and cataloging all 107,149 records into MARC 21 + RDA...");

  const jsonlStream = fs.createWriteStream("D:/MAN/dromh_marc21_rda_catalog.jsonl", { encoding: "utf8" });
  const mrkStream = fs.createWriteStream("D:/MAN/dromh_marc21_rda_catalog.mrk", { encoding: "utf8" });

  let totalCataloged = 0;
  let currentChunk = [];
  let chunkIndex = 1;
  const sample1000 = [];

  for (let p = 0; p < TOTAL_PAGES; p++) {
    const cacheFile = path.join(RAW_CACHE_DIR, `page_${p}.html`);
    const html = fs.readFileSync(cacheFile, "utf8");
    const recs = parseDromhPage(html);
    for (const rec of recs) {
      const marc = convertToMarc21Rda(rec);
      const mrk = formatMarcBreaker(marc);
      const catalogedObj = {
        id: rec.id,
        viewUrl: rec.viewId ? `https://dromh.org/?view=${rec.viewId}` : null,
        source_fields: rec.fields,
        marc21_rda: marc
      };

      jsonlStream.write(JSON.stringify(catalogedObj) + "\n");
      mrkStream.write(mrk + "\n\n");

      if (sample1000.length < 1000) {
        sample1000.push(catalogedObj);
      }
      currentChunk.push(catalogedObj);
      totalCataloged++;

      if (currentChunk.length === 10000) {
        const chunkPath = `D:/MAN/dromh_marc21_rda_chunks/dromh_marc21_rda_part_${String(chunkIndex).padStart(2, "0")}.json`;
        fs.writeFileSync(chunkPath, JSON.stringify(currentChunk, null, 2), "utf8");
        console.log(`Wrote ${chunkPath} (10,000 records, total=${totalCataloged})`);
        currentChunk = [];
        chunkIndex++;
      }
    }
  }

  if (currentChunk.length > 0) {
    const chunkPath = `D:/MAN/dromh_marc21_rda_chunks/dromh_marc21_rda_part_${String(chunkIndex).padStart(2, "0")}.json`;
    fs.writeFileSync(chunkPath, JSON.stringify(currentChunk, null, 2), "utf8");
    console.log(`Wrote ${chunkPath} (${currentChunk.length} records, total=${totalCataloged})`);
  }

  fs.writeFileSync("D:/MAN/dromh_marc21_rda_sample_1000.json", JSON.stringify(sample1000, null, 2), "utf8");

  await new Promise(r => jsonlStream.end(r));
  await new Promise(r => mrkStream.end(r));

  console.log(`SUCCESS! Total manuscripts cataloged in MARC 21 & RDA: ${totalCataloged}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}

module.exports = { parseDromhPage, convertToMarc21Rda, formatMarcBreaker };

