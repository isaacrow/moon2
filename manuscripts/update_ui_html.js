const fs = require("fs");
const path = require("path");

const UI_PATH = "D:\\MAN\\ui.html";
let html = fs.readFileSync(UI_PATH, "utf8");

console.log("Original UI length:", html.length);

// 1. Add Dashboard & Auth Styles right before </style>
const additionalStyles = `
    /* Pulsing Status Dot */
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34c759;
      box-shadow: 0 0 8px #34c759;
      display: inline-block;
      animation: pulseGreen 2s infinite;
      flex-shrink: 0;
    }
    @keyframes pulseGreen {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.7); }
      70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(52, 199, 89, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
    }

    /* Dashboard Layout */
    .dashboard-container {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .dash-scrollable {
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dash-hero-glass {
      padding: 16px 22px;
      border-radius: 24px;
      background-color: color-mix(in srgb, var(--c-glass) 16%, transparent);
      backdrop-filter: blur(16px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .dash-hero-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dash-grid-kpi {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
    }
    .kpi-card {
      padding: 16px 18px;
      border-radius: 20px;
      background-color: color-mix(in srgb, var(--c-glass) 14%, transparent);
      backdrop-filter: blur(14px) saturate(var(--saturation));
      box-shadow: var(--liquid-pill-shadow);
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: transform 160ms ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      background-color: color-mix(in srgb, var(--c-glass) 22%, transparent);
    }
    .kpi-num {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--c-action);
      font-family: "JetBrains Mono", "Cairo", monospace;
      letter-spacing: -0.02em;
    }
    .kpi-lbl {
      font-weight: 700;
      font-size: 0.88rem;
    }
    .kpi-sub {
      font-size: 0.7rem;
      opacity: 0.65;
    }

    .dash-panel {
      border-radius: 22px;
      background-color: color-mix(in srgb, var(--c-glass) 13%, transparent);
      backdrop-filter: blur(14px) saturate(var(--saturation));
      box-shadow: var(--liquid-shadow);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .dash-panel-head {
      padding: 12px 18px;
      border-bottom: 1px solid color-mix(in srgb, var(--c-content) 10%, transparent);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .dash-panel-body {
      padding: 16px 18px;
    }

    .dash-grid-analytics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 14px;
    }

    .dash-grid-split {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 14px;
    }

    .cloud-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 14px;
    }
    .cloud-box {
      padding: 16px;
      border-radius: 18px;
      background-color: color-mix(in srgb, var(--c-glass) 18%, transparent);
      box-shadow: var(--liquid-pill-shadow);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .cloud-box-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .copy-url-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Distribution Progress Bars */
    .dist-bar-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 9px;
    }
    .dist-bar-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .dist-bar-track {
      width: 100%;
      height: 8px;
      border-radius: 99em;
      background-color: color-mix(in srgb, var(--c-glass) 22%, transparent);
      overflow: hidden;
    }
    .dist-bar-fill {
      height: 100%;
      border-radius: 99em;
      background: linear-gradient(90deg, var(--c-action), color-mix(in srgb, var(--c-action) 70%, #fff));
      transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Audit & User Tables */
    .audit-entry {
      padding: 8px 12px;
      border-radius: 12px;
      background-color: color-mix(in srgb, var(--c-glass) 12%, transparent);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.8rem;
    }
    .user-entry {
      padding: 8px 12px;
      border-radius: 12px;
      background-color: color-mix(in srgb, var(--c-glass) 14%, transparent);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.82rem;
    }
`;

html = html.replace("</style>", additionalStyles + "\n  </style>");

// 2. In Header: Add Dashboard Toggle, Cloud Link Pill, and User Profile Pill
const headerNavAddition = `
      <button class="glass-pill" id="dashboardToggleBtn" onclick="toggleDashboard()">
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span id="dashboardToggleText">لوحة التحكم</span>
      </button>

      <button class="glass-pill" id="cloudBtn" onclick="openModal('cloudModal')" title="الربط السحابي والتشغيل على أجهزة أخرى">
        <span class="pulse-dot"></span>
        <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
        <span>الربط السحابي</span>
      </button>

      <div id="userProfileArea">
        <button class="glass-pill" onclick="openModal('loginModal')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
          <span>تسجيل الدخول</span>
        </button>
      </div>
`;

