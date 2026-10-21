const fs = require('fs');
const content = fs.readFileSync('D:/MAN/ui.html', 'utf8');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2300}-\u{23FF}\u{2B50}\u{2714}\u{2716}\u{270E}\u{2190}-\u{21FF}]/gu;
const matches = [...new Set(content.match(emojiRegex) || [])];
console.log('ui.html Emojis count:', matches.length, matches);
console.log('Has autoSuggestDropdown:', content.includes('id="autoSuggestDropdown"'));
console.log('Has data-suggest-type author:', content.includes('data-suggest-type="author"'));
console.log('Has data-suggest-type subject:', content.includes('data-suggest-type="subject"'));
