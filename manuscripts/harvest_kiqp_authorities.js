const https = require('https');
const fs = require('fs');

const agent = new https.Agent({ keepAlive: true, maxSockets: 5 });

function fetchUrl(url, retries = 3) {
  return new Promise((resolve) => {
    function attempt(n) {
      const req = https.get(url, {
        agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AlqamiCataloger/2.0',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'ar,en;q=0.9'
        },
        timeout: 20000
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(fetchUrl(new URL(res.headers.location, url).toString(), retries));
        }
        if (res.statusCode !== 200) {
          res.resume();
          if (n < retries) return setTimeout(() => attempt(n + 1), 1000);
          return resolve(null);
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });
      req.on('error', () => {
        if (n < retries) setTimeout(() => attempt(n + 1), 1000);
        else resolve(null);
      });
      req.on('timeout', () => {
        req.destroy();
        if (n < retries) setTimeout(() => attempt(n + 1), 1000);
        else resolve(null);
      });
    }
    attempt(0);
  });
}

function extractFacets(html) {
  const authors = new Map();
  const subjects = new Map();

  if (!html) return { authors, subjects };

  // Match author facet checkboxes and values
  // e.g. <input name="authorities[]" ... value="الشيخ البهائي، محمد بن الحسين بن عبد الصمد، 953-1031 هجري"> ... <span class="facet-value">109</span>
  const authRegex = /<input[^>]+name="authorities\[\]"[^>]+value="([^"]+)"[\s\S]*?<span class="facet-value">(\d+)<\/span>/g;
  let am;
  while ((am = authRegex.exec(html)) !== null) {
    const rawVal = am[1].trim();
    const count = parseInt(am[2], 10) || 1;
    if (rawVal && rawVal !== 'القرآن') {
      const cur = authors.get(rawVal) || 0;
      authors.set(rawVal, Math.max(cur, count));
    }
  }

  // Match subject facet checkboxes and values
  const subjRegex = /<input[^>]+name="subjects\[\]"[^>]+value="([^"]+)"[\s\S]*?<span class="facet-value">(\d+)<\/span>/g;
  let sm;
  while ((sm = subjRegex.exec(html)) !== null) {
    const rawVal = sm[1].trim();
    const count = parseInt(sm[2], 10) || 1;
    if (rawVal) {
      const cur = subjects.get(rawVal) || 0;
      subjects.set(rawVal, Math.max(cur, count));
    }
  }

  return { authors, subjects };
}

