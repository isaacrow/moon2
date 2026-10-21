const fs = require("fs");
const path = require("path");

const DATA_DIR = "D:\\MAN";
const SERVER_PATH = path.join(DATA_DIR, "viewer_server.js");

const code = `const http = require("http");
const fs = require("fs");
const path = require("path");
const auth = require("./auth_db");
let localtunnel = null;
try {
  localtunnel = require("localtunnel");
} catch (e) {}

const PORT = 3456;
const DATA_DIR = "D:\\\\MAN";
const JSONL_PATH = path.join(DATA_DIR, "dromh_marc21_rda_catalog.jsonl");
const LOGO_PATH = path.join(DATA_DIR, "logo.png");
const EDITS_PATH = path.join(DATA_DIR, "edited_records.json");
const WORKFLOW_PATH = path.join(DATA_DIR, "workflow_state.json");
const KIQP_GUIDE_PATH = path.join(DATA_DIR, "kiqp_manuscripts_cataloging_guide.json");
const KIQP_AUTH_PATH = path.join(DATA_DIR, "kiqp_authorities_all.json");
const ANALYTICS_CACHE_PATH = path.join(DATA_DIR, "analytics_cache.json");
const UI_HTML_PATH = path.join(DATA_DIR, "ui.html");

let savedEdits = {};
if (fs.existsSync(EDITS_PATH)) {
  try { savedEdits = JSON.parse(fs.readFileSync(EDITS_PATH, "utf8")); } catch (e) {}
}

let workflowState = {};
if (fs.existsSync(WORKFLOW_PATH)) {
  try { workflowState = JSON.parse(fs.readFileSync(WORKFLOW_PATH, "utf8")); } catch (e) {}
}

let analyticsCache = null;
if (fs.existsSync(ANALYTICS_CACHE_PATH)) {
  try { analyticsCache = JSON.parse(fs.readFileSync(ANALYTICS_CACHE_PATH, "utf8")); } catch (e) {}
}

// Cloud Tunnel State
let cloudTunnelUrl = null;
let cloudTunnelStatus = "idle";
let cloudTunnelInstance = null;

async function startCloudTunnel() {
  if (cloudTunnelUrl) return { url: cloudTunnelUrl, status: "connected" };
  if (!localtunnel) {
    cloudTunnelStatus = "unavailable (localtunnel not installed)";
    return { url: null, status: cloudTunnelStatus };
  }
  try {
    cloudTunnelStatus = "connecting";
    cloudTunnelInstance = await localtunnel({ port: PORT });
    cloudTunnelUrl = cloudTunnelInstance.url;
    cloudTunnelStatus = "connected";
    console.log(\`علقمي (Alqami) Public Cloud Tunnel URL: \${cloudTunnelUrl}\`);
    cloudTunnelInstance.on("close", () => {
      cloudTunnelUrl = null;
      cloudTunnelStatus = "closed";
    });
    return { url: cloudTunnelUrl, status: "connected" };
  } catch (err) {
    console.error("Tunnel error:", err.message);
    cloudTunnelStatus = "error: " + err.message;
    return { url: null, status: cloudTunnelStatus };
  }
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
const totalFileSize = fs.fstatSync(fd).size;

const offsets = [];
const lengths = [];
const searchMeta = [];

const authorMap = new Map();
const subjectMap = new Map();

// 1. Seed kiqp authorities dataset
if (fs.existsSync(KIQP_AUTH_PATH)) {
  try {
    const kiqpData = JSON.parse(fs.readFileSync(KIQP_AUTH_PATH, "utf8"));
    if (kiqpData.authors && Array.isArray(kiqpData.authors)) {
      for (const a of kiqpData.authors) {
        if (!a.name) continue;
        const subfields = [{ code: "a", value: a.name }];
        if (a.dates) subfields.push({ code: "d", value: a.dates });
        subfields.push({ code: "e", value: "مؤلف." });
        authorMap.set(a.name, {
          name: a.name,
          title: a.title || "",
          dates: a.dates || "",
          relator: "مؤلف.",
          count: a.count || 1,
          source: "kiqp.net",
          marc100: { tag: "100", indicators: "1\\\\", subfields }
        });
      }
    }
    if (kiqpData.subjects && Array.isArray(kiqpData.subjects)) {
      for (const s of kiqpData.subjects) {
        if (!s.subject) continue;
        const subfields = [
          { code: "a", value: s.subject },
          { code: "v", value: "مخطوطات." }
        ];
        subjectMap.set(s.subject, {
          subject: s.subject,
          fullHeading: s.fullHeading || \`\${s.subject} — مخطوطات.\`,
          subfields,
          count: s.count || 1,
          source: "kiqp.net",
          marc650: { tag: "650", indicators: "\\\\4", subfields }
        });
      }
    }
    console.log(\`Loaded \${authorMap.size.toLocaleString()} kiqp.net authors and \${subjectMap.size.toLocaleString()} subjects from kiqp_authorities_all.json\`);
  } catch (e) {
    console.error("Error loading kiqp_authorities_all.json:", e);
  }
} else if (fs.existsSync(KIQP_GUIDE_PATH)) {
  try {
    const guideData = JSON.parse(fs.readFileSync(KIQP_GUIDE_PATH, "utf8"));
    if (guideData.authority_records) {
      for (const [name, rec] of Object.entries(guideData.authority_records)) {
        const subfields = [{ code: "a", value: name }];
        if (rec.death) subfields.push({ code: "d", value: rec.death });
        subfields.push({ code: "e", value: "مؤلف." });
        authorMap.set(name, {
          name,
          title: rec.title || "",
          dates: rec.death || "",
          relator: "مؤلف.",
          count: 5,
          source: "kiqp.net",
          marc100: { tag: "100", indicators: "1\\\\", subfields }
        });
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
    leftover = buf.toString("utf8", start, bytesRead);
  }
  filePos += bytesRead;
}

const authorsAuthorityList = Array.from(authorMap.values()).sort((a, b) => b.count - a.count);
const subjectsAuthorityList = Array.from(subjectMap.values()).sort((a, b) => b.count - a.count);

console.log(\`علقمي indexed \${offsets.length.toLocaleString()} records, \${authorsAuthorityList.length.toLocaleString()} unique authors, and \${subjectsAuthorityList.length.toLocaleString()} subjects in \${((Date.now() - t0) / 1000).toFixed(2)}s!\`);

function getRecordByIndex(idx) {
  if (idx < 0 || idx >= offsets.length) return null;
  if (savedEdits[idx]) {
    return savedEdits[idx];
  }
  const lineBuf = Buffer.alloc(lengths[idx]);
  fs.readSync(fd, lineBuf, 0, lengths[idx], offsets[idx]);
  return JSON.parse(lineBuf.toString("utf8"));
}

function saveRecordByIndex(idx, updatedRecord, username = "مفهرس معتمد") {
  if (idx < 0 || idx >= offsets.length) return false;
  savedEdits[idx] = updatedRecord;
  fs.writeFileSync(EDITS_PATH, JSON.stringify(savedEdits, null, 2), "utf8");

  const sf = updatedRecord.source_fields || {};
  searchMeta[idx] = {
    idx,
    id: updatedRecord.id || "",
    title: sf["العنوان"] || "",
    author: sf["المؤلف"] || "",
    subject: sf["الموضوع"] || "",
    copyNum: sf["رقم النسخة"] || "",
    edited: true
  };

  auth.logActivity(username, "تعديل وحفظ سجل MARC 21", updatedRecord.id, sf["العنوان"] || "");
  return true;
}

function saveWorkflowByIndex(idx, wf, username = "مدقق الجودة") {
  if (idx < 0 || idx >= offsets.length) return false;
  workflowState[idx] = wf;
  fs.writeFileSync(WORKFLOW_PATH, JSON.stringify(workflowState, null, 2), "utf8");

  const statusLabel = wf.status === "approved" ? "معتمد" : (wf.status === "review" ? "قيد المراجعة" : (wf.status === "attention" ? "يحتاج تدقيق" : "افتراضي"));
  auth.logActivity(username, \`تحديث حالة السجل (\${statusLabel})\`, String(idx), wf.bookmarked ? "محفوظ في المفضلة" : "");
  return true;
}

// Auth Helper
function getAuthUser(req) {
  const authHeader = req.headers["authorization"] || "";
  let token = "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else {
    const cookie = req.headers["cookie"] || "";
    const match = cookie.match(/alqami_token=([^;]+)/);
    if (match) token = match[1].trim();
  }
  return auth.getUserByToken(token);
}

function getAuthToken(req) {
  const authHeader = req.headers["authorization"] || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookie = req.headers["cookie"] || "";
  const match = cookie.match(/alqami_token=([^;]+)/);
  if (match) return match[1].trim();
  return null;
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, \`http://localhost:\${PORT}\`);

  // CORS headers for multi-device & cloud access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (u.pathname === "/logo.png") {
    if (fs.existsSync(LOGO_PATH)) {
      res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" });
      return fs.createReadStream(LOGO_PATH).pipe(res);
    }
    res.writeHead(404);
    return res.end();
  }

  // ----------------------------------------------------
  // AUTHENTICATION APIs
  // ----------------------------------------------------
  if (u.pathname === "/api/auth/login" && req.method === "POST") {
    let body = "";
    req.on("data", c => { body += c; });
    req.on("end", () => {
      try {
        const { username, password } = JSON.parse(body);
        const user = auth.authenticateUser(username, password);
        if (!user) {
          res.writeHead(401, { "Content-Type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }));
        }
        const token = auth.createSession(user);
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Set-Cookie": \`alqami_token=\${token}; Path=/; Max-Age=604800; SameSite=Lax\`
        });
        res.end(JSON.stringify({ ok: true, token, user }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (u.pathname === "/api/auth/logout" && req.method === "POST") {
    const token = getAuthToken(req);
    if (token) auth.removeSession(token);
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": "alqami_token=; Path=/; Max-Age=0"
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (u.pathname === "/api/auth/me") {
    const user = getAuthUser(req);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ user: user || null }));
  }

  // ----------------------------------------------------
  // USER MANAGEMENT APIs (Admin Only)
  // ----------------------------------------------------
  if (u.pathname === "/api/users") {
    if (req.method === "GET") {
      const users = auth.listUsers();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ users }));
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", c => { body += c; });
      req.on("end", () => {
        try {
          const userPayload = JSON.parse(body);
          const created = auth.createUser(userPayload);
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, user: created }));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    if (req.method === "DELETE") {
      const username = u.searchParams.get("username");
      try {
        auth.deleteUser(username);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ error: e.message }));
      }
    }
  }

  // ----------------------------------------------------
  // CLOUD TUNNEL & MULTI-DEVICE APIs
  // ----------------------------------------------------
  if (u.pathname === "/api/tunnel/start" && req.method === "POST") {
    const result = await startCloudTunnel();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      lanUrl: "http://10.112.29.113:3456",
      cloudUrl: result.url,
      status: result.status
    }));
  }

  if (u.pathname === "/api/tunnel/status") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      lanUrl: "http://10.112.29.113:3456",
      secondaryLanUrl: "http://172.17.20.80:3456",
      cloudUrl: cloudTunnelUrl,
      status: cloudTunnelStatus
    }));
  }

  // ----------------------------------------------------
  // DASHBOARD & ANALYTICS STATS API
  // ----------------------------------------------------
  if (u.pathname === "/api/dashboard/stats") {
    let approved = 0, review = 0, attention = 0, bookmarked = 0;
    for (const wf of Object.values(workflowState)) {
      if (wf.status === "approved") approved++;
      else if (wf.status === "review") review++;
      else if (wf.status === "attention") attention++;
      if (wf.bookmarked) bookmarked++;
    }

    const auditLog = auth.loadAuditLog().slice(-20).reverse();
    const stats = {
      totalRecords: offsets.length,
      totalEdited: Object.keys(savedEdits).length,
      workflow: {
        approved,
        review,
        attention,
        bookmarked
      },
      authorities: {
        totalAuthors: authorsAuthorityList.length,
        totalSubjects: subjectsAuthorityList.length
      },
      analytics: analyticsCache || {
        scripts: { "نسخ": 12448, "نستعليق": 7078, "أخرى": 50 },
        languages: { "عربي": 79393, "فارسي": 22994, "تركي / عثماني": 642, "أردو": 70 },
        centuries: { "ق 5 هـ": 2769, "ق 6 هـ": 2495, "ق 7 هـ": 4628, "ق 8 هـ": 5138, "ق 9 هـ": 4418, "ق 10 هـ": 6691, "ق 11 هـ": 8425 }
      },
      recentActivity: auditLog,
      network: {
        lanUrl: "http://10.112.29.113:3456",
        secondaryLanUrl: "http://172.17.20.80:3456",
        cloudUrl: cloudTunnelUrl,
        cloudStatus: cloudTunnelStatus
      }
    };

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify(stats));
  }

  // ----------------------------------------------------
  // REST API 1: Authors Authority API
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // REST API 2: Subjects Authority API
  // ----------------------------------------------------
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
        const curUser = getAuthUser(req) || { username: "مفهرس معتمد" };
        saveRecordByIndex(idx, recObj, curUser.username);
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
        const curUser = getAuthUser(req) || { username: "مدقق الجودة" };
        saveWorkflowByIndex(idx, wf, curUser.username);
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
    const curUser = getAuthUser(req) || { username: "مفهرس" };
    auth.logActivity(curUser.username, "تصدير ملف ISO 2709 (.mrc)", rec.id, rec.title);
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
  fs.createReadStream(UI_HTML_PATH).pipe(res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(\`علقمي (Alqami) Full Cataloging Suite running:\`);
  console.log(\`  - Local:        http://localhost:\${PORT}\`);
  console.log(\`  - Network LAN:  http://10.112.29.113:\${PORT}\`);
  console.log(\`  - Secondary:    http://172.17.20.80:\${PORT}\`);

  // Auto initialize cloud tunnel in background
  startCloudTunnel().catch(() => {});
});
`;

fs.writeFileSync(SERVER_PATH, code, "utf8");
console.log("Updated viewer_server.js successfully with auth, dashboard, and cloud tunnel!");
