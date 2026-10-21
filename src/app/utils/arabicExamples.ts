/**
 * Arabic Example BIBFRAME Records
 */

export const arabicExampleRecord = {
  id: 'example-arabic-001',
  type: 'Monograph',
  work: {
    title: 'ديوان الجواهري',
    subtitle: 'المجموعة الشعرية الكاملة',
    language: 'ara',
    type: 'Text',
    contributors: [
      {
        name: 'الجواهري، محمد مهدي، 1899-1997',
        role: 'author',
        afiqaId: '24',
        isni: '0000000122843672',
        qid: 'Q4121866'
      }
    ],
    subjects: [
      {
        label: 'الشعر العربي',
        value: 'Arabic poetry',
        source: 'LCSH'
      },
      {
        label: 'الأدب العراقي',
        value: 'Iraqi literature',
        source: 'LCSH'
      },
      {
        label: 'القرن العشرين',
        value: '20th century',
        source: 'LCSH'
      }
    ],
    classification: {
      lcc: 'PJ7840.A85',
      ddc: '892.716'
    },
    summary: 'المجموعة الشعرية الكاملة لشاعر العرب الأكبر محمد مهدي الجواهري، تضم قصائده التي كتبها على مدى سبعة عقود من الإبداع الشعري. يعتبر الجواهري من أبرز شعراء العصر الحديث وأحد رواد الشعر العربي المعاصر.',
    notes: [
      'شاعر العرب الأكبر',
      'ولد في النجف الأشرف وتوفي في دمشق',
      'حاصل على العديد من الجوائز والأوسمة الأدبية'
    ]
  },
  instance: {
    title: 'ديوان الجواهري',
    isbn: '978-9933-503-12-4',
    publisher: 'دار العودة',
    publicationDate: '2012',
    placeOfPublication: 'بيروت، لبنان',
    edition: 'الطبعة الثالثة',
    extent: '7 مجلدات (2400 صفحة)',
    format: 'كتاب مطبوع',
    dimensions: '24 سم',
    notes: [
      'يتضمن فهرساً للقصائد مرتباً أبجدياً',
      'مع مقدمة للناقد الأدبي الدكتور إحسان عباس',
      'طباعة فاخرة على ورق صقيل'
    ]
  },
  holdings: [
    {
      location: 'مكتبة ودار مخطوطات العتبة العباسية المقدسة',
      callNumber: 'PJ7840.A85 2012',
      copies: 3
    },
    {
      location: 'مكتبة الروضة الحيدرية - النجف',
      callNumber: 'PJ7840.A85 2012',
      copies: 2
    },
    {
      location: 'البوابة العراقية للمعرفة',
      callNumber: 'DIGITAL',
      format: 'نسخة رقمية'
    }
  ],
  metadata: {
    cataloger: 'أحمد المكتبي',
    catalogingDate: '2024-01-15',
    lastModified: '2024-02-12',
    status: 'completed',
    language: 'ar'
  }
};

export const arabicExampleRecord2 = {
  id: 'example-arabic-002',
  type: 'Monograph',
  work: {
    title: 'المجالس الحسينية لخادم العترة النبوية',
    language: 'ara',
    type: 'Text',
    contributors: [
      {
        name: 'الوائلي، احمد، 1347-1423 هجري',
        role: 'author',
        afiqaId: '1421',
        isni: '0000000061605813',
        qid: 'Q4165199'
      }
    ],
    subjects: [
      {
        label: 'الخطب الدينية الإسلامية',
        value: 'Islamic sermons',
        source: 'LCSH'
      },
      {
        label: 'التشيع',
        value: 'Shiism',
        source: 'LCSH'
      },
      {
        label: 'الحسين بن علي',
        value: 'Husayn ibn Ali',
        source: 'LCSH'
      }
    ],
    classification: {
      ddc: '297.4'
    },
    summary: 'مجموعة من المجالس والخطب الحسينية للشيخ الدكتور أحمد الوائلي، أحد أبرز الخطباء الشيعة في العصر الحديث. تتناول المجالس سيرة الإمام الحسين وأهل البيت عليهم السلام.'
  },
  instance: {
    title: 'المجالس الحسينية لخادم العترة النبوية',
    publisher: 'دار الكفيل للطباعة والنشر',
    publicationDate: '2008',
    placeOfPublication: 'كربلاء المقدسة، العراق',
    edition: 'الطبعة الأولى',
    extent: '520 صفحة',
    format: 'كتاب مطبوع',
    dimensions: '24 سم'
  },
  holdings: [
    {
      location: 'مكتبة ودار مخطوطات العتبة العباسية المقدسة',
      copies: 5
    },
    {
      location: 'البوابة العراقية للمعرفة',
      format: 'نسخة رقمية'
    }
  ],
  metadata: {
    cataloger: 'فاطمة الكربلائي',
    catalogingDate: '2024-01-20',
    status: 'completed',
    language: 'ar'
  }
};

