const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  // Let's check how many total records/facets exist for manuscripts on kiqp.net
  // Also check if we can query authors by each Arabic letter: ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي
  const letters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
  
  console.log('Testing letter query on kiqp.net...');
  const testA = await fetchUrl('https://kiqp.net/search?types%5B0%5D=%D9%85%D8%AE%D8%B7%D9%88%D8%B7%D8%A7%D8%AA&field_select=2&keyword=' + encodeURIComponent('ا'));
  const authorsInA = [...testA.matchAll(/name="authorities\[\]"[^>]+value="([^"]+)"/g)].map(m => m[1]);
  console.log('Authors with letter ا:', authorsInA.length, 'samples:', authorsInA.slice(0, 3));

  const subjectsInA = [...testA.matchAll(/name="subjects\[\]"[^>]+value="([^"]+)"/g)].map(m => m[1]);
  console.log('Subjects with letter ا:', subjectsInA.length, 'samples:', subjectsInA.slice(0, 3));
}

run().catch(console.error);
