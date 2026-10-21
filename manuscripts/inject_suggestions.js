const fs = require('fs');
const path = require('path');

const uiPath = 'D:/MAN/ui.html';
let html = fs.readFileSync(uiPath, 'utf8');

// 1. Add CSS for Autocomplete Dropdown
const suggestCss = `
    /* Smart Autocomplete Dropdown (Apple VisionOS / Liquid Glass) */
    .suggest-dropdown {
      position: absolute;
      z-index: 2500;
      background-color: color-mix(in srgb, var(--c-bg) 84%, var(--c-glass));
      backdrop-filter: blur(24px) saturate(var(--saturation));
      -webkit-backdrop-filter: blur(24px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow);
      border: 1px solid color-mix(in srgb, var(--c-content) 16%, transparent);
      border-radius: 18px;
      max-height: 290px;
      overflow-y: auto;
      min-width: 320px;
      max-width: 500px;
      display: none;
      padding: 6px;
      direction: rtl;
    }
    .suggest-dropdown.open { display: block; }

    .suggest-item {
      padding: 9px 12px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      transition: background-color 140ms, scale 120ms;
      margin-bottom: 2px;
    }
    .suggest-item:hover,
    .suggest-item.active {
      background-color: color-mix(in srgb, var(--c-action) 16%, color-mix(in srgb, var(--c-glass) 25%, transparent));
    }
    .suggest-title {
      font-weight: 700;
      font-size: 0.86rem;
      line-height: 1.35;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .suggest-meta {
      font-size: 0.72rem;
      opacity: 0.65;
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .suggest-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 1px 7px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 30%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      white-space: nowrap;
    }
`;

html = html.replace('.toast {', suggestCss + '\n    .toast {');

// 2. Add data-suggest-type in renderFieldBox
const oldRenderFieldBox = `      const inputEl = isTextarea
        ? \`<textarea class="editable-textarea manuscript-textarea" oninput="updateOriginalField('\${key}', this.value)">\${safeVal}</textarea>\`
        : \`<input type="text" class="editable-input \${key === 'العنوان' ? 'hero-input' : ''}" value="\${safeVal}" oninput="updateOriginalField('\${key}', this.value)" />\`;`;

const newRenderFieldBox = `      let suggestAttr = '';
      if (key === 'المؤلف') suggestAttr = 'data-suggest-type="author" data-field-key="المؤلف" autocomplete="off"';
      else if (key === 'الموضوع') suggestAttr = 'data-suggest-type="subject" data-field-key="الموضوع" autocomplete="off"';

      const inputEl = isTextarea
        ? \`<textarea class="editable-textarea manuscript-textarea" oninput="updateOriginalField('\${key}', this.value)">\${safeVal}</textarea>\`
        : \`<input type="text" \${suggestAttr} class="editable-input \${key === 'العنوان' ? 'hero-input' : ''}" value="\${safeVal}" oninput="updateOriginalField('\${key}', this.value)" />\`;`;

html = html.replace(oldRenderFieldBox, newRenderFieldBox);

// 3. Add data-suggest-type in renderMarc
const oldSubsHtml = `        const subsHtml = m.subfields.map((s, subIdx) => \`
          <div class="sub-edit-row">
            <input class="sub-code-badge" value="$\${escapeHtml(s.code)}" onchange="updateSubCode(\${rowIdx}, \${subIdx}, this.value)" />
            <input class="sub-val-input" value="\${escapeHtml(s.value)}" oninput="updateSubVal(\${rowIdx}, \${subIdx}, this.value)" />
            <button class="icon-btn" title="إضافة حقل فرعي" onclick="addSubfield(\${rowIdx}, \${subIdx})">\${SVG_ICONS.plus}</button>
            <button class="icon-btn" title="حذف الحقل الفرعي" onclick="deleteSubfield(\${rowIdx}, \${subIdx})">\${SVG_ICONS.trash}</button>
          </div>
        \`).join('');`;