html = html.replace(
  '<button class="glass-pill save-btn" id="saveBtn" onclick="saveCurrentRecord()">',
  headerNavAddition + '\n      <button class="glass-pill save-btn" id="saveBtn" onclick="saveCurrentRecord()">'
);

// 3. Mark workspace with id="workspaceView"
html = html.replace('<div class="workspace">', '<div class="workspace" id="workspaceView">');

// 4. Inject Dashboard View right after workspace closure
const dashboardMarkup = `
  <!-- Dashboard Screen (لوحة التحكم والإحصاءات الببليوجرافية) -->
  <div class="dashboard-container" id="dashboardView" style="display:none;">
    <div class="dash-scrollable">
      
      <!-- Top Overview Bar -->
      <div class="dash-hero-glass">
        <div class="dash-hero-title">
          <svg class="svg-ic stroke" style="width:32px; height:32px; color:var(--c-action);" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <div>
            <div style="font-size:1.4rem; font-weight:800;">لوحة التحكم والإحصاءات المعيارية</div>
            <div style="font-size:0.78rem; opacity:0.75;">مؤشرات الأداء الببليوجرافي • الربط السحابي • التحليل الزمني • إدارة الفهرسة والمستخدمين</div>
          </div>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="glass-pill" onclick="refreshDashboardStats()">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            <span>تحديث البيانات</span>
          </button>
          <button class="glass-pill save-btn" onclick="toggleDashboard()">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>العودة للمخطوطات</span>
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards Grid -->
      <div class="dash-grid-kpi">
        <div class="kpi-card">
          <div class="kpi-num" id="kpiTotal">107,149</div>
          <div class="kpi-lbl">إجمالي المخطوطات المفهرسة</div>
          <div class="kpi-sub">قاعدة بيانات dromh.org المعيارية</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" id="kpiApproved">0</div>
          <div class="kpi-lbl">مخطوطات معتمدة RDA</div>
          <div class="kpi-sub">تم تدقيقها ومطابقتها لمعايير RDA</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" id="kpiReview">0</div>
          <div class="kpi-lbl">قيد التدقيق والمراجعة</div>
          <div class="kpi-sub">تنتظر فحص المدقق ورئيس الفهرسة</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" id="kpiEdited">0</div>
          <div class="kpi-lbl">سجلات معدلة ومحفوظة</div>
          <div class="kpi-sub">تم تعديل حقولها وحفظها في المنظومة</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" id="kpiAuthors">62,328</div>
          <div class="kpi-lbl">ملف استناد المؤلفين (=100)</div>
          <div class="kpi-sub">kiqp.net + dromh.org المقننة</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num" id="kpiSubjects">3,765</div>
          <div class="kpi-lbl">رؤوس الموضوعات (=650)</div>
          <div class="kpi-sub">مصنفة ومعيارية مع تفريعات شكلية</div>
        </div>
      </div>

      <!-- Cloud & Multi-Device Access Panel -->
      <div class="dash-panel">
        <div class="dash-panel-head">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
            <span style="font-weight:800; font-size:1.05rem;">الربط السحابي والتشغيل على الأجهزة الأخرى (Cloud / Multi-Device Access)</span>
          </div>
          <span class="side-tag" id="cloudStatusBadge">جاهز للاتصال</span>
        </div>
        <div class="dash-panel-body">
          <div class="cloud-cards-grid">
            
            <!-- LAN Access Card -->
            <div class="cloud-box">
              <div class="cloud-box-title">
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span>الشبكة المحلية (Wi-Fi / LAN)</span>
              </div>
              <div style="font-size:0.78rem; opacity:0.75; line-height:1.5;">
                يمكن لأي هاتف ذكي، جهاز لوحي، أو حاسوب محمول متصل بنفس شبكة الراوتر الدخول فوراً بدون إعدادات:
              </div>
              <div class="copy-url-row">
                <input type="text" class="glass-input" id="dashLanUrl" readonly value="http://10.112.29.113:3456" />
                <button class="glass-pill" onclick="copyToClipboard(document.getElementById('dashLanUrl').value)">
                  <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>نسخ الرابط</span>
                </button>
              </div>
              <div style="font-size:0.7rem; opacity:0.6;">(رابط محلي فائق السرعة عبر منفذ 3456)</div>
            </div>

            <!-- Public Cloud Access Card -->
            <div class="cloud-box">
              <div class="cloud-box-title">
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span>الرابط السحابي العام (Public Cloud HTTPS Link)</span>
              </div>
              <div style="font-size:0.78rem; opacity:0.75; line-height:1.5;">
                رابط HTTPS عالمي آمن يتيح فتح المنظومة من أي جهاز حول العالم أو عبر شبكة الهاتف الخلوي:
              </div>
              <div class="copy-url-row">
                <input type="text" class="glass-input" id="dashCloudUrl" readonly placeholder="جاري تهيئة النفق السحابي..." />
                <button class="glass-pill" onclick="copyToClipboard(document.getElementById('dashCloudUrl').value)">
                  <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>نسخ</span>
                </button>
                <a class="glass-pill" id="dashCloudOpenBtn" href="#" target="_blank" style="display:none;">
                  <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                  <span>فتح</span>
                </a>
                <button class="glass-pill" onclick="triggerStartCloudTunnel()">
                  <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  <span>توليد</span>
                </button>
              </div>
              <div style="font-size:0.7rem; opacity:0.6;">(مشفّر SSL ويدعم الدخول المتزامن لفرق الفهرسة)</div>
            </div>

          </div>
        </div>
      </div>

      <!-- Facet Analytics Grid: Centuries, Calligraphy Scripts, Languages -->
      <div class="dash-grid-analytics">
        
        <!-- Centuries Distribution -->
        <div class="dash-panel">
          <div class="dash-panel-head">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style="font-weight:700; font-size:0.95rem;">التوزيع الزمني للمخطوطات (القرون الهجرية)</span>
            </div>
            <span class="side-tag">107,149 مخطوط</span>
          </div>
          <div class="dash-panel-body" id="centuriesBarList"></div>
        </div>

        <!-- Script & Calligraphy Distribution -->
        <div class="dash-panel">
          <div class="dash-panel-head">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
              <span style="font-weight:700; font-size:0.95rem;">أنواع الخطوط العربية والإسلامية</span>
            </div>
            <span class="side-tag">توزيع الخطوط</span>
          </div>
          <div class="dash-panel-body" id="scriptsBarList"></div>
        </div>

        <!-- Language Distribution -->
        <div class="dash-panel">
          <div class="dash-panel-head">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span style="font-weight:700; font-size:0.95rem;">لغات المخطوطات</span>
            </div>
            <span class="side-tag">اللغات الأصلية</span>
          </div>
          <div class="dash-panel-body" id="languagesBarList"></div>
        </div>

      </div>

      <!-- Two-Column Row: Live Audit Stream + User Management -->
      <div class="dash-grid-split">
        
        <!-- Live Audit Trail -->
        <div class="dash-panel">
          <div class="dash-panel-head">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span style="font-weight:700; font-size:0.95rem;">سجل نشاط المفهرسين والعمليات الحية (Audit Trail)</span>
            </div>
            <span class="side-tag">مباشر</span>
          </div>
          <div class="dash-panel-body" style="max-height:360px; overflow-y:auto;" id="auditLogsList">
            <div style="text-align:center; opacity:0.6; padding:20px;">جاري تحميل سجل النشاط...</div>
          </div>
        </div>

        <!-- Real User Management -->
        <div class="dash-panel">
          <div class="dash-panel-head">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span style="font-weight:700; font-size:0.95rem;">إدارة حسابات المستخدمين والصلاحيات (User DB)</span>
            </div>
            <span class="side-tag" id="userCountTag">3 مستخدمين</span>
          </div>
          <div class="dash-panel-body">
            
            <!-- Create User Form -->
            <form onsubmit="handleCreateUser(event)" style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid color-mix(in srgb, var(--c-content) 12%, transparent);">
              <div style="font-size:0.8rem; font-weight:700;">إضافة مستخدم جديد:</div>
              <div class="form-row">
                <input type="text" id="newUsername" class="glass-input" placeholder="اسم الدخول (e.g. ahmed)" required />
                <input type="password" id="newPassword" class="glass-input" placeholder="كلمة المرور" required />
              </div>
              <div class="form-row">
                <input type="text" id="newFullName" class="glass-input" placeholder="الاسم الكامل (e.g. أحمد الخفاجي)" required />
                <select id="newRole" class="glass-select">
                  <option value="cataloger">مفهرس مخطوطات (Cataloger)</option>
                  <option value="reviewer">مدقق جودة RDA (Reviewer)</option>
                  <option value="admin">مدير المنظومة (Admin)</option>
                </select>
              </div>
              <div style="display:flex; justify-content:flex-end;">
                <button type="submit" class="glass-pill save-btn dirty" style="font-size:0.8rem; padding:6px 14px;">
                  <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span>إضافة المستخدم إلى قاعدة البيانات</span>
                </button>
              </div>
            </form>

            <!-- Users List Table -->
            <div id="usersTableList" style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>

          </div>
        </div>

      </div>

    </div>
  </div>
`;