async function main() {
  console.log('Starting full harvest of Authors and Subjects from kiqp.net...');
  
  const allAuthors = new Map();
  const allSubjects = new Map();

  // 1. Process base search page for manuscripts
  console.log('Fetching base manuscripts page...');
  const baseHtml = await fetchUrl('https://kiqp.net/search?types%5B0%5D=%D9%85%D8%AE%D8%B7%D9%88%D8%B7%D8%A7%D8%AA');
  const baseFacets = extractFacets(baseHtml);
  for (const [k, v] of baseFacets.authors) allAuthors.set(k, v);
  for (const [k, v] of baseFacets.subjects) allSubjects.set(k, v);
  console.log(`Base page: ${allAuthors.size} authors, ${allSubjects.size} subjects`);

  // 2. Letters to query
  const letters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'أ', 'إ', 'آ'];

  // Author queries
  console.log('Querying authors by letter...');
  for (const letter of letters) {
    const url = `https://kiqp.net/search?types%5B0%5D=%D9%85%D8%AE%D8%B7%D9%88%D8%B7%D8%A7%D8%AA&field_select=2&keyword=${encodeURIComponent(letter)}`;
    const html = await fetchUrl(url);
    const facets = extractFacets(html);
    let added = 0;
    for (const [k, v] of facets.authors) {
      if (!allAuthors.has(k)) added++;
      allAuthors.set(k, Math.max(allAuthors.get(k) || 0, v));
    }
    for (const [k, v] of facets.subjects) {
      allSubjects.set(k, Math.max(allSubjects.get(k) || 0, v));
    }
    console.log(`Letter author '${letter}': +${added} authors (Total: ${allAuthors.size}, Subjects: ${allSubjects.size})`);
  }

  // Subject queries
  console.log('Querying subjects by letter...');
  for (const letter of letters) {
    const url = `https://kiqp.net/search?types%5B0%5D=%D9%85%D8%AE%D8%B7%D9%88%D8%B7%D8%A7%D8%AA&field_select=9&keyword=${encodeURIComponent(letter)}`;
    const html = await fetchUrl(url);
    const facets = extractFacets(html);
    let added = 0;
    for (const [k, v] of facets.subjects) {
      if (!allSubjects.has(k)) added++;
      allSubjects.set(k, Math.max(allSubjects.get(k) || 0, v));
    }
    for (const [k, v] of facets.authors) {
      allAuthors.set(k, Math.max(allAuthors.get(k) || 0, v));
    }
    console.log(`Letter subject '${letter}': +${added} subjects (Total: ${allSubjects.size})`);
  }

  // Parse Authors into standardized MARC 21 =100 format
  const authorRecords = [];
  for (const [rawName, count] of allAuthors.entries()) {
    // rawName format e.g. "الشيخ البهائي، محمد بن الحسين بن عبد الصمد، 953-1031 هجري"
    // or "الجرجاني، علي بن محمد بن علي، 740-816 هجري"
    let namePart = rawName;
    let datesPart = '';
    
    // Check if dates are at the end: e.g. "953-1031 هجري" or "توفي 329 هجري" or "القرن 10 هـ"
    const dateMatch = rawName.match(/,\s*(\d{2,4}\s*-\s*\d{2,4}\s*هجري|\d{2,4}\s*-\s*\d{2,4}\s*ميلادي|توفي\s*\d{2,4}\s*هجري|\d{2,4}\s*هجري|القرن\s*[\d\w\s]+)$/);
    if (dateMatch) {
      datesPart = dateMatch[1].trim() + '،';
      namePart = rawName.slice(0, dateMatch.index).trim();
    }
    if (!namePart.endsWith('،')) namePart += '،';

    const marc100Subfields = [
      { code: 'a', value: namePart }
    ];
    if (datesPart) {
      marc100Subfields.push({ code: 'd', value: datesPart });
    }
    marc100Subfields.push({ code: 'e', value: 'مؤلف.' });

    authorRecords.push({
      raw: rawName,
      name: namePart,
      dates: datesPart,
      relator: 'مؤلف.',
      count,
      source: 'kiqp.net (IQ-KaCCS)',
      marc100: {
        tag: '100',
        indicators: '1\\',
        subfields: marc100Subfields
      }
    });
  }

  // Sort by count descending
  authorRecords.sort((a, b) => b.count - a.count);

  // Parse Subjects into standardized MARC 21 =650 format
  const subjectRecords = [];
  for (const [rawSubj, count] of allSubjects.entries()) {
    // e.g. "الفقه الجعفري - مخطوطات." or "الحديث (شيعة) — علل الشرائع"
    let s = rawSubj.replace(/—/g, ' - ').trim();
    const parts = s.split(/\s*-\s*/).map(p => p.trim()).filter(Boolean);
    const mainTerm = parts[0] || rawSubj;
    
    const subfields = [{ code: 'a', value: mainTerm }];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (/مخطوط/i.test(part)) {
        subfields.push({ code: 'v', value: part.endsWith('.') ? part : part + '.' });
      } else {
        subfields.push({ code: 'x', value: part });
      }
    }
    if (!subfields.some(sf => sf.code === 'v')) {
      subfields.push({ code: 'v', value: 'مخطوطات.' });
    }

    const fullHeading = subfields.map(sf => sf.value).join(' — ');

    subjectRecords.push({
      raw: rawSubj,
      subject: mainTerm,
      fullHeading,
      subfields,
      count,
      source: 'kiqp.net (IQ-KaCCS)',
      marc650: {
        tag: '650',
        indicators: '\\4',
        subfields
      }
    });
  }

  subjectRecords.sort((a, b) => b.count - a.count);

  const result = {
    source: 'https://kiqp.net/search?types%5B0%5D=مخطوطات',
    cataloging_standard: 'MARC 21 + RDA (IQ-KaCCS)',
    harvested_at: new Date().toISOString(),
    total_authors: authorRecords.length,
    total_subjects: subjectRecords.length,
    authors: authorRecords,
    subjects: subjectRecords
  };

  fs.writeFileSync('D:/MAN/kiqp_authorities_all.json', JSON.stringify(result, null, 2), 'utf8');
  console.log(`Successfully saved D:/MAN/kiqp_authorities_all.json with ${authorRecords.length} authors and ${subjectRecords.length} subjects!`);
}

main().catch(console.error);
