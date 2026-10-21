const https = require('https');

async function testFetch(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length, data: data.slice(0, 300) }));
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function main() {
  const urls = [
    'https://kiqp.net/authorities',
    'https://kiqp.net/subjects',
    'https://kiqp.net/api/authorities',
    'https://kiqp.net/api/subjects',
    'https://kiqp.net/search?field_select=9&keyword=*',
    'https://kiqp.net/search?field_select=2&keyword=*',
    'https://afiqa.net/api/authors',
    'https://afiqa.net/authorities'
  ];
  for (const u of urls) {
    const res = await testFetch(u);
    console.log(u, res.status || res.error, res.length || '');
  }
}

main();
