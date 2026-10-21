const fs = require('fs');
const html = fs.readFileSync('D:/MAN/kiqp_search_test.html', 'utf8');

// Find all accordion-body sections
const sectionRegex = /<div class="accordion-body\s*" id="([^"]+)">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
let secMatch;

const facets = {};

while ((secMatch = sectionRegex.exec(html)) !== null) {
  const name = secMatch[1];
  const content = secMatch[2];
  const items = [];
  const itemRegex = /<input[^>]+value="([^"]+)"[\s\S]*?<span class="facet-value">(\d+)<\/span>/g;
  let im;
  while ((im = itemRegex.exec(content)) !== null) {
    items.push({ value: im[1].trim(), count: parseInt(im[2], 10) });
  }
  facets[name] = items;
  console.log(`Section: ${name}, Items: ${items.length}`);
}

console.log('Facet keys:', Object.keys(facets));
if (facets['authorities']) {
  console.log('Sample authorities (authors):', facets['authorities'].slice(0, 5));
}
if (facets['subjects']) {
  console.log('Sample subjects:', facets['subjects'].slice(0, 5));
}