// Insert after `</main>\n  </div>`
html = html.replace("</main>\n  </div>", "</main>\n  </div>\n" + dashboardMarkup);

// 5. Inject Login Modal and Cloud Modal before `<script>`
const modalsMarkup = `
  <!-- MODAL: Real User Login Screen (Liquid Glass / Apple visionOS) -->
  <div class="modal-backdrop" id="loginModal" onclick="if(event.target===this)closeModal('loginModal')">
    <div class="modal-glass" style="max-width:440px; text-align:center;">
      <div class="modal-head" style="justify-content:center; border:none; padding-bottom:4px;">
        <div class="logo-glass" style="width:68px; height:46px; margin:0 auto;" title="علقمي">
          <img src="/logo.png" alt="علقمي" />
        </div>
      </div>
      <div style="font-size:1.35rem; font-weight:800; margin-top:2px;">تسجيل الدخول إلى علقمي</div>
      <div style="font-size:0.78rem; opacity:0.7; margin-bottom:16px;">منظومة الفهرسة المعيارية وإدارة المخطوطات</div>

      <div class="modal-body" style="padding-top:0;">
        <form onsubmit="handleLoginForm(event)" style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label class="field-caption" style="text-align:right;">اسم المستخدم</label>
            <input type="text" id="loginUsername" class="glass-input" placeholder="اسم المستخدم" required />
          </div>
          <div>
            <label class="field-caption" style="text-align:right;">كلمة المرور</label>
            <input type="password" id="loginPassword" class="glass-input" placeholder="كلمة المرور" required />
          </div>

          <button type="submit" class="glass-pill save-btn dirty" style="width:100%; justify-content:center; padding:10px; font-size:0.92rem; margin-top:6px;">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            <span>تسجيل الدخول</span>
          </button>
        </form>

        <!-- Quick Demo Role Logins -->
        <div style="margin-top:16px; padding-top:14px; border-top:1px solid color-mix(in srgb, var(--c-content) 12%, transparent);">
          <div style="font-size:0.74rem; opacity:0.75; margin-bottom:8px; font-weight:600;">الدخول التجريبي السريع بنقرة واحدة:</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button class="glass-pill" style="justify-content:space-between; padding:8px 12px;" onclick="quickLoginRole('admin')">
              <span style="display:flex; align-items:center; gap:6px;">
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style="font-weight:700;">مدير المنظومة (Admin)</span>
              </span>
              <span class="side-tag">صلاحيات شاملة</span>
            </button>
            <button class="glass-pill" style="justify-content:space-between; padding:8px 12px;" onclick="quickLoginRole('cataloger')">
              <span style="display:flex; align-items:center; gap:6px;">
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
                <span style="font-weight:700;">مفهرس معتمد (Cataloger)</span>
              </span>
              <span class="side-tag">تعديل وفهرسة</span>
            </button>
            <button class="glass-pill" style="justify-content:space-between; padding:8px 12px;" onclick="quickLoginRole('reviewer')">
              <span style="display:flex; align-items:center; gap:6px;">
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style="font-weight:700;">مدقق جودة RDA (Reviewer)</span>
              </span>
              <span class="side-tag">اعتماد وفحص</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- MODAL: Cloud / Multi-Device Access Helper -->
  <div class="modal-backdrop" id="cloudModal" onclick="if(event.target===this)closeModal('cloudModal')">
    <div class="modal-glass" style="max-width:540px;">
      <div class="modal-head">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          <span>الربط السحابي والتشغيل على الأجهزة الأخرى</span>
        </div>
        <button class="glass-pill" onclick="closeModal('cloudModal')">
          <svg class="svg-ic stroke" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span>إغلاق</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="cloud-box">
          <div class="cloud-box-title">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>رابط السحابة المباشر (Public Cloud Link)</span>
          </div>
          <div style="font-size:0.8rem; opacity:0.8;">افتح هذا الرابط على هاتفك الذكي أو أي جهاز خارجي:</div>
          <div class="copy-url-row">
            <input type="text" class="glass-input" id="modalCloudUrl" readonly placeholder="جاري تهيئة الرابط..." />
            <button class="glass-pill" onclick="copyToClipboard(document.getElementById('modalCloudUrl').value)">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>نسخ</span>
            </button>
          </div>
        </div>

        <div class="cloud-box" style="margin-top:10px;">
          <div class="cloud-box-title">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>رابط الشبكة المحلية (Wi-Fi / LAN)</span>
          </div>
          <div style="font-size:0.8rem; opacity:0.8;">للأجهزة المتصلة بنفس شبكة الواي فاي المنزلية أو المكتبية:</div>
          <div class="copy-url-row">
            <input type="text" class="glass-input" id="modalLanUrl" readonly value="http://10.112.29.113:3456" />
            <button class="glass-pill" onclick="copyToClipboard(document.getElementById('modalLanUrl').value)">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>نسخ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

html = html.replace("<script>", modalsMarkup + "\n  <script>");

// 6. Add JavaScript functions for Auth, Dashboard, Cloud Link
const scriptAdditions = `
    // ----------------------------------------------------
    // User Authentication & State
    // ----------------------------------------------------
    let currentUser = null;
    let isDashboardOpen = false;

    function getAuthHeaders() {
      const token = localStorage.getItem('alqami_token');
      return token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    }

    async function initAuth() {
      const token = localStorage.getItem('alqami_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
          const data = await res.json();
          if (data && data.user) {
            currentUser = data.user;
          } else {
            localStorage.removeItem('alqami_token');
            currentUser = null;
          }
        } catch (e) {
          currentUser = null;
        }
      }
      updateUserUI();
    }

    function updateUserUI() {
      const area = document.getElementById('userProfileArea');
      if (!area) return;
      if (currentUser) {
        area.innerHTML = \`
          <div class="glass-pill" style="gap:7px; padding:4px 10px;">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
            <span style="font-weight:700; font-size:0.8rem;">\${escapeHtml(currentUser.fullName || currentUser.username)}</span>
            <span class="side-tag" style="font-size:0.68rem;">\${escapeHtml(currentUser.roleTitle || currentUser.role)}</span>
            <button class="icon-btn" onclick="doLogout()" title="تسجيل الخروج" style="margin-right:2px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        \`;
      } else {
        area.innerHTML = \`
          <button class="glass-pill" onclick="openModal('loginModal')">
            <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
            <span>تسجيل الدخول</span>
          </button>
        \`;
      }
    }

    async function handleLoginForm(e) {
      e.preventDefault();
      const u = document.getElementById('loginUsername').value.trim();
      const p = document.getElementById('loginPassword').value;
      await performLogin(u, p);
    }

    async function quickLoginRole(role) {
      const creds = {
        admin: { u: 'admin', p: 'admin123' },
        cataloger: { u: 'cataloger', p: 'cat123' },
        reviewer: { u: 'reviewer', p: 'rev123' }
      };
      const c = creds[role] || creds.admin;
      document.getElementById('loginUsername').value = c.u;
      document.getElementById('loginPassword').value = c.p;
      await performLogin(c.u, c.p);
    }

    async function performLogin(username, password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.ok) {
          localStorage.setItem('alqami_token', data.token);
          currentUser = data.user;
          updateUserUI();
          closeModal('loginModal');
          showToast('مرحباً بك يا ' + (currentUser.fullName || currentUser.username));
          if (isDashboardOpen) refreshDashboardStats();
        } else {
          alert(data.error || 'فشل تسجيل الدخول');
        }
      } catch (err) {
        alert('خطأ في الاتصال: ' + err.message);
      }
    }

    async function doLogout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
      } catch (e) {}
      localStorage.removeItem('alqami_token');
      currentUser = null;
      updateUserUI();
      showToast('تم تسجيل الخروج بنجاح');
      if (isDashboardOpen) refreshDashboardStats();
    }

    // ----------------------------------------------------
    // Dashboard View Toggle & Stats
    // ----------------------------------------------------
    function toggleDashboard() {
      isDashboardOpen = !isDashboardOpen;
      const ws = document.getElementById('workspaceView');
      const db = document.getElementById('dashboardView');
      const text = document.getElementById('dashboardToggleText');

      if (isDashboardOpen) {
        ws.style.display = 'none';
        db.style.display = 'flex';
        text.textContent = 'المخطوطات';
        refreshDashboardStats();
      } else {
        db.style.display = 'none';
        ws.style.display = 'grid';
        text.textContent = 'لوحة التحكم';
      }
    }

    async function refreshDashboardStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        renderDashboardData(data);
      } catch (e) {
        console.error('Stats error:', e);
      }
      fetchUsersList();
      fetchCloudTunnelStatus();
    }

    function renderDashboardData(data) {
      if (!data) return;
      document.getElementById('kpiTotal').textContent = Number(data.totalRecords).toLocaleString();
      document.getElementById('kpiApproved').textContent = Number(data.workflow.approved).toLocaleString();
      document.getElementById('kpiReview').textContent = Number(data.workflow.review).toLocaleString();
      document.getElementById('kpiEdited').textContent = Number(data.totalEdited).toLocaleString();
      document.getElementById('kpiAuthors').textContent = Number(data.authorities.totalAuthors).toLocaleString();
      document.getElementById('kpiSubjects').textContent = Number(data.authorities.totalSubjects).toLocaleString();

      // Centuries
      const centContainer = document.getElementById('centuriesBarList');
      if (centContainer && data.analytics && data.analytics.centuries) {
        const entries = Object.entries(data.analytics.centuries);
        const maxVal = Math.max(...entries.map(e => e[1]), 1);
        centContainer.innerHTML = entries.map(([c, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return \`
            <div class="dist-bar-item">
              <div class="dist-bar-labels">
                <span>\${escapeHtml(c)}</span>
                <span>\${Number(count).toLocaleString()} مخطوط (\${pct}%)</span>
              </div>
              <div class="dist-bar-track">
                <div class="dist-bar-fill" style="width:\${pct}%;"></div>
              </div>
            </div>
          \`;
        }).join('');
      }

      // Scripts
      const scriptsContainer = document.getElementById('scriptsBarList');
      if (scriptsContainer && data.analytics && data.analytics.scripts) {
        const entries = Object.entries(data.analytics.scripts);
        const maxVal = Math.max(...entries.map(e => e[1]), 1);
        scriptsContainer.innerHTML = entries.map(([s, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return \`
            <div class="dist-bar-item">
              <div class="dist-bar-labels">
                <span>\${escapeHtml(s)}</span>
                <span>\${Number(count).toLocaleString()} (\${pct}%)</span>
              </div>
              <div class="dist-bar-track">
                <div class="dist-bar-fill" style="width:\${pct}%;"></div>
              </div>
            </div>
          \`;
        }).join('');
      }

      // Languages
      const langContainer = document.getElementById('languagesBarList');
      if (langContainer && data.analytics && data.analytics.languages) {
        const entries = Object.entries(data.analytics.languages);
        const maxVal = Math.max(...entries.map(e => e[1]), 1);
        langContainer.innerHTML = entries.map(([l, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return \`
            <div class="dist-bar-item">
              <div class="dist-bar-labels">
                <span>\${escapeHtml(l)}</span>
                <span>\${Number(count).toLocaleString()} (\${pct}%)</span>
              </div>
              <div class="dist-bar-track">
                <div class="dist-bar-fill" style="width:\${pct}%;"></div>
              </div>
            </div>
          \`;
        }).join('');
      }

      // Audit Logs
      const auditContainer = document.getElementById('auditLogsList');
      if (auditContainer && data.recentActivity) {
        if (data.recentActivity.length === 0) {
          auditContainer.innerHTML = '<div style="text-align:center; opacity:0.6; padding:15px;">لا توجد عمليات مسجلة حديثاً</div>';
        } else {
          auditContainer.innerHTML = data.recentActivity.map(act => {
            const timeStr = new Date(act.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return \`
              <div class="audit-entry">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="side-tag" style="font-size:0.68rem;">\${escapeHtml(act.username)}</span>
                  <span style="font-weight:700;">\${escapeHtml(act.action)}</span>
                  \${act.recordId ? \`<span style="opacity:0.65; font-family:'JetBrains Mono', monospace;">[سجل \${escapeHtml(act.recordId)}]</span>\` : ''}
                  \${act.details ? \`<span style="opacity:0.8;">- \${escapeHtml(act.details)}</span>\` : ''}
                </div>
                <span style="font-size:0.7rem; opacity:0.55; direction:ltr; font-family:'JetBrains Mono', monospace;">\${timeStr}</span>
              </div>
            \`;
          }).join('');
        }
      }
    }

    // ----------------------------------------------------
    // User Management API Calls
    // ----------------------------------------------------
    async function fetchUsersList() {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        const users = data.users || [];
        document.getElementById('userCountTag').textContent = users.length + ' مستخدمين';
        const container = document.getElementById('usersTableList');
        if (!container) return;
        container.innerHTML = users.map(u => \`
          <div class="user-entry">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg class="svg-ic stroke" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
              <span style="font-weight:700;">\${escapeHtml(u.fullName)}</span>
              <span style="opacity:0.65; font-family:'JetBrains Mono', monospace;">(@\${escapeHtml(u.username)})</span>
              <span class="side-tag">\${escapeHtml(u.roleTitle || u.role)}</span>
            </div>
            \${u.username !== 'admin' ? \`
              <button class="icon-btn" onclick="deleteUserAccount('\${escapeHtml(u.username)}')" title="حذف المستخدم">
                <svg class="svg-ic stroke" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            \` : '<span style="font-size:0.68rem; opacity:0.5;">افتراضي</span>'}
          </div>
        \`).join('');
      } catch (e) {
        console.error('Fetch users error:', e);
      }
    }

    async function handleCreateUser(e) {
      e.preventDefault();
      const username = document.getElementById('newUsername').value.trim();
      const password = document.getElementById('newPassword').value;
      const fullName = document.getElementById('newFullName').value.trim();
      const role = document.getElementById('newRole').value;

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ username, password, fullName, role })
        });
        const data = await res.json();
        if (data.ok) {
          showToast('تمت إضافة المستخدم بنجاح');
          document.getElementById('newUsername').value = '';
          document.getElementById('newPassword').value = '';
          document.getElementById('newFullName').value = '';
          fetchUsersList();
        } else {
          alert(data.error || 'فشلت إضافة المستخدم');
        }
      } catch (err) {
        alert('خطأ: ' + err.message);
      }
    }

    async function deleteUserAccount(username) {
      if (!confirm('هل أنت متأكد من حذف حساب: ' + username + '؟')) return;
      try {
        const res = await fetch('/api/users?username=' + encodeURIComponent(username), {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.ok) {
          showToast('تم حذف المستخدم بنجاح');
          fetchUsersList();
        } else {
          alert(data.error || 'فشل حذف المستخدم');
        }
      } catch (err) {
        alert('خطأ: ' + err.message);
      }
    }

    // ----------------------------------------------------
    // Cloud Tunneling & Multi-Device
    // ----------------------------------------------------
    async function fetchCloudTunnelStatus() {
      try {
        const res = await fetch('/api/tunnel/status');
        const data = await res.json();
        if (data) {
          if (data.lanUrl) {
            document.getElementById('dashLanUrl').value = data.lanUrl;
            document.getElementById('modalLanUrl').value = data.lanUrl;
          }
          if (data.cloudUrl) {
            document.getElementById('dashCloudUrl').value = data.cloudUrl;
            document.getElementById('modalCloudUrl').value = data.cloudUrl;
            const openBtn = document.getElementById('dashCloudOpenBtn');
            if (openBtn) {
              openBtn.href = data.cloudUrl;
              openBtn.style.display = 'inline-flex';
            }
            document.getElementById('cloudStatusBadge').textContent = 'نفق سحابي متصل';
          } else {
            document.getElementById('dashCloudUrl').placeholder = data.status || 'اضغط توليد لبدء النفق';
            document.getElementById('modalCloudUrl').placeholder = data.status || 'اضغط توليد لبدء النفق';
          }
        }
      } catch (e) {}
    }

    async function triggerStartCloudTunnel() {
      showToast('جاري إنشاء النفق السحابي...');
      try {
        const res = await fetch('/api/tunnel/start', { method: 'POST' });
        const data = await res.json();
        if (data && data.cloudUrl) {
          document.getElementById('dashCloudUrl').value = data.cloudUrl;
          document.getElementById('modalCloudUrl').value = data.cloudUrl;
          const openBtn = document.getElementById('dashCloudOpenBtn');
          if (openBtn) {
            openBtn.href = data.cloudUrl;
            openBtn.style.display = 'inline-flex';
          }
          document.getElementById('cloudStatusBadge').textContent = 'نفق سحابي متصل';
          showToast('تم تفعيل الرابط السحابي بنجاح!');
        } else {
          showToast('تنبيه النفق: ' + (data.status || 'غير متاح'));
        }
      } catch (e) {
        showToast('خطأ في الاتصال بالنفق: ' + e.message);
      }
    }

    function copyToClipboard(text) {
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        showToast('تم نسخ الرابط بنجاح: ' + text);
      }).catch(() => {
        prompt('انسخ الرابط يدوياً:', text);
      });
    }
`;

// Insert the JS functions right before `loadList();`
html = html.replace("loadList();\n    selectRecord(17);", scriptAdditions + "\n    initAuth();\n    fetchCloudTunnelStatus();\n    loadList();\n    selectRecord(17);");

fs.writeFileSync(UI_PATH, html, "utf8");
console.log("Updated ui.html with Dashboard, Cloud Link, and Auth! New length:", html.length);
