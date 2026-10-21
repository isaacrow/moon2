const https = require('https');
const fs = require('fs');

const agent = new https.Agent({ keepAlive: true, maxSockets: 6 });

function fetchUrl(url, retries = 3) {
  return new Promise((resolve) => {
    function attempt(n) {
      const req = https.get(url, {
        agent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AlqamiCollector/2.0',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'ar,en;q=0.9'
        },
        timeout: 25000
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
  console.log('--- Deep Harvester for kiqp.net Authors and Subjects ---');

  // Load existing kiqp_authorities_all.json if exists
  const allAuthors = new Map();
  const allSubjects = new Map();

  if (fs.existsSync('D:/MAN/kiqp_authorities_all.json')) {
    try {
      const prev = JSON.parse(fs.readFileSync('D:/MAN/kiqp_authorities_all.json', 'utf8'));
      if (prev.authors) {
        for (const a of prev.authors) allAuthors.set(a.raw || a.name, a.count || 1);
      }
      if (prev.subjects) {
        for (const s of prev.subjects) allSubjects.set(s.raw || s.subject, s.count || 1);
      }
      console.log(`Loaded initial: ${allAuthors.size} authors, ${allSubjects.size} subjects`);
    } catch (e) {}
  }

  // Keywords to query across authors and subjects
  const authorKeywords = [
    'محمد', 'علي', 'احمد', 'حسن', 'حسين', 'عبد', 'جعفر', 'ابراهيم', 'يوسف', 'محمود',
    'اسماعيل', 'خليل', 'موسى', 'عيسى', 'صالح', 'يحيى', 'طاهر', 'مهدي', 'باقر', 'صادق',
    'كاظم', 'رضا', 'تقي', 'نقي', 'هادي', 'مرتضى', 'مصطفى', 'جمال', 'كمال', 'شمس',
    'قطب', 'نور', 'سعد', 'فخر', 'عز', 'محيي', 'صدر', 'شرف', 'تاج', 'عماد',
    'بهاء', 'نجم', 'علاء', 'جلال', 'نظام', 'امين', 'قاسم', 'عباس', 'هاشم', 'فاضل',
    'شهاب', 'ضياء', 'سليمان', 'داود', 'يعقوب', 'ايوب', 'زكريا', 'يونس', 'ابن', 'ابو',
    'سيد', 'شيخ', 'علامة', 'محقق', 'ميرزا', 'ملا', 'صاحب', 'شريف', 'حكيم', 'طبيب'
  ];

  const subjectKeywords = [
    'فقه', 'اصول', 'حديث', 'تفسير', 'قرآن', 'عقائد', 'كلام', 'فلسفة', 'منطق', 'نحو',
    'صرف', 'بلاغة', 'لغة', 'ادب', 'شعر', 'تاريخ', 'سيرة', 'رجال', 'تراجم', 'تصوف',
    'عرفان', 'اخلاق', 'ادعية', 'زيارات', 'طب', 'فلك', 'نجوم', 'حساب', 'هندسة', 'كيمياء',
    'سياسة', 'مناظرة', 'وقف', 'وصايا', 'ميراث', 'قضاء', 'فرائض', 'صلاة', 'صوم', 'حج',
    'زكاة', 'جهاد', 'مخطوطات', 'اسلام', 'شيعة', 'امامية', 'زيدية', 'اسماعيلية', 'سنة',
    'شافعي', 'حنفي', 'مالكي', 'حنبلي', 'معتزلة', 'اشاعرة', 'علوم', 'معاجم'
  ];

  // Process author keywords
  console.log(`Querying ${authorKeywords.length} author keywords...`);
  for (const kw of authorKeywords) {
    const url = `https://kiqp.net/search?field_select=2&keyword=${encodeURIComponent(kw)}`;
    const html = await fetchUrl(url);
    const facets = extractFacets(html);
    let newA = 0;
    for (const [k, v] of facets.authors) {
      if (!allAuthors.has(k)) newA++;
      allAuthors.set(k, Math.max(allAuthors.get(k) || 0, v));
    }
    for (const [k, v] of facets.subjects) {
      allSubjects.set(k, Math.max(allSubjects.get(k) || 0, v));
    }
    console.log(`Author '${kw}': +${newA} (Total authors: ${allAuthors.size}, subjects: ${allSubjects.size})`);
  }

  // Process subject keywords
  console.log(`Querying ${subjectKeywords.length} subject keywords...`);
  for (const kw of subjectKeywords) {
    const url = `https://kiqp.net/search?field_select=9&keyword=${encodeURIComponent(kw)}`;
    const html = await fetchUrl(url);
    const facets = extractFacets(html);
    let newS = 0;
    for (const [k, v] of facets.subjects) {
      if (!allSubjects.has(k)) newS++;
      allSubjects.set(k, Math.max(allSubjects.get(k) || 0, v));
    }
    for (const [k, v] of facets.authors) {
      allAuthors.set(k, Math.max(allAuthors.get(k) || 0, v));
    }
    console.log(`Subject '${kw}': +${newS} (Total subjects: ${allSubjects.size}, authors: ${allAuthors.size})`);
  }

  // Convert to formatted authority objects
  const authorRecords = [];
  for (const [rawName, count] of allAuthors.entries()) {
    let namePart = rawName;
    let datesPart = '';
    
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
  authorRecords.sort((a, b) => b.count - a.count);

  const subjectRecords = [];
  for (const [rawSubj, count] of allSubjects.entries()) {
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
    source: 'https://kiqp.net',
    cataloging_standard: 'MARC 21 + RDA (IQ-KaCCS)',
    harvested_at: new Date().toISOString(),
    total_authors: authorRecords.length,
    total_subjects: subjectRecords.length,
    authors: authorRecords,
    subjects: subjectRecords
  };

  fs.writeFileSync('D:/MAN/kiqp_authorities_all.json', JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n🎉 Deep harvest complete! Saved D:/MAN/kiqp_authorities_all.json with ${authorRecords.length} authors and ${subjectRecords.length} subjects.`);
}

main().catch(console.error);
