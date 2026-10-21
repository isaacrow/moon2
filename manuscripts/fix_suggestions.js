const fs = require("fs");
const path = require("path");

const UI_PATH = "D:\\MAN\\ui.html";
let html = fs.readFileSync(UI_PATH, "utf8");

// 1. Fix CSS for .suggest-dropdown: change position to fixed and z-index to 99999
html = html.replace(
  `    .suggest-dropdown {
      position: absolute;
      z-index: 2500;`,
  `    .suggest-dropdown {
      position: fixed;
      z-index: 99999;`
);

// 2. Replace the Suggestion Controller block
const startMarker = "// ==================== SMART AUTOCOMPLETE CONTROLLER ====================";
const endMarker = "// ----------------------------------------------------" + "\n    // User Authentication & State";

const newControllerCode = `// ==================== SMART AUTOCOMPLETE CONTROLLER ====================
    let suggestTimer = null;
    let activeSuggestInput = null;
    let activeSuggestType = null;
    let activeSuggestFieldKey = null;
    let activeSuggestMarcRow = null;
    let activeSuggestSubIdx = null;
    let currentSuggestions = [];
    let selectedSuggestIndex = -1;

    function onSuggestInput(inputEl) {
      if (!inputEl) return;
      activeSuggestInput = inputEl;
      activeSuggestType = inputEl.getAttribute('data-suggest-type');
      activeSuggestFieldKey = inputEl.getAttribute('data-field-key');
      activeSuggestMarcRow = inputEl.getAttribute('data-marc-row');
      activeSuggestSubIdx = inputEl.getAttribute('data-sub-idx');

      const q = inputEl.value.trim();
      clearTimeout(suggestTimer);

      if (q.length < 1) {
        closeSuggest();
        return;
      }

      suggestTimer = setTimeout(async () => {
        const apiPath = \`/api/authorities/\${activeSuggestType === 'author' ? 'authors' : 'subjects'}?q=\${encodeURIComponent(q)}&limit=10\`;
        try {
          const res = await fetch(apiPath);
          const data = await res.json();
          currentSuggestions = data.items || [];
          renderSuggestDropdown(inputEl, activeSuggestType, currentSuggestions);
        } catch (err) {
          console.error('Suggest error:', err);
        }
      }, 80);
    }

    function renderSuggestDropdown(inputEl, type, items) {
      const dd = document.getElementById('autoSuggestDropdown');
      if (!dd) return;

      if (!items || items.length === 0) {
        dd.classList.remove('open');
        return;
      }

      selectedSuggestIndex = -1;
      const rect = inputEl.getBoundingClientRect();

      // Position fixed directly below the input in viewport coordinates
      dd.style.position = 'fixed';
      dd.style.top = Math.min(window.innerHeight - 300, rect.bottom + 5) + 'px';
      dd.style.left = Math.max(12, Math.min(window.innerWidth - 380, rect.left)) + 'px';
      dd.style.width = Math.max(rect.width, 360) + 'px';

      const authorIcon = '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:13px;height:13px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      const subjectIcon = '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:13px;height:13px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';

      dd.innerHTML = items.map((item, idx) => {
        const isAuthor = type === 'author';
        const mainTitle = isAuthor ? item.name : (item.fullHeading || item.subject);
        const subTitle = isAuthor ? (item.dates || '') : '';
        const badgeText = item.source && item.source.startsWith('kiqp') ? 'kiqp.net' : 'dromh';
        const countText = \`\${item.count} نسخة\`;

        return \`
          <div class="suggest-item" data-index="\${idx}">
            <div style="flex:1; min-width:0;">
              <div class="suggest-title">
                \${isAuthor ? authorIcon : subjectIcon}
                <span>\${escapeHtml(mainTitle)}</span>
                \${subTitle ? \`<span style="opacity:0.75; font-size:0.75rem; font-weight:500;">\${escapeHtml(subTitle)}</span>\` : ''}
              </div>
              <div class="suggest-meta">
                <span class="suggest-badge">\${badgeText}</span>
                <span>\${countText}</span>
              </div>
            </div>
            <button type="button" class="glass-pill" style="padding:4px 11px; font-size:0.74rem; flex-shrink:0;">تطبيق</button>
          </div>
        \`;
      }).join('');

      dd.classList.add('open');
      attachDropdownEvents(dd);
    }

    function attachDropdownEvents(dd) {
      if (dd._handlersAttached) return;
      dd._handlersAttached = true;

      // Prevent input from losing focus when clicking inside dropdown
      dd.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });

      // Handle item click directly via event delegation
      dd.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const itemEl = e.target.closest('.suggest-item');
        if (itemEl) {
          const idx = parseInt(itemEl.getAttribute('data-index'), 10);
          selectSuggestionItem(idx);
        }
      });

      // Touch support for mobile/tablets
      dd.addEventListener('touchstart', (e) => {
        const itemEl = e.target.closest('.suggest-item');
        if (itemEl) {
          e.preventDefault();
          const idx = parseInt(itemEl.getAttribute('data-index'), 10);
          selectSuggestionItem(idx);
        }
      }, { passive: false });
    }

    function selectSuggestionItem(idx) {
      const item = currentSuggestions[idx];
      if (!item) return;

      const type = activeSuggestType;
      const fieldKey = activeSuggestFieldKey;
      const marcRow = activeSuggestMarcRow;
      const subIdx = activeSuggestSubIdx;

      if (type === 'author') {
        const cleanName = item.name.replace(/،$/, '');
        if (activeSuggestInput) activeSuggestInput.value = cleanName;

        if (fieldKey === 'المؤلف') {
          updateOriginalField('المؤلف', cleanName);
          let t100 = currentRecord.marc21_rda.find(m => m.tag === '100');
          if (!t100) {
            t100 = { tag: '100', indicators: '1\\\\', subfields: [] };
            currentRecord.marc21_rda.push(t100);
          }
          t100.indicators = '1\\\\';
          const subfields = [{ code: 'a', value: item.name }];
          if (item.dates) subfields.push({ code: 'd', value: item.dates });
          subfields.push({ code: 'e', value: 'مؤلف.' });
          t100.subfields = subfields;
          currentRecord.marc21_rda.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
          renderMarc(currentRecord);
          runLiveValidation();
        } else if (marcRow !== null && subIdx !== null) {
          const rIdx = parseInt(marcRow, 10);
          const sIdx = parseInt(subIdx, 10);
          const row = currentRecord.marc21_rda[rIdx];
          if (row && row.subfields) {
            row.subfields[sIdx].value = item.name;
            if (item.dates) {
              let dSub = row.subfields.find(s => s.code === 'd');
              if (dSub) dSub.value = item.dates;
              else row.subfields.splice(sIdx + 1, 0, { code: 'd', value: item.dates });
            }
            if (!row.subfields.some(s => s.code === 'e')) {
              row.subfields.push({ code: 'e', value: row.tag === '100' ? 'مؤلف.' : 'ناسخ.' });
            }
            if (row.tag === '100') {
              updateOriginalField('المؤلف', item.name);
            }
            renderMarc(currentRecord);
            runLiveValidation();
          }
        }
      } else if (type === 'subject') {
        const heading = item.fullHeading || item.subject;
        if (activeSuggestInput) activeSuggestInput.value = item.subject || heading;

        if (fieldKey === 'الموضوع') {
          updateOriginalField('الموضوع', item.subject || heading);
          let t650 = currentRecord.marc21_rda.find(m => m.tag === '650');
          if (!t650) {
            t650 = { tag: '650', indicators: '\\\\4', subfields: [] };
            currentRecord.marc21_rda.push(t650);
          }
          t650.subfields = JSON.parse(JSON.stringify(item.subfields || [
            { code: 'a', value: item.subject },
            { code: 'v', value: 'مخطوطات.' }
          ]));
          currentRecord.marc21_rda.sort((a, b) => String(a.tag).localeCompare(String(b.tag)));
          renderMarc(currentRecord);
          runLiveValidation();
        } else if (marcRow !== null && subIdx !== null) {
          const rIdx = parseInt(marcRow, 10);
          const sIdx = parseInt(subIdx, 10);
          const row = currentRecord.marc21_rda[rIdx];
          if (row && row.subfields) {
            row.subfields[sIdx].value = item.subject;
            if (!row.subfields.some(s => s.code === 'v')) {
              row.subfields.push({ code: 'v', value: 'مخطوطات.' });
            }
            if (row.tag === '650') {
              updateOriginalField('الموضوع', item.subject);
            }
            renderMarc(currentRecord);
            runLiveValidation();
          }
        }
      }

      markDirty(true);
      closeSuggest();
      showToast('تم تطبيق المقترح الاستنادي بنجاح');
    }

    function isSuggestOpen() {
      const dd = document.getElementById('autoSuggestDropdown');
      return dd && dd.classList.contains('open');
    }

    function closeSuggest() {
      const dd = document.getElementById('autoSuggestDropdown');
      if (dd) dd.classList.remove('open');
      selectedSuggestIndex = -1;
    }

    function handleSuggestKey(e) {
      const dd = document.getElementById('autoSuggestDropdown');
      if (!dd) return;
      const items = dd.querySelectorAll('.suggest-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSuggestIndex = (selectedSuggestIndex + 1) % items.length;
        updateSuggestHighlight(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSuggestIndex = (selectedSuggestIndex - 1 + items.length) % items.length;
        updateSuggestHighlight(items);
      } else if (e.key === 'Enter') {
        if (selectedSuggestIndex >= 0 && selectedSuggestIndex < items.length) {
          e.preventDefault();
          selectSuggestionItem(selectedSuggestIndex);
        }
      } else if (e.key === 'Escape') {
        closeSuggest();
      }
    }

    function updateSuggestHighlight(items) {
      items.forEach((it, idx) => {
        it.classList.toggle('active', idx === selectedSuggestIndex);
        if (idx === selectedSuggestIndex) {
          it.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    document.addEventListener('input', (e) => {
      if (e.target.matches('[data-suggest-type]')) {
        onSuggestInput(e.target);
      }
    });

    document.addEventListener('focusin', (e) => {
      if (e.target.matches('[data-suggest-type]') && e.target.value.trim().length >= 1) {
        onSuggestInput(e.target);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (isSuggestOpen()) {
        handleSuggestKey(e);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#autoSuggestDropdown') && !e.target.matches('[data-suggest-type]')) {
        closeSuggest();
      }
    });

    // Handle scroll: NEVER close when scrolling inside the suggestions dropdown itself!
    window.addEventListener('scroll', (e) => {
      if (e.target && (e.target.id === 'autoSuggestDropdown' || (e.target.closest && e.target.closest('#autoSuggestDropdown')))) {
        return;
      }
      closeSuggest();
    }, true);

    `;

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  html = html.slice(0, startIdx) + newControllerCode + html.slice(endIdx);
  fs.writeFileSync(UI_PATH, html, "utf8");
  console.log("Successfully replaced suggestion controller in ui.html!");
} else {
  console.error("Could not find start or end marker in ui.html:", startIdx, endIdx);
}
