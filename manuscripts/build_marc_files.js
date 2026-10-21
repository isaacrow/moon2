const fs = require("fs");
const path = require("path");
const readline = require("readline");

const JSONL_PATH = "D:/MAN/dromh_marc21_rda_catalog.jsonl";
const OUT_DIR = "D:/MAN/marc21_files";
const CHUNK_SIZE = 5000; // 5,000 records per file (~6 MB per .mrc file, fast & lightweight!)

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Convert a parsed MARC JSON array into a valid binary ISO 2709 MARC 21 UTF-8 Buffer (.mrc)
function recordToIso2709Buffer(marcArray) {
  const FT = Buffer.from([0x1e]); // Field Terminator (RS)
  const RT = Buffer.from([0x1d]); // Record Terminator (GS)
  const SD = 0x1f;                // Subfield Delimiter (US)

  const dirEntries = [];
  const dataBuffers = [];
  let currentOffset = 0;

  for (const field of marcArray) {
    const tag = String(field.tag || "").padStart(3, "0").slice(0, 3);
    if (tag === "000") continue; // Leader is built at the end with exact byte lengths

    let fieldBuf;
    const tagNum = parseInt(tag, 10);
    if (tagNum < 10 && !field.subfields) {
      // Control field (001 - 009)
      const valStr = String(field.value || "");
      fieldBuf = Buffer.concat([Buffer.from(valStr, "utf8"), FT]);
    } else if (tag === "001" && field.subfields && field.subfields[0]) {
      // 001 stored as subfield $a in kiqp display -> write as standard control field in ISO 2709
      const valStr = String(field.subfields[0].value || "");
      fieldBuf = Buffer.concat([Buffer.from(valStr, "utf8"), FT]);
    } else {
      // Data field (010 - 999)
      const rawInd = String(field.indicators || "  ").replace(/\\/g, " ");
      const indStr = (rawInd + "  ").slice(0, 2);
      const indBuf = Buffer.from(indStr, "ascii");

      const subBufs = [indBuf];
      for (const sub of field.subfields || []) {
        const codeChar = String(sub.code || "a").charCodeAt(0) & 0x7f;
        const valBuf = Buffer.from(String(sub.value || ""), "utf8");
        subBufs.push(Buffer.from([SD, codeChar]), valBuf);
      }
      subBufs.push(FT);
      fieldBuf = Buffer.concat(subBufs);
    }

    const fieldLen = fieldBuf.length;
    // ISO 2709 directory entry: tag(3) + length(4) + offset(5) = 12 ASCII bytes
    if (fieldLen <= 9999 && currentOffset <= 99999) {
      const dirStr =
        tag +
        String(fieldLen).padStart(4, "0") +
        String(currentOffset).padStart(5, "0");
      dirEntries.push(Buffer.from(dirStr, "ascii"));
      dataBuffers.push(fieldBuf);
      currentOffset += fieldLen;
    }
  }

  const directoryBuf = Buffer.concat([...dirEntries, FT]);
  const baseAddress = 24 + directoryBuf.length;
  const dataBlockBuf = Buffer.concat([...dataBuffers, RT]);
  const totalLength = baseAddress + dataBlockBuf.length;

  // 24-byte MARC 21 Leader (UTF-8 = 'a' at pos 09, RDA = 'i' at pos 18, 'ctm' manuscript text)
  const leaderStr =
    String(totalLength).padStart(5, "0") +
    "ctm a22" +
    String(baseAddress).padStart(5, "0") +
    " i 4500";
  const leaderBuf = Buffer.from(leaderStr, "ascii");

  return Buffer.concat([leaderBuf, directoryBuf, dataBlockBuf]);
}

function recordToMrkText(marcArray) {
  const mrcBuf = recordToIso2709Buffer(marcArray);
  const leader = mrcBuf.toString("ascii", 0, 24);
  const lines = [`=LDR  ${leader}`];
  for (const field of marcArray) {
    const tag = String(field.tag || "").padStart(3, "0").slice(0, 3);
    if (tag === "000") continue;
    const tagNum = parseInt(tag, 10);
    if (tagNum < 10 && !field.subfields) {
      lines.push(`=${tag}  ${field.value}`);
    } else if (tag === "001" && field.subfields && field.subfields[0]) {
      lines.push(`=001  ${field.subfields[0].value}`);
    } else {
      const ind = String(field.indicators || "\\\\").padEnd(2, "\\").slice(0, 2);
      const subs = (field.subfields || []).map(s => `$${s.code}${s.value}`).join("");
      lines.push(`=${tag}  ${ind}${subs}`);
    }
  }
  return lines.join("\r\n") + "\r\n\r\n";
}

async function buildAll() {
  console.log("Generating valid binary ISO 2709 (.mrc) and MarcEdit (.mrk) files in 5,000-record parts...");
  const rl = readline.createInterface({
    input: fs.createReadStream(JSONL_PATH, { encoding: "utf8" }),
    crlfDelay: Infinity
  });

  let count = 0;
  let partNum = 1;
  let mrcChunks = [];
  let mrkChunks = [];
  const sample100Mrc = [];
  const sample1000Mrc = [];
  const sample100Mrk = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    const mrcBuf = recordToIso2709Buffer(rec.marc21_rda);
    const mrkStr = recordToMrkText(rec.marc21_rda);

    mrcChunks.push(mrcBuf);
    mrkChunks.push(mrkStr);
    count++;

    if (count <= 100) {
      sample100Mrc.push(mrcBuf);
      sample100Mrk.push(mrkStr);
    }
    if (count <= 1000) {
      sample1000Mrc.push(mrcBuf);
    }

    if (mrcChunks.length === CHUNK_SIZE) {
      const pStr = String(partNum).padStart(2, "0");
      fs.writeFileSync(path.join(OUT_DIR, `dromh_marc21_part_${pStr}.mrc`), Buffer.concat(mrcChunks));
      fs.writeFileSync(path.join(OUT_DIR, `dromh_marc21_part_${pStr}.mrk`), mrkChunks.join(""), "utf8");
      console.log(`Saved part ${pStr} (${count.toLocaleString()} records)`);
      mrcChunks = [];
      mrkChunks = [];
      partNum++;
    }
  }

  if (mrcChunks.length > 0) {
    const pStr = String(partNum).padStart(2, "0");
    fs.writeFileSync(path.join(OUT_DIR, `dromh_marc21_part_${pStr}.mrc`), Buffer.concat(mrcChunks));
    fs.writeFileSync(path.join(OUT_DIR, `dromh_marc21_part_${pStr}.mrk`), mrkChunks.join(""), "utf8");
    console.log(`Saved final part ${pStr} (${count.toLocaleString()} records total)`);
  }

  // Write ready-to-open lightweight sample .mrc and .mrk files in D:\MAN root
  fs.writeFileSync("D:/MAN/dromh_sample_100.mrc", Buffer.concat(sample100Mrc));
  fs.writeFileSync("D:/MAN/dromh_sample_100.mrk", sample100Mrk.join(""), "utf8");
  fs.writeFileSync("D:/MAN/dromh_sample_1000.mrc", Buffer.concat(sample1000Mrc));
  console.log("Saved D:/MAN/dromh_sample_100.mrc, dromh_sample_100.mrk, and dromh_sample_1000.mrc!");
}

if (require.main === module) {
  buildAll().catch(console.error);
}

module.exports = { recordToIso2709Buffer, recordToMrkText };
