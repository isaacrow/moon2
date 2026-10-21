import backendRdf from './backendRdf.json';

/**
 * ALQAMI SPATIAL OPAC — REAL 3D MODELS & BACKEND RDF/BIBFRAME RECORDS
 * ONLY the models and backend RDF records shared from:
 * "D:\New foltdftrdr\alqami3-main (6)"
 */

export const ARTIFACT_RECORDS = [
  {
    id: "ALQ-MAP-001",
    slug: "babylonian-map-of-the-world",
    title: {
      ar: "خريطة بابل للعالم (إيماجو موندي)",
      en: "Babylonian Map of the World (Imago Mundi)"
    },
    category: "iraq",
    categoryLabel: {
      ar: "تراث العراق القديم",
      en: "Ancient Iraq"
    },
    period: {
      ar: "القرن السادس أو الخامس ق.م (بابل)",
      en: "6th–5th Century BCE (Babylon)"
    },
    creator: {
      ar: "ناسخ كاهن بابلي (غير معروف)",
      en: "Unknown Babylonian Scribe",
      uri: "https://id.loc.gov/authorities/names/no2024babylonian"
    },
    institution: {
      ar: "المتحف البريطاني (BM 92687) • مستودع علقمي الرقمي",
      en: "British Museum (BM 92687) • Alqami Repository"
    },
    model: {
      glb: "./models/babylonian_map_of_the_world_tablet_-_imago_mundi.glb",
      poster: "./images/praha_front.jpg",
      scale: "1.2 1.2 1.2",
      cameraOrbit: "0deg 75deg 105%",
      fieldOfView: "30deg",
      hasAr: true,
      annotations: [
        {
          position: "0.01 0.05 0.02",
          normal: "0 1 0",
          title: { ar: "مدينة بابل المركزية", en: "City of Babylon" },
          text: { ar: "ممثلة بمستطيل في وسط الخريطة يخترقه نهر الفرات.", en: "Depicted as a central rectangle bisected by the Euphrates." }
        },
        {
          position: "-0.04 0.02 0.01",
          normal: "0 1 0",
          title: { ar: "المحيط المالح (نهر المرارة)", en: "Salt Ocean (Bitter River)" },
          text: { ar: "حلقة مائية دائرية تحيط بالعالم المعروف وتفصله عن الجزر الأسطورية.", en: "A ring of water encircling the known world with triangular mythical regions." }
        }
      ]
    },
    physical: {
      dimensions: "12.2 × 8.2 سم",
      material: { ar: "طين مفخور", en: "Clay" },
      condition: { ar: "سليم جزئياً مع تآكل الأطراف", en: "Partially intact" }
    },
    bibframe: {
      workUri: "https://alqami.net/artifact/map/work",
      instanceUri: "https://alqami.net/artifact/map",
      itemUri: "https://britishmuseum.org/collection/object/Y_EA92687",
      classification: {
        lcc: "GA205 .B33",
        ddc: "912.35"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2011026387", label: "Cartographic materials" },
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026111", label: "Clay tablets" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85020512", label: "Cartography -- History" },
        { uri: "http://id.loc.gov/authorities/subjects/sh85010756", label: "Babylonia -- Civilization" }
      ]
    },
    backendRdfFile: "babylonian_map_of_the_world_tablet_-_imago_mundi.rdf",
    backendTtlFile: "babylonian_map_of_the_world_tablet_-_imago_mundi.ttl",
    rawBackendRdf: backendRdf["babylonian_map_of_the_world_tablet_-_imago_mundi.rdf"] || "",
    rawBackendTtl: backendRdf["babylonian_map_of_the_world_tablet_-_imago_mundi.ttl"] || "",
    summary: {
      ar: "تعتبر من أقدم الخرائط المعروفة في العالم، تظهر بابل في المركز وتحيط بها الأهوار والمحيط 'نهر المرارة'. وثيقة كارتوغرافية فلكية نادرة من طين بلاد النهرين.",
      en: "The earliest known map of the world from ancient Mesopotamia. It represents Babylon as the central hub traversed by the Euphrates, encircled by the Bitter Ocean."
    }
  },
  {
    id: "ALQ-SWD-002",
    slug: "zulfiqar-sword",
    title: {
      ar: "سيف ذو الفقار التاريخي",
      en: "Zulfiqar Sword Artifact"
    },
    category: "ahlulbayt",
    categoryLabel: {
      ar: "تراث أهل البيت (ع)",
      en: "Ahl al-Bayt Heritage"
    },
    period: {
      ar: "القرن الأول الهجري (العصر النبوي والعلوي)",
      en: "1st Century AH (Prophetic & Alid Era)"
    },
    creator: {
      ar: "صناع السيوف الدمشقية التاريخية",
      en: "Damascene Armorer Mastercraft",
      uri: "https://alqami.net/agent/swordsmith"
    },
    institution: {
      ar: "متحف الكفيل للنفائس والمخطوطات • العتبة العباسية المقدسة",
      en: "Al-Kafeel Museum • Al-Abbas Holy Shrine"
    },
    model: {
      glb: "./models/Zulfiqar_Sword.glb",
      poster: "./images/alqami_artifact.jpg",
      scale: "0.85 0.85 0.85",
      cameraOrbit: "45deg 60deg 115%",
      fieldOfView: "35deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.42 0.01",
          normal: "0 0 1",
          title: { ar: "الشفرة المزدوجة", en: "Bifurcated Blade" },
          text: { ar: "الرأس المشقوق المميز الذي اشتهر به سيف الإمام علي (ع).", en: "Iconic bifurcated blade historically associated with Imam Ali (a.s.)." }
        }
      ]
    },
    physical: {
      dimensions: "98.5 × 14.2 × 4.8 سم",
      material: { ar: "فولاذ دمشقي، فضة، جلد", en: "Crucible Damascus Steel, Silver, Leather" },
      condition: { ar: "حالة ممتازة ومصونة", en: "Mint condition" }
    },
    bibframe: {
      workUri: "https://alqami.net/museum/zulfiqar_sword/work",
      instanceUri: "https://alqami.net/museum/zulfiqar_sword",
      itemUri: "https://alkafeel.net/museum/item/zulfiqar-313",
      classification: {
        lcc: "U856 .I74 Z85",
        ddc: "739.72"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026190", label: "Weapons" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85003507", label: "Ali ibn Abi Talib, Caliph, approximately 600-661" },
        { uri: "http://id.loc.gov/authorities/subjects/sh85131093", label: "Swords -- Islamic countries" }
      ]
    },
    backendRdfFile: "Zulfiqar_Sword.ttl",
    backendTtlFile: "Zulfiqar_Sword.ttl",
    rawBackendRdf: backendRdf["Zulfiqar_Sword.ttl"] || "",
    rawBackendTtl: backendRdf["Zulfiqar_Sword.ttl"] || "",
    summary: {
      ar: "سيف ذو الفقار التاريخي رمز العدالة والشجاعة في التراث الإسلامي، اشتهر بنداء 'لا فتى إلا علي ولا سيف إلا ذو الفقار'.",
      en: "The historic Zulfiqar sword, emblem of valor in Islamic civilization, wielded by Imam Ali (a.s.)."
    }
  },
  {
    id: "ALQ-MS-003",
    slug: "al-qabasat-mir-damad",
    title: {
      ar: "مخطوط القبسات — الميرداماد (1650 م)",
      en: "Al-Qabasat Manuscript — Mir Damad (1650 CE)"
    },
    category: "manuscripts",
    categoryLabel: {
      ar: "المخطوطات والنوادر",
      en: "Rare Manuscripts"
    },
    period: {
      ar: "1061 هـ / 1650 م (العصر الصفوي)",
      en: "1061 AH / 1650 CE"
    },
    creator: {
      ar: "الميرداماد، محمد باقر بن محمد الحسيني الاسترآبادي (توفي 1041 هـ)",
      en: "Mir Damad (d. 1041 AH)",
      uri: "http://id.loc.gov/authorities/names/n85043844",
      role: "http://id.loc.gov/vocabulary/relators/aut"
    },
    institution: {
      ar: "مكتبة مجلس الشورى (4662) • نظام مكتبات مون (Moon Woolf OPAC)",
      en: "Majlis Library (4662) • Moon Woolf OPAC"
    },
    edition: {
      ar: "نسخة مخطوطة كاملة مجدولة ومذهبة",
      en: "Complete illuminated and gold-ruled manuscript codex"
    },
    responsibilityStatement: {
      ar: "للميرداماد محمد باقر الحسيني الاسترآبادي.",
      en: "By Mir Damad Muhammad Baqir al-Husayni al-Astarabadi."
    },
    model: {
      glb: "./models/model.glb?v=3",
      poster: "./images/manuscript.jpg",
      scale: "0.95 0.95 0.95",
      cameraOrbit: "25deg 70deg 110%",
      fieldOfView: "32deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.12 0.05",
          normal: "0 0 1",
          title: { ar: "ديباجة المخطوط المذهبة (أوله)", en: "Illuminated Incipit" },
          text: { ar: "الحمد لله الواحد الاحد الصمد المصمود مهيمن كل وجود وجاعل كل موجود...", en: "Opening lines in fine Nastaliq script." }
        },
        {
          position: "0.05 0.02 -0.05",
          normal: "0 1 0",
          title: { ar: "خاتمة المخطوط (آخره)", en: "Explicit Colophon" },
          text: { ar: "ولا تخلنا اللهم مع ذلك من عواطف رأفتك وسوابغ رحمتك ولطايف كفايتك...", en: "Concluding supplication and prayer." }
        }
      ]
    },
    physical: {
      dimensions: "ورق، حبر اسود، خط النستعليق (18 سطرًا في الصفحة)",
      extent: "344 ورقة (18 سطرًا)",
      material: { ar: "ورق، حبر اسود، خط النستعليق، جلد احمر", en: "Paper, black ink, Nastaliq script, red leather" },
      condition: { ar: "سليمة ونادرة، مجدولة ومذهبة والغلاف جلد أحمر", en: "Intact, gold-ruled margins, red leather binding" },
      binding: "الغلاف : جلد، احمر.",
      decoration: "النسخة مجدولة والورقة الاولى عليها زخرفة وتذهيب دقيق.",
      seals: "في اولها مجموعة اختام تملكية تاريخية.",
      catchwords: "مرتبة بنظام التعقيبات في أسفل الصفحات."
    },
    production: {
      place: "كربلاء المقدسة / طهران",
      placeUri: "https://moonlib.org/resource/place/85k16m",
      scribe: "خطاط غير مصرح (خط النستعليق)",
      scribeUri: "https://moonlib.org/resource/agent/4cc5xf",
      date: "1650 [1061 هـ.]",
      series: "تراث الحكمة والفلسفة الاسلامية ؛ القسم الفلسفي 14"
    },
    notes: {
      incipit: "الحمد لله الواحد الاحد الصمد المصمود مهيمن كل وجود وجاعل كل موجود، والصلاة على من اقتفاه من زمرة الانبياء، واصطفاه من رسل الرسل فابتعثه بالذكر...",
      explicit: "ولا تخلنا اللهم مع ذلك من عواطف رأفتك وسوابغ رحمتك ولطايف كفايتك وحوط عنايتك وحسن كلائتك بجودك ومنك وفضلك وطولك يا أرحم الراحمين.",
      dhariahCitation: "الذريعة الى تصانيف الشيعة، الجزء 17، الصفحه 32، الرقم 183.",
      holdingNote: "مكتبة مجلس الشورى : 4662، طهران، ايران (ir)",
      systemIdentifiers: ["b125923", "(Sirsi) a209527"]
    },
    adminMetadata: {
      adminUri: "https://moonlib.org/resource/admin/mv2pnk8uy76l4",
      source: "Moon Library System — Blue Moon",
      generator: "Blue Moon v1.0 (Monograph (Complete))",
      creationDate: "2026-10-10",
      descriptionConventions: "RDA (Resource Description and Access)",
      catalogingLanguage: "eng",
      resourceLanguage: "ara"
    },
    bibframe: {
      workUri: "http://example.org/work/1789642441889",
      expressionUri: "https://moonlib.org/resource/expression/mv2pnk8uy76l4-1",
      instanceUri: "http://example.org/instance/1789642441889",
      itemUri: "https://moonlib.org/resource/item/mv2pnk8uy76l4-1",
      classification: {
        lcc: "B753.D363",
        ddc: "181.07"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026139", label: "مخطوطات (Manuscripts)" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85068499", label: "الفلسفة الاسلامية الشيعية (Islamic Shia Philosophy)" },
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026139", label: "مخطوطات اسلامية (Islamic manuscripts)" }
      ]
    },
    backendRdfFile: "mv2pnk8uy76l4.rdf",
    backendTtlFile: "alqabasat.ttl",
    rawBackendRdf: backendRdf["mv2pnk8uy76l4.rdf"] || backendRdf["alqabasat.rdf"] || "",
    rawBackendTtl: backendRdf["alqabasat.ttl"] || "",
    summary: {
      ar: "كتاب فلسفي كلامي للميرداماد يناقش حدوث العالم وقدمه ومسألة الدهر والزمان والمصادر الوجودية وفق الحكمة المتعالية والمشائية. أوله: 'الحمد لله الواحد الاحد الصمد المصمود...' وآخره: 'ولا تخلنا اللهم مع ذلك من عواطف رأفتك...'. النسخة مجدولة ومذهبة وغلافها جلد أحمر مرتبة بنظام التعقيبات.",
      en: "Philosophical and theological masterpiece by Mir Damad discussing the origination and eternity of the cosmos, time and eternal duration (Dahr). Single illuminated manuscript codex held at Majlis Library (4662), bound in red leather."
    }
  },
  {
    id: "ALQ-MSS-006",
    slug: "nahj-al-balagha",
    title: {
      ar: "مخطوط نهج البلاغة — الشريف الرضي (1022 هـ)",
      en: "Nahj al-Balagha Manuscript — Al-Sharif al-Radi (1613 CE)"
    },
    category: "manuscripts",
    categoryLabel: {
      ar: "المخطوطات والنوادر",
      en: "Manuscripts & Rare Books"
    },
    period: {
      ar: "1022 هـ / 1613 م (العصر الصفوي)",
      en: "1022 AH / 1613 CE (Safavid Era)"
    },
    creator: {
      ar: "الشريف الرضي (ت 406 هـ) • الناسخ: شمس الدين علي الشيرازي الهراس",
      en: "Al-Sharif al-Radi (d. 406 AH) • Scribe: Shams al-Din Ali al-Shirazi al-Harras",
      uri: "https://alqami.net/agent/al-sharif-al-radi"
    },
    institution: {
      ar: "مكتبة العتبة الرضوية المقدسة (1861) • مستودع علقمي الرقمي",
      en: "Central Library of Astan Quds Razavi (1861) • Alqami Repository"
    },
    edition: {
      ar: "نسخة نادرة مجدولة ومذهبة بالكامل أولها لوحة فنية بديعة",
      en: "Rare fully illuminated and gold-ruled codex with decorative incipit"
    },
    responsibilityStatement: {
      ar: "جمعه الشريف الرضي محمد بن الحسين الموسوي، نسخه شمس الدين علي الشيرازي الهراس.",
      en: "Compiled by Al-Sharif al-Radi, transcribed by Shams al-Din Ali al-Shirazi."
    },
    model: {
      glb: "./models/nahj_al_balagha.glb",
      poster: "./images/manuscript.jpg",
      scale: "1.0 1.0 1.0",
      cameraOrbit: "25deg 70deg 110%",
      fieldOfView: "32deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.12 0.05",
          normal: "0 0 1",
          title: { ar: "اللوحة الاستفتاحية المذهبة (أول النسخة)", en: "Illuminated Frontispiece" },
          text: { ar: "بسمله اما بعد حمد الله الذي جعل الحمد ثمناً لنعمائه ومعاذاً من بلائه ووسيلاً الى جنانه...", en: "Opening invocation and praise in elegant Naskh script." }
        },
        {
          position: "0.05 0.02 -0.05",
          normal: "0 1 0",
          title: { ar: "خاتمة الناسخ والتقييد (آخر النسخة)", en: "Colophon & Scribe Note" },
          text: { ar: "الينا بعد الشذوذ وما توفيقنا.. شمس الدين علي الشيرازي الهراس غفر له (سنة 1022 هـ).", en: "Scribe colophon dated 1022 AH." }
        }
      ]
    },
    physical: {
      dimensions: "ورق مجدول، مذهب، خط النسخ، عناوين بالمداد الأحمر (477 ورقة)",
      extent: "477 ورقة",
      material: { ar: "ورق مجدول، مذهب، حبر أسود، مداد أحمر، خط النسخ", en: "Illuminated gold-ruled paper, black ink, red ink, Naskh script" },
      condition: { ar: "نادرة جداً، مجدولة ومذهبة، عليها آثار رطوبة تاريخية مع حفظ كامل النصوص", en: "Extremely rare, illuminated, historic moisture marks with full text integrity" },
      binding: "الغلاف : تجليد إسلامي أصيل مزخرف ومحكم.",
      decoration: "النسخة مجدولة بالذهب، وأولها لوحة فنية مذهبة بديعة، وعناوين الفصول بالمداد الأحمر.",
      seals: "تحتوي على قيود تملكية وأختام مكتبة العتبة الرضوية المقدسة برقم 1861.",
      catchwords: "مرتبة بنظام التعقيبات لضمان تسلسل الأوراق."
    },
    production: {
      place: "مشهد المقدسة / إيران",
      placeUri: "https://alqami.net/resource/place/mashhad",
      scribe: "شمس الدين علي الشيرازي الهراس (1022 هـ)",
      scribeUri: "https://alqami.net/resource/agent/al-shirazi",
      date: "1022 هـ / 1613 م",
      series: "تراث أهل البيت (ع) والحديث النبوي الشريف ؛ نوادر المخطوطات الرضوية"
    },
    notes: {
      incipit: "بسمله اما بعد حمد الله الذي جعل الحمد ثمناً لنعمائه ومعاذاً من بلائه ووسيلاً الى جنانه وسبباً لزيادة احسانه والصلوة على رسوله..",
      explicit: "الينا بعد الشذوذ وما توفيقنا.. شمس الدين علي الشيرازي الهراس غفرله.",
      dhariahCitation: "الذريعة إلى تصانيف الشيعة، الجزء 24، نهج البلاغة وشروحه ومخطوطاته.",
      holdingNote: "مكتبة العتبة الرضوية المقدسة، مشهد، إيران، نسخة رقم 1861.",
      systemIdentifiers: ["MS-1861-NAHJ", "ART-006"]
    },
    adminMetadata: {
      adminUri: "https://alqami.net/admin/nahj_al_balagha",
      source: "مكتبة العتبة الرضوية المقدسة • مستودع علقمي",
      generator: "Alqami Linked Data Cataloging Engine v2.0",
      creationDate: "2026-10-13",
      descriptionConventions: "RDA / BIBFRAME 2.0",
      catalogingLanguage: "ara",
      resourceLanguage: "ara"
    },
    bibframe: {
      workUri: "https://alqami.net/work/nahj_al_balagha",
      expressionUri: "https://alqami.net/expression/nahj_al_balagha_1022",
      instanceUri: "https://alqami.net/instance/nahj_al_balagha",
      itemUri: "https://alqami.net/item/nahj_al_balagha_ms1861",
      classification: {
        lcc: "BP193.1.A2 A4 1613",
        ddc: "297.124"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026139", label: "مخطوطات إسلامية (Manuscripts)" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85068499", label: "أهل البيت (ع) والحديث النبوي (Ahl al-Bayt)" },
        { uri: "http://id.loc.gov/authorities/subjects/sh85068470", label: "خطب ومواعظ وبلاغة (Sermons & Islamic Eloquence)" }
      ]
    },
    backendRdfFile: "nahj_al_balagha.ttl",
    backendTtlFile: "nahj_al_balagha.ttl",
    rawBackendRdf: backendRdf["nahj_al_balagha.ttl"] || "",
    rawBackendTtl: backendRdf["nahj_al_balagha.ttl"] || "",
    summary: {
      ar: "نسخة مجدولة ومذهبة نادرة من كتاب نهج البلاغة للشريف الرضي بخط شمس الدين علي الشيرازي الهراس (1022 هـ / 1613 م)، أولها لوحة استفتاحية فنية بديعة، محفوظة في مكتبة العتبة الرضوية المقدسة برقم 1861 في 477 ورقة.",
      en: "Rare fully illuminated and gold-ruled manuscript of Nahj al-Balagha (Peak of Eloquence), compiled by al-Sharif al-Radi. Transcribed in Naskh script by Shams al-Din Ali al-Shirazi al-Harras in 1022 AH (1613 CE). 477 folios held at Astan Quds Razavi Library (MS 1861)."
    }
  },
  {
    id: "ALQ-HLM-004",
    slug: "old-islamic-helmet",
    title: {
      ar: "خوذة إسلامية قديمة (خوذة حربية)",
      en: "Old Islamic Helmet (Khula Khud)"
    },
    category: "islamic",
    categoryLabel: {
      ar: "التراث الإسلامي",
      en: "Islamic Heritage"
    },
    period: {
      ar: "القرون الوسطى الإسلامية",
      en: "Medieval Islamic Period"
    },
    creator: {
      ar: "صانع دروع إسلامي غير معروف",
      en: "Unknown Islamic Armorer",
      uri: "https://alqami.net/agent/armorer"
    },
    institution: {
      ar: "متحف الفن الإسلامي • المستودع الرقمي علقمي",
      en: "Museum of Islamic Art • Alqami Spatial Vault"
    },
    model: {
      glb: "./models/Old_Islamic_Helmet.glb",
      poster: "./images/praha_side2.jpg",
      scale: "0.75 0.75 0.75",
      cameraOrbit: "-30deg 70deg 110%",
      fieldOfView: "30deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.18 0.0",
          normal: "0 1 0",
          title: { ar: "السنان العلوي والنقوش", en: "Top Spike & Engravings" },
          text: { ar: "نقوش هندسية وكتابات لحماية الفارس في المعركة.", en: "Protective inscriptions and calligraphic panels." }
        }
      ]
    },
    physical: {
      dimensions: "حجم قياسي للرأس (34 × 22 سم)",
      material: { ar: "حديد مطروق، برونز، نقوش ذهبية أو فضية", en: "Forged Iron, Bronze, Gold/Silver inlay" },
      condition: { ar: "حالة ممتازة مصقولة", en: "Excellent preservation" }
    },
    bibframe: {
      workUri: "https://alqami.net/artifact/helmet/work",
      instanceUri: "https://alqami.net/artifact/helmet",
      itemUri: "https://alqami.net/item/HLM-313",
      classification: {
        lcc: "NK6608.5 .I85",
        ddc: "739.75"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026190", label: "Armor" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85060416", label: "Helmets -- Islamic countries" }
      ]
    },
    backendRdfFile: "Old_Islamic_Helmet.ttl",
    backendTtlFile: "Old_Islamic_Helmet.ttl",
    rawBackendRdf: backendRdf["Old_Islamic_Helmet.ttl"] || "",
    rawBackendTtl: backendRdf["Old_Islamic_Helmet.ttl"] || "",
    summary: {
      ar: "خوذة قتالية إسلامية تاريخية (خُوذة) مصممة لحماية الرأس. تتميز بنقوش وزخارف هندسية تعكس براعة صناعة الدروع في العصر الإسلامي القديم.",
      en: "Historic Islamic combat helmet designed for warrior head protection, featuring intricate engravings and calligraphic inlays."
    }
  },
  {
    id: "ALQ-TAB-005",
    slug: "old-babylonian-cuneiform-tablet",
    title: {
      ar: "لوح مسماري بابلي قديم (S264)",
      en: "Old Babylonian Cuneiform Tablet (S264)"
    },
    category: "iraq",
    categoryLabel: {
      ar: "تراث العراق القديم",
      en: "Ancient Iraq"
    },
    period: {
      ar: "العصر البابلي القديم (حوالي 1900-1600 ق.م)",
      en: "Old Babylonian Period (ca. 1900-1600 BCE)"
    },
    creator: {
      ar: "كاتب بابلي قديم",
      en: "Babylonian Scribe",
      uri: "https://alqami.net/agent/cuneiform-scribe"
    },
    institution: {
      ar: "المتحف العراقي، بغداد • المستودع الرقمي علقمي",
      en: "The Iraq Museum, Baghdad • Alqami Vault"
    },
    model: {
      glb: "./models/old-babylonian_cuneiform_tablet_s264.glb",
      poster: "./images/praha_side1.jpg",
      scale: "1.1 1.1 1.1",
      cameraOrbit: "10deg 75deg 105%",
      fieldOfView: "28deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.04 0.02",
          normal: "0 1 0",
          title: { ar: "السطور المسمارية", en: "Cuneiform Lines" },
          text: { ar: "نقوش مسمارية دقيقة بالقلم القصبي توثق سجلاً إدارياً قديماً.", en: "Fine wedge impressions made with reed stylus." }
        }
      ]
    },
    physical: {
      dimensions: "لوح طيني صغير (9.5 × 6.1 × 2.4 سم)",
      material: { ar: "طين مشوي", en: "Baked Clay" },
      condition: { ar: "واضح العلامات والنقوش", en: "Crisp cuneiform legibility" }
    },
    bibframe: {
      workUri: "https://alqami.net/artifact/cuneiform/work",
      instanceUri: "https://alqami.net/artifact/cuneiform",
      itemUri: "https://iraqimuseum.gov.iq/artifacts/s264",
      classification: {
        lcc: "PJ3721 .B33",
        ddc: "492.1"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026111", label: "Clay tablets" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85034789", label: "Cuneiform inscriptions, Akkadian" }
      ]
    },
    backendRdfFile: "old-babylonian_cuneiform_tablet_s264.rdf",
    backendTtlFile: "old-babylonian_cuneiform_tablet_s264.ttl",
    rawBackendRdf: backendRdf["old-babylonian_cuneiform_tablet_s264.rdf"] || "",
    rawBackendTtl: backendRdf["old-babylonian_cuneiform_tablet_s264.ttl"] || "",
    summary: {
      ar: "لوح مسماري أصيل من العصر البابلي القديم يوثق المعاملات الإدارية والاقتصادية في بلاد الرافدين بأقدم أبجدية مسمارية.",
      en: "Authentic Old Babylonian clay tablet inscribed with cuneiform script from ancient Mesopotamia."
    }
  },
  {
    id: "ALQ-BWL-006",
    slug: "saqakhane-sacred-bowl",
    title: {
      ar: "طاسة سقاخانة برونزية (وعاء الشرب)",
      en: "Saqakhane Drinking Bowl"
    },
    category: "ahlulbayt",
    categoryLabel: {
      ar: "تراث أهل البيت (ع)",
      en: "Ahl al-Bayt Heritage"
    },
    period: {
      ar: "القرن 18–19 م (العصر الصفوي / القاجاري)",
      en: "18th–19th Century CE"
    },
    creator: {
      ar: "نقاش وصانع نحاس إسلامي",
      en: "Islamic Metal Engraver",
      uri: "https://alqami.net/agent/coppersmith"
    },
    institution: {
      ar: "متحف العتبة العباسية المقدسة • كربلاء المقدسة",
      en: "Al-Abbas Holy Shrine Museum • Karbala"
    },
    model: {
      glb: "./models/saqakhane_bowl.glb",
      poster: "./images/praha_top.jpg",
      scale: "0.9 0.9 0.9",
      cameraOrbit: "45deg 55deg 105%",
      fieldOfView: "30deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.08 0.0",
          normal: "0 1 0",
          title: { ar: "شريط الآيات والأدعية", en: "Sacred Inscription Band" },
          text: { ar: "حفر دقيق لآيات الشفاء ورمزية السقاية في كربلاء.", en: "Fine engraving with Quranic verses and Karbala water remembrance." }
        }
      ]
    },
    physical: {
      dimensions: "18.5 سم (قطر) × 6.2 سم (ارتفاع)",
      material: { ar: "برونز مصبوب ومحفور يدويًا", en: "Cast Bronze" },
      condition: { ar: "سليمة مع بتينا تراثية", en: "Historic patina" }
    },
    bibframe: {
      workUri: "https://alqami.net/museum/saqakhane_bowl/work",
      instanceUri: "https://alqami.net/museum/saqakhane_bowl",
      itemUri: "https://alkafeel.net/museum/item/saqakhane-bowl-313",
      classification: {
        lcc: "NK7908.9 .S27",
        ddc: "739.512"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026078", label: "Bowls (Tableware)" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85068468", label: "Islamic art" }
      ]
    },
    backendRdfFile: "saqakhane_bowl.ttl",
    backendTtlFile: "saqakhane_bowl.ttl",
    rawBackendRdf: backendRdf["saqakhane_bowl.ttl"] || "",
    rawBackendTtl: backendRdf["saqakhane_bowl.ttl"] || "",
    summary: {
      ar: "وعاء برونزي مقدس كان يوضع في أسبلة المياه (السقاخانة) تيمناً بذكرى ساقي عطاشى كربلاء أبي الفضل العباس (ع).",
      en: "Traditional Islamic votive water vessel placed in Karbala water shrines in homage to Abu al-Fadl al-Abbas (a.s.)."
    }
  },
  {
    id: "ALQ-MHR-007",
    slug: "prayer-niche-mihrab",
    title: {
      ar: "محراب الصلاة الإسلامي المقرنص",
      en: "Islamic Prayer Niche (Mihrab)"
    },
    category: "islamic",
    categoryLabel: {
      ar: "التراث الإسلامي",
      en: "Islamic Heritage"
    },
    period: {
      ar: "القرن الثالث عشر الميلادي",
      en: "13th Century CE"
    },
    creator: {
      ar: "صناع الخزف الكاشاني",
      en: "Kashan Ceramic Masters",
      uri: "https://alqami.net/agent/kashani-masters"
    },
    institution: {
      ar: "المتحف الوطني العراقي • المستودع الرقمي علقمي",
      en: "National Museum of Iraq • Alqami Vault"
    },
    model: {
      glb: "./models/prayer_niche_mihrab.glb",
      poster: "./images/kufic.jpg",
      scale: "0.45 0.45 0.45",
      cameraOrbit: "0deg 80deg 110%",
      fieldOfView: "35deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.45 0.1",
          normal: "0 0 1",
          title: { ar: "المقرنصات الخزفية", en: "Muqarnas Corbeling" },
          text: { ar: "تكوين هندسي ثلاثي الأبعاد يعكس انتقال الفراغ من القوس إلى الحنية.", en: "Geometric 3D muqarnas arch transition." }
        }
      ]
    },
    physical: {
      dimensions: "قطعة معمارية كبيرة (240 × 160 سم)",
      material: { ar: "خزف مزجج (كاشاني)، جص", en: "Glazed Ceramic (Kashani), Stucco" },
      condition: { ar: "محفوظ ومجمع بعناية", en: "Museum assemblage" }
    },
    bibframe: {
      workUri: "https://alqami.net/artifact/mihrab/work",
      instanceUri: "https://alqami.net/artifact/mihrab",
      itemUri: "https://alqami.net/item/MHR-ILK-1300",
      classification: {
        lcc: "NA4670 .M54",
        ddc: "726.2"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026066", label: "Architectural elements" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85085189", label: "Mihrabs -- History" }
      ]
    },
    backendRdfFile: "prayer_niche_mihrab.rdf",
    backendTtlFile: "prayer_niche_mihrab.ttl",
    rawBackendRdf: backendRdf["prayer_niche_mihrab.rdf"] || "",
    rawBackendTtl: backendRdf["prayer_niche_mihrab.ttl"] || "",
    summary: {
      ar: "محراب صلاة إسلامي أثري من الخزف المزجج الملون، يحدد اتجاه القبلة نحو مكة المكرمة بمقرنصات ونقوش كوفية.",
      en: "Architectural luster-glazed ceramic prayer niche directing worship toward Mecca, demonstrating intricate geometry."
    }
  },
  {
    id: "ALQ-STL-008",
    slug: "stela-of-hammurabi",
    title: {
      ar: "مسلة شريعة حمورابي البابلية",
      en: "Stela of Hammurabi"
    },
    category: "iraq",
    categoryLabel: {
      ar: "تراث العراق القديم",
      en: "Ancient Iraq"
    },
    period: {
      ar: "حوالي 1750 ق.م",
      en: "ca. 1750 BCE"
    },
    creator: {
      ar: "الملك حمورابي ونحاتو البلاط البابلي",
      en: "King Hammurabi & Royal Sculptors",
      uri: "https://id.loc.gov/authorities/names/n50019979"
    },
    institution: {
      ar: "متحف اللوفر (المسلة الأصلية) • نموذج المستودع الرقمي علقمي",
      en: "Louvre Museum (Original) • Alqami Spatial Vault"
    },
    model: {
      glb: "./models/stela_of_hammurabi_replica.glb",
      poster: "./images/praha_back.jpg",
      scale: "0.55 0.55 0.55",
      cameraOrbit: "0deg 85deg 110%",
      fieldOfView: "30deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.85 0.08",
          normal: "0 0 1",
          title: { ar: "مشهد استلام الشريعة", en: "Investiture Scene" },
          text: { ar: "حمورابي يتسلم خاتم وقضيب العدالة من إله الشمس شمش.", en: "Hammurabi receiving laws from Shamash." }
        }
      ]
    },
    physical: {
      dimensions: "طول 2.25 متر",
      material: { ar: "حجر الديوريت الأسود", en: "Black Diorite" },
      condition: { ar: "منحوتة بالكامل مع نصوص أكدية", en: "Pristine basalt preservation" }
    },
    bibframe: {
      workUri: "https://alqami.net/artifact/stela/work",
      instanceUri: "https://alqami.net/artifact/stela",
      itemUri: "https://louvre.fr/en/explore/the-palace/code-of-hammurabi",
      classification: {
        lcc: "KL2212 .A313",
        ddc: "340.54"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026131", label: "Legal instruments" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85075775", label: "Law, Ancient" }
      ]
    },
    backendRdfFile: "stela_of_hammurabi_replica.rdf",
    backendTtlFile: "stela_of_hammurabi_replica.ttl",
    rawBackendRdf: backendRdf["stela_of_hammurabi_replica.rdf"] || "",
    rawBackendTtl: backendRdf["stela_of_hammurabi_replica.ttl"] || "",
    summary: {
      ar: "مسلة شريعة حمورابي البابلية الشهيرة المحفورة في حجر الديوريت الأسود والتي تضم 282 مادة قانونية تنظم العدالة.",
      en: "The historic legal monument of Mesopotamia, featuring the 282 laws of King Hammurabi engraved in Akkadian cuneiform."
    }
  },
  {
    id: "ALQ-BWL-009",
    slug: "ancient-ceramic-bowl",
    title: {
      ar: "وعاء أثري قديم",
      en: "Ancient Bowl"
    },
    category: "museum",
    categoryLabel: {
      ar: "المواد والقطع المتحفية",
      en: "Museum Objects"
    },
    period: {
      ar: "عصر قديم غير محدد",
      en: "Ancient Era"
    },
    creator: {
      ar: "صانع فخار أثري",
      en: "Ancient Potter",
      uri: "https://alqami.net/agent/potter"
    },
    institution: {
      ar: "المتحف العراقي • مستودع علقمي",
      en: "The Iraq Museum • Alqami Vault"
    },
    model: {
      glb: "./models/bowl.glb",
      poster: "./images/praha_top.jpg",
      scale: "1.0 1.0 1.0",
      cameraOrbit: "30deg 65deg 105%",
      fieldOfView: "30deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.05 0.0",
          normal: "0 1 0",
          title: { ar: "شكل الوعاء", en: "Vessel Form" },
          text: { ar: "وعاء فخاري أثري متوسط الحجم.", en: "Medium sized ancient ceramic vessel." }
        }
      ]
    },
    physical: {
      dimensions: "متوسط الحجم",
      material: { ar: "فخار / خزف", en: "Pottery / Ceramic" },
      condition: { ar: "سليم", en: "Intact" }
    },
    bibframe: {
      workUri: "https://alqami.net/artifact/bowl/work",
      instanceUri: "https://alqami.net/artifact/bowl",
      itemUri: "https://alqami.net/item/BWL-001",
      classification: {
        lcc: "NK4143 .B69",
        ddc: "738.3"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026078", label: "Bowls (Tableware)" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85105824", label: "Pottery, Ancient" }
      ]
    },
    backendRdfFile: "bowl.rdf",
    backendTtlFile: "bowl.ttl",
    rawBackendRdf: backendRdf["bowl.rdf"] || "",
    rawBackendTtl: backendRdf["bowl.ttl"] || "",
    summary: {
      ar: "وعاء فخاري أثري قديم يعكس بساطة وفنون صناعة الخزف والأواني الفخارية في الشرق الأدنى القديم.",
      en: "Ancient pottery bowl reflecting traditional ceramic craft of the ancient Near East."
    }
  },
  {
    id: "ALQ-MSH-010",
    slug: "alqami-3d-heritage-sculpture",
    title: {
      ar: "مجسم تحفة علقمي التراثي ثلاثي الأبعاد",
      en: "Alqami 3D Heritage Artifact"
    },
    category: "museum",
    categoryLabel: {
      ar: "المواد والقطع المتحفية",
      en: "Museum Objects"
    },
    period: {
      ar: "مقتنيات علقمي المعاصرة",
      en: "Alqami Contemporary Collection"
    },
    creator: {
      ar: "فريق علقمي للرقمنة التراثية",
      en: "Alqami Digitization Team",
      uri: "https://alqami.net/agent/team"
    },
    institution: {
      ar: "مؤسسة علقمي للتراث المعرفي",
      en: "Alqami Heritage Foundation"
    },
    model: {
      glb: "./models/meshy-model.glb",
      poster: "./images/quran.jpg",
      scale: "0.8 0.8 0.8",
      cameraOrbit: "0deg 75deg 105%",
      fieldOfView: "30deg",
      hasAr: true,
      annotations: [
        {
          position: "0.0 0.1 0.0",
          normal: "0 1 0",
          title: { ar: "المسح الضوئي ثلاثي الأبعاد", en: "High-Res 3D Mesh" },
          text: { ar: "تمت رقمنة هذا النموذج بتقنيات المسح التصويري المتقدمة.", en: "Digitized using advanced heritage photogrammetry." }
        }
      ]
    },
    physical: {
      dimensions: "أبعاد متعددة",
      material: { ar: "خزف، مادة مركبة", en: "Ceramic / Composite" },
      condition: { ar: "ممتاز", en: "Mint" }
    },
    bibframe: {
      workUri: "https://alqami.net/museum/meshy-model/work",
      instanceUri: "https://alqami.net/museum/meshy-model",
      itemUri: "https://alqami.net/item/MESHY-001",
      classification: {
        lcc: "NK4600 .A47",
        ddc: "730.9"
      },
      genreForm: [
        { uri: "http://id.loc.gov/authorities/genreForms/gf2014026168", label: "Sculpture" }
      ],
      subjects: [
        { uri: "http://id.loc.gov/authorities/subjects/sh85038006", label: "Digital preservation" }
      ]
    },
    backendRdfFile: "meshy-model.ttl",
    backendTtlFile: "meshy-model.ttl",
    rawBackendRdf: backendRdf["meshy-model.ttl"] || "",
    rawBackendTtl: backendRdf["meshy-model.ttl"] || "",
    summary: {
      ar: "مجسم تحفة علقمي الرقمية عالية الدقة، تمثل التكامل بين تقنيات المسح ثلاثي الأبعاد وفهرسة البيانات المترابطة BIBFRAME 2.0.",
      en: "High-definition 3D heritage model combining photogrammetric scanning and linked data cataloging."
    }
  }
];

export const CATEGORIES = [
  { id: "all", label: { ar: "الكل", en: "All" }, icon: "Compass" },
  { id: "manuscripts", label: { ar: "المخطوطات", en: "Manuscripts" }, icon: "BookOpen" },
  { id: "iraq", label: { ar: "تراث العراق", en: "Ancient Iraq" }, icon: "Landmark" },
  { id: "ahlulbayt", label: { ar: "أهل البيت (ع)", en: "Ahl al-Bayt" }, icon: "Shield" },
  { id: "islamic", label: { ar: "التراث الإسلامي", en: "Islamic Heritage" }, icon: "Sparkles" },
  { id: "museum", label: { ar: "المواد المتحفية", en: "Museum Objects" }, icon: "Box" }
];