const newSubsHtml = `        const subsHtml = m.subfields.map((s, subIdx) => {
          let suggestAttr = '';
          if ((m.tag === '100' || m.tag === '700') && s.code === 'a') {
            suggestAttr = \`data-suggest-type="author" data-marc-row="\${rowIdx}" data-sub-idx="\${subIdx}" autocomplete="off"\`;
          } else if (m.tag === '650' && s.code === 'a') {
            suggestAttr = \`data-suggest-type="subject" data-marc-row="\${rowIdx}" data-sub-idx="\${subIdx}" autocomplete="off"\`;
          }
          return \`
            <div class="sub-edit-row">
              <input class="sub-code-badge" value="$\${escapeHtml(s.code)}" onchange="updateSubCode(\${rowIdx}, \${subIdx}, this.value)" />
              <input class="sub-val-input" \${suggestAttr} value="\${escapeHtml(s.value)}" oninput="updateSubVal(\${rowIdx}, \${subIdx}, this.value)" />
              <button class="icon-btn" title="إضافة حقل فرعي" onclick="addSubfield(\${rowIdx}, \${subIdx})">\${SVG_ICONS.plus}</button>
              <button class="icon-btn" title="حذف الحقل الفرعي" onclick="deleteSubfield(\${rowIdx}, \${subIdx})">\${SVG_ICONS.trash}</button>
            </div>
          \`;
        }).join('');`;

html = html.replace(oldSubsHtml, newSubsHtml);

// 4. Add dropdown container before </body>
if (!html.includes('id="autoSuggestDropdown"')) {
  html = html.replace('</body>', '  <div id="autoSuggestDropdown" class="suggest-dropdown"></div>\n</body>');
}

// 5. Add suggestion controller script
const suggestJs = `
    // ==================== SMART AUTOCOMPLETE CONTROLLER ====================
    let suggestTimer = null;
    let activeSuggestInput = null;
    let currentSuggestions = [];
    let selectedSuggestIndex = -1;

    function onSuggestInput(inputEl) {
      activeSuggestInput = inputEl;
      const q = inputEl.value.trim();
      const type = inputEl.getAttribute('data-suggest-type');
      clearTimeout(suggestTimer);

      if (q.length < 1) {
        closeSuggest();
        return;
      }

      suggestTimer = setTimeout(async () => {
        const apiPath = \`/api/authorities/\${type === 'author' ? 'authors' : 'subjects'}?q=\${encodeURIComponent(q)}&limit=10\`;
        try {
          const res = await fetch(apiPath);
          const data = await res.json();
          currentSuggestions = data.items || [];
          renderSuggestDropdown(inputEl, type, currentSuggestions);
        } catch (err) {
          console.error(err);
        }
      }, 100);
    }

    function renderSuggestDropdown(inputEl, type, items) {
      const dd = document.getElementById('autoSuggestDropdown');
      if (!items || items.length === 0) {
        dd.classList.remove('open');
        return;
      }

      selectedSuggestIndex = -1;
      const rect = inputEl.getBoundingClientRect();
      dd.style.top = (rect.bottom + window.scrollY + 5) + 'px';
      dd.style.left = Math.max(10, rect.left + window.scrollX) + 'px';
      dd.style.width = Math.max(rect.width, 320) + 'px';

      const authorIcon = '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:13px;height:13px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      const subjectIcon = '<svg class="svg-ic stroke" viewBox="0 0 24 24" style="width:13px;height:13px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';

      dd.innerHTML = items.map((item, idx) => {
        const isAuthor = type === 'author';
        const mainTitle = isAuthor ? item.name : (item.fullHeading || item.subject);
        const subTitle = isAuthor ? (item.dates || '') : '';
        const badgeText = item.source && item.source.startsWith('kiqp') ? 'kiqp.net' : 'dromh';
        const countText = \`\${item.count} نسخة\`;

        return \`
          <div class="suggest-item" data-index="\${idx}" onmousedown="selectSuggestionItem(\${idx})">
            <div>
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
            <button class="glass-pill" style="padding:3px 9px; font-size:0.72rem; pointer-events:none;">تطبيق</button>
          </div>
        \`;
      }).join('');

      dd.classList.add('open');
    }

    function selectSuggestionItem(idx) {
      const item = currentSuggestions[idx];
      if (!item || !activeSuggestInput) return;

      const type = activeSuggestInput.getAttribute('data-suggest-type');
      const fieldKey = activeSuggestInput.getAttribute('data-field-key');
      const marcRow = activeSuggestInput.getAttribute('data-marc-row');
      const subIdx = activeSuggestInput.getAttribute('data-sub-idx');

      if (type === 'author') {
        const cleanName = item.name.replace(/،$/, '');
        activeSuggestInput.value = cleanName;

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
            renderMarc(currentRecord);
            runLiveValidation();
          }
        }
      } else if (type === 'subject') {
        const heading = item.fullHeading || item.subject;
        activeSuggestInput.value = item.subject || heading;

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

    window.addEventListener('scroll', () => { closeSuggest(); }, true);
`;

html = html.replace('loadList();\n    selectRecord(17);', suggestJs + '\n    loadList();\n    selectRecord(17);');

fs.writeFileSync(uiPath, html, 'utf8');
console.log('Successfully injected Autocomplete into ' + uiPath);