export const arabicExampleRecord3 = {
  id: 'example-arabic-003',
  type: 'Monograph',
  work: {
    title: 'معاني النحو',
    language: 'ara',
    type: 'Text',
    contributors: [
      {
        name: 'السامرائي، فاضل صالح، 1933-',
        role: 'author',
        afiqaId: '2031',
        isni: '0000000123210623',
        qid: 'Q6823033'
      }
    ],
    subjects: [
      {
        label: 'اللغة العربية - نحو',
        value: 'Arabic language - Grammar',
        source: 'LCSH'
      },
      {
        label: 'البلاغة العربية',
        value: 'Arabic rhetoric',
        source: 'LCSH'
      }
    ],
    classification: {
      ddc: '492.75'
    },
    summary: 'كتاب أكاديمي متخصص في النحو العربي للدكتور فاضل السامرائي، يتناول المعاني النحوية والدلالات البلاغية في اللغة العربية.'
  },
  instance: {
    title: 'معاني النحو',
    publisher: 'دار الفكر للطباعة والنشر',
    publicationDate: '2000',
    placeOfPublication: 'عمّان، الأردن',
    edition: 'الطبعة الأولى',
    extent: '4 أجزاء',
    format: 'كتاب مطبوع'
  },
  holdings: [
    {
      location: 'المكتبة المركزية - الجامعة المستنصرية',
      copies: 3
    },
    {
      location: 'المكتبة المركزية - جامعة كركوك',
      copies: 2
    },
    {
      location: 'البوابة العراقية للمعرفة',
      format: 'نسخة رقمية'
    }
  ],
  metadata: {
    cataloger: 'محمد الأكاديمي',
    catalogingDate: '2024-02-01',
    status: 'completed',
    language: 'ar'
  }
};

export const arabicExampleRecord4 = {
  id: 'example-arabic-004',
  type: 'Monograph',
  work: {
    title: 'ديوان ابي الطيب المتنبي',
    subtitle: 'بشرح العكبري',
    language: 'ara',
    type: 'Text',
    contributors: [
      {
        name: 'ابو الطيب المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري',
        role: 'author',
        afiqaId: '15',
        isni: '0000000122424312',
        qid: 'Q284542',
        lccn: 'PJ7750.M8'
      }
    ],
    subjects: [
      {
        label: 'الشعر العربي - العصر العباسي',
        value: 'Arabic poetry - Abbasid period',
        source: 'LCSH'
      },
      {
        label: 'الشعر الكلاسيكي',
        value: 'Classical poetry',
        source: 'LCSH'
      }
    ],
    classification: {
      lcc: 'PJ7750.M8',
      ddc: '892.711'
    },
    summary: 'ديوان شاعر العرب أبي الطيب المتنبي، أعظم شعراء العصر العباسي. يحتوي على قصائده الخالدة في المدح والحكمة والفخر. يعتبر المتنبي من أبرز شعراء العربية عبر التاريخ.'
  },
  instance: {
    title: 'ديوان ابي الطيب المتنبي',
    publisher: 'دار المعرفة',
    publicationDate: '2009',
    placeOfPublication: 'بيروت، لبنان',
    edition: 'الطبعة الثانية',
    extent: '456 صفحة',
    format: 'كتاب مطبوع',
    dimensions: '24 سم'
  },
  holdings: [
    {
      location: 'المكتبة المركزية - الجامعة المستنصرية',
      callNumber: 'PJ7750.M8 2009',
      copies: 5
    },
    {
      location: 'مكتبة ودار مخطوطات العتبة العباسية المقدسة',
      callNumber: 'PJ7750.M8 2009',
      copies: 3
    },
    {
      location: 'مكتبة كلية الآداب - جامعة بغداد',
      callNumber: 'PJ7750.M8 2009',
      copies: 4
    }
  ],
  metadata: {
    cataloger: 'سارة الشاعر',
    catalogingDate: '2024-02-05',
    status: 'completed',
    language: 'ar'
  }
};
