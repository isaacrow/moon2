const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  const t = await fetchUrl('https://kiqp.net/search?field_select=2&keyword=' + encodeURIComponent('محمد'));
  const authors = [...t.matchAll(/name="authorities\[\]"[^>]+value="([^"]+)"[\s\S]*?<span class="facet-value">(\d+)<\/span>/g)];
  console.log('Authors with keyword محمد:', authors.length);
  const subjects = [...t.matchAll(/name="subjects\[\]"[^>]+value="([^"]+)"[\s\S]*?<span class="facet-value">(\d+)<\/span>/g)];
  console.log('Subjects with keyword محمد:', subjects.length);
}

run();
