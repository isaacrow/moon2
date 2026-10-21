/**
 * AFIQA (Arabic Federated Identification and Qualification of Authorities) Service
 * Linked Data implementation following W3C standards
 */

export interface AfiqaName {
  '@id': string;
  '@type': 'skos:Concept';
  'skos:prefLabel'?: string;
  'skos:altLabel'?: string;
  label: string;
  type: 'authorized' | 'variant';
  language?: string;
}

export interface AfiqaWork {
  '@id': string;
  '@type': 'bf:Work';
  'bf:title': string;
  title: string;
  holdings: string[];
}

export interface AfiqaSource {
  '@type': 'bf:Source';
  citation: string;
  page?: string;
  url?: string;
}

export interface AfiqaRecord {
  '@context': {
    bf: 'http://id.loc.gov/ontologies/bibframe/';
    schema: 'http://schema.org/';
    skos: 'http://www.w3.org/2004/02/skos/core#';
    afiqa: 'https://afiqa.net/authority/';
    isni: 'https://isni.org/isni/';
    wd: 'http://www.wikidata.org/entity/';
    lccn: 'http://id.loc.gov/authorities/names/';
  };
  '@id': string;  // Full URI like https://afiqa.net/authority/24
  '@type': 'bf:Person';
  
  // Local identifiers
  id: string;  // Internal ID
  afiqaId: string;  // AFIQA numeric ID
  
  // External linked identifiers
  isni?: string;  // ISNI identifier
  qid?: string;  // Wikidata QID
  lccn?: string;  // Library of Congress Control Number
  
  // Linked data URIs
  'owl:sameAs'?: string[];  // Links to same entity in other systems
  
  // Personal Information
  personalName: string;
  'schema:name': string;
  'schema:birthDate'?: string;
  'schema:deathDate'?: string;
  'schema:birthPlace'?: string;
  'schema:deathPlace'?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  burialPlace?: string;
  gender?: string;
  residence?: string;
  
  // Professional Information
  fieldOfActivity?: string[];
  'schema:occupation'?: string[];
  occupation?: string[];
  language?: string[];
  
  // Names (linked data)
  names: AfiqaName[];
  
  // Works (linked data)
  works?: AfiqaWork[];
  
  // Sources
  sources?: AfiqaSource[];
  
  // Additional metadata
  imageUrl?: string;
  'schema:image'?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

/**
 * AFIQA Authority Service - Linked Data Implementation
 */
class AfiqaService {
  private localRecords: Map<string, AfiqaRecord> = new Map();
  private uriIndex: Map<string, string> = new Map(); // URI -> internal ID mapping

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Initialize with the 4 Arabic scholars as linked data
   */
  private initializeSampleData() {
    const sampleRecords: AfiqaRecord[] = [
      // الجواهري، محمد مهدي
      {
        '@context': {
          bf: 'http://id.loc.gov/ontologies/bibframe/',
          schema: 'http://schema.org/',
          skos: 'http://www.w3.org/2004/02/skos/core#',
          afiqa: 'https://afiqa.net/authority/',
          isni: 'https://isni.org/isni/',
          wd: 'http://www.wikidata.org/entity/',
          lccn: 'http://id.loc.gov/authorities/names/',
        },
        '@id': 'https://afiqa.net/authority/24',
        '@type': 'bf:Person',
        'owl:sameAs': [
          'https://isni.org/isni/0000000122843672',
          'http://www.wikidata.org/entity/Q4121866',
          'http://id.loc.gov/authorities/names/PJ7840.A85'
        ],
        id: 'afiqa-24',
        afiqaId: '24',
        isni: '0000000122843672',
        qid: 'Q4121866',
        lccn: 'PJ7840.A85',
        personalName: 'الجواهري، محمد مهدي، 1899-1997',
        'schema:name': 'الجواهري، محمد مهدي، 1899-1997',
        'schema:birthDate': '1899-07-26',
        'schema:deathDate': '1997-07-27',
        'schema:birthPlace': 'النجف (العراق)',
        birthDate: '1899-07-26',
        deathDate: '1997-07-27',
        birthPlace: 'النجف (العراق)',
        deathPlace: 'دمشق (سوريا)',
        gender: 'ذكر',
        fieldOfActivity: ['الشعر العربي'],
        'schema:occupation': ['الشعراء'],
        occupation: ['الشعراء'],
        language: ['العربية'],
        names: [
          { 
            '@id': 'https://afiqa.net/authority/24#name-1',
            '@type': 'skos:Concept',
            'skos:prefLabel': 'الجواهري، محمد مهدي، 1899-1997',
            label: 'الجواهري، محمد مهدي، 1899-1997', 
            type: 'authorized',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/24#name-2',
            '@type': 'skos:Concept',
            'skos:altLabel': 'جواهري، محمد مهدي، 1899-1997',
            label: 'جواهري، محمد مهدي، 1899-1997', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/24#name-3',
            '@type': 'skos:Concept',
            'skos:altLabel': 'الجواهري، محمد بن عبد الحسين مهدي، 1899-1997',
            label: 'الجواهري، محمد بن عبد الحسين مهدي، 1899-1997', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/24#name-4',
            '@type': 'skos:Concept',
            'skos:altLabel': 'Jawāhirī, Muḥammad Mahdi, 1899-1997',
            label: 'Jawāhirī, Muḥammad Mahdi, 1899-1997', 
            type: 'variant',
            language: 'en'
          },
          { 
            '@id': 'https://afiqa.net/authority/24#name-5',
            '@type': 'skos:Concept',
            'skos:altLabel': 'محمد مهدي الجواهري، 1899-1997',
            label: 'محمد مهدي الجواهري، 1899-1997', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/24#name-6',
            '@type': 'skos:Concept',
            'skos:altLabel': 'محمد بن عبد الحسين مهدي الجواهري، 1899-1997',
            label: 'محمد بن عبد الحسين مهدي الجواهري، 1899-1997', 
            type: 'variant',
            language: 'ar'
          }
        ],
        works: [
          { 
            '@id': 'https://afiqa.net/work/24-1',
            '@type': 'bf:Work',
            'bf:title': 'ديوان الجواهري',
            title: 'ديوان الجواهري', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة', 'البوابة العراقية للمعرفة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/24-2',
            '@type': 'bf:Work',
            'bf:title': 'عينية الجواهري',
            title: 'عينية الجواهري', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة', 'البوابة العراقية للمعرفة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/24-3',
            '@type': 'bf:Work',
            'bf:title': 'بريد الغربة',
            title: 'بريد الغربة', 
            holdings: ['المكتبة المركزية - الجامعة المستنصرية', 'البوابة العراقية للمعرفة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/24-4',
            '@type': 'bf:Work',
            'bf:title': 'ذكرياتي',
            title: 'ذكرياتي', 
            holdings: ['البوابة العراقية للمعرفة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/24-5',
            '@type': 'bf:Work',
            'bf:title': 'الاعمال الشعرية الكاملة',
            title: 'الاعمال الشعرية الكاملة', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة'] 
          }
        ],
        sources: [
          { 
            '@type': 'bf:Source',
            citation: 'الجواهري : قصائد.. وتاريخ.. ومواقف، 2012', 
            page: 'صفحة العنوان (محمد مهدي الجواهري)' 
          },
          { 
            '@type': 'bf:Source',
            citation: 'ويكيبيديا، اخر مراجعة 16 تموز 2020', 
            url: 'https://ar.wikipedia.org/wiki/محمد_مهدي_الجواهري' 
          }
        ],
        createdAt: new Date()
      },
      
      // الوائلي، احمد
      {
        '@context': {
          bf: 'http://id.loc.gov/ontologies/bibframe/',
          schema: 'http://schema.org/',
          skos: 'http://www.w3.org/2004/02/skos/core#',
          afiqa: 'https://afiqa.net/authority/',
          isni: 'https://isni.org/isni/',
          wd: 'http://www.wikidata.org/entity/',
          lccn: 'http://id.loc.gov/authorities/names/',
        },
        '@id': 'https://afiqa.net/authority/1421',
        '@type': 'bf:Person',
        'owl:sameAs': [
          'https://isni.org/isni/0000000061605813',
          'http://www.wikidata.org/entity/Q4165199'
        ],
        id: 'afiqa-1421',
        afiqaId: '1421',
        isni: '0000000061605813',
        qid: 'Q4165199',
        personalName: 'الوائلي، احمد، 1347-1423 هجري',
        'schema:name': 'الوائلي، احمد، 1347-1423 هجري',
        'schema:birthDate': '1928',
        'schema:deathDate': '2003',
        'schema:birthPlace': 'النجف (العراق)',
        birthDate: '1928',
        deathDate: '2003',
        birthPlace: 'النجف (العراق)',
        deathPlace: 'الكاظمية (العراق)',
        burialPlace: 'النجف (العراق)',
        gender: 'ذكر',
        fieldOfActivity: ['الاسلام', 'الخطب الدينية الاسلامية', 'الشعر العربي'],
        'schema:occupation': ['رجال الدين الشيعة', 'الخطباء الشيعة', 'الشعراء'],
        occupation: ['رجال الدين الشيعة', 'الخطباء الشيعة', 'الشعراء'],
        language: ['العربية'],
        names: [
          { 
            '@id': 'https://afiqa.net/authority/1421#name-1',
            '@type': 'skos:Concept',
            'skos:prefLabel': 'الوائلي، احمد، 1347-1423 هجري',
            label: 'الوائلي، احمد، 1347-1423 هجري', 
            type: 'authorized',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/1421#name-2',
            '@type': 'skos:Concept',
            'skos:altLabel': 'وائلي، احمد، 1347-1423 هجري',
            label: 'وائلي، احمد، 1347-1423 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/1421#name-3',
            '@type': 'skos:Concept',
            'skos:altLabel': 'الوائلي، احمد حسون سعيد، 1347-1423 هجري',
            label: 'الوائلي، احمد حسون سعيد، 1347-1423 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/1421#name-4',
            '@type': 'skos:Concept',
            'skos:altLabel': 'الليثي، احمد، 1347-1423 هجري',
            label: 'الليثي، احمد، 1347-1423 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/1421#name-5',
            '@type': 'skos:Concept',
            'skos:altLabel': 'الكناني، احمد، 1347-1423 هجري',
            label: 'الكناني، احمد، 1347-1423 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/1421#name-6',
            '@type': 'skos:Concept',
            'skos:altLabel': 'Wāʼilī, Aḥmad, 1928-2003',
            label: 'Wāʼilī, Aḥmad, 1928-2003', 
            type: 'variant',
            language: 'en'
          },
          { 
            '@id': 'https://afiqa.net/authority/1421#name-7',
            '@type': 'skos:Concept',
            'skos:altLabel': 'احمد الوائلي، 1347-1423 هجري',
            label: 'احمد الوائلي، 1347-1423 هجري', 
            type: 'variant',
            language: 'ar'
          }
        ],
        works: [
          { 
            '@id': 'https://afiqa.net/work/1421-1',
            '@type': 'bf:Work',
            'bf:title': 'تجاربي مع المنبر',
            title: 'تجاربي مع المنبر', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/1421-2',
            '@type': 'bf:Work',
            'bf:title': 'ديوان الوائلي',
            title: 'ديوان الوائلي', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/1421-3',
            '@type': 'bf:Work',
            'bf:title': 'روائع محاضرات الوائلي',
            title: 'روائع محاضرات الوائلي', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/1421-4',
            '@type': 'bf:Work',
            'bf:title': 'المجالس الحسينية لخادم العترة النبوية',
            title: 'المجالس الحسينية لخادم العترة النبوية', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة'] 
          }
        ],
        sources: [
          { 
            '@type': 'bf:Source',
            citation: 'المجالس الحسينية لخادم العترة النبوية، الطبعة الاولى، 2008', 
            page: 'صفحة العنوان (الشيخ الدكتور احمد الوائلي)' 
          },
          { 
            '@type': 'bf:Source',
            citation: 'ويكي شيعة، اخر مراجعة 28 تشرين الثاني 2025', 
            url: 'https://ar.wikishia.net/view/أحمد_الوائلي' 
          }
        ],
        createdAt: new Date()
      },
      
      // السامرائي، فاضل صالح
      {
        '@context': {
          bf: 'http://id.loc.gov/ontologies/bibframe/',
          schema: 'http://schema.org/',
          skos: 'http://www.w3.org/2004/02/skos/core#',
          afiqa: 'https://afiqa.net/authority/',
          isni: 'https://isni.org/isni/',
          wd: 'http://www.wikidata.org/entity/',
          lccn: 'http://id.loc.gov/authorities/names/',
        },
        '@id': 'https://afiqa.net/authority/2031',
        '@type': 'bf:Person',
        'owl:sameAs': [
          'https://isni.org/isni/0000000123210623',
          'http://www.wikidata.org/entity/Q6823033'
        ],
        id: 'afiqa-2031',
        afiqaId: '2031',
        isni: '0000000123210623',
        qid: 'Q6823033',
        personalName: 'السامرائي، فاضل صالح، 1933-',
        'schema:name': 'السامرائي، فاضل صالح، 1933-',
        'schema:birthDate': '1933',
        'schema:birthPlace': 'سامراء (صلاح الدين، العراق)',
        birthDate: '1933',
        birthPlace: 'سامراء (صلاح الدين، العراق)',
        residence: 'الشارقة (الامارات العربية المتحدة)',
        gender: 'ذكر',
        fieldOfActivity: ['اللغة العربية'],
        'schema:occupation': ['الاكاديميون', 'اللغويون'],
        occupation: ['الاكاديميون', 'اللغويون'],
        language: ['العربية'],
        names: [
          { 
            '@id': 'https://afiqa.net/authority/2031#name-1',
            '@type': 'skos:Concept',
            'skos:prefLabel': 'السامرائي، فاضل صالح، 1933-',
            label: 'السامرائي، فاضل صالح، 1933-', 
            type: 'authorized',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/2031#name-2',
            '@type': 'skos:Concept',
            'skos:altLabel': 'سامرائي، فاضل صالح، 1933-',
            label: 'سامرائي، فاضل صالح، 1933-', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/2031#name-3',
            '@type': 'skos:Concept',
            'skos:altLabel': 'البدري، فاضل صالح، 1933-',
            label: 'البدري، فاضل صالح، 1933-', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/2031#name-4',
            '@type': 'skos:Concept',
            'skos:altLabel': 'Sāmarrāʼī, Fāḍil Ṣāliḥ, 1933-',
            label: 'Sāmarrāʼī, Fāḍil Ṣāliḥ, 1933-', 
            type: 'variant',
            language: 'en'
          },
          { 
            '@id': 'https://afiqa.net/authority/2031#name-5',
            '@type': 'skos:Concept',
            'skos:altLabel': 'فاضل صالح السامرائي، 1933-',
            label: 'فاضل صالح السامرائي، 1933-', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/2031#name-6',
            '@type': 'skos:Concept',
            'skos:altLabel': 'فاضل السامرائي، 1933-',
            label: 'فاضل السامرائي، 1933-', 
            type: 'variant',
            language: 'ar'
          }
        ],
        works: [
          { 
            '@id': 'https://afiqa.net/work/2031-1',
            '@type': 'bf:Work',
            'bf:title': 'على طريق التفسير البياني',
            title: 'على طريق التفسير البياني', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/2031-2',
            '@type': 'bf:Work',
            'bf:title': 'معاني النحو',
            title: 'معاني النحو', 
            holdings: ['المكتبة المركزية - الجامعة المستنصرية', 'البوابة العراقية للمعرفة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/2031-3',
            '@type': 'bf:Work',
            'bf:title': 'التعبير القرآني',
            title: 'التعبير القرآني', 
            holdings: ['المكتبة المركزية - الجامعة المستنصرية'] 
          },
          { 
            '@id': 'https://afiqa.net/work/2031-4',
            '@type': 'bf:Work',
            'bf:title': 'الجملة العربية',
            title: 'الجملة العربية', 
            holdings: ['البوابة العراقية للمعرفة'] 
          }
        ],
        sources: [
          { 
            '@type': 'bf:Source',
            citation: 'على طريق التفسير البياني، الطبعة الاولى، 2011', 
            page: 'صفحة العنوان (الدكتور فاضل صالح السامرائي)' 
          },
          { 
            '@type': 'bf:Source',
            citation: 'ويكيبيديا، اخر مراجعة 3 تموز 2025', 
            url: 'https://ar.wikipedia.org/wiki/فاضل_السامرائي#اسمه' 
          }
        ],
        createdAt: new Date()
      },
      
      // ابو الطيب المتنبي
      {
        '@context': {
          bf: 'http://id.loc.gov/ontologies/bibframe/',
          schema: 'http://schema.org/',
          skos: 'http://www.w3.org/2004/02/skos/core#',
          afiqa: 'https://afiqa.net/authority/',
          isni: 'https://isni.org/isni/',
          wd: 'http://www.wikidata.org/entity/',
          lccn: 'http://id.loc.gov/authorities/names/',
        },
        '@id': 'https://afiqa.net/authority/15',
        '@type': 'bf:Person',
        'owl:sameAs': [
          'https://isni.org/isni/0000000122424312',
          'http://www.wikidata.org/entity/Q284542',
          'http://id.loc.gov/authorities/names/PJ7750.M8'
        ],
        id: 'afiqa-15',
        afiqaId: '15',
        isni: '0000000122424312',
        qid: 'Q284542',
        lccn: 'PJ7750.M8',
        personalName: 'ابو الطيب المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري',
        'schema:name': 'ابو الطيب المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري',
        'schema:birthDate': '915',
        'schema:deathDate': '965',
        'schema:birthPlace': 'الكوفة (العراق)',
        birthDate: '915',
        deathDate: '965',
        birthPlace: 'الكوفة (العراق)',
        deathPlace: 'النعمانية (العراق)',
        gender: 'ذكر',
        fieldOfActivity: ['الشعر العربي'],
        'schema:occupation': ['الشعراء'],
        occupation: ['الشعراء'],
        language: ['العربية'],
        names: [
          { 
            '@id': 'https://afiqa.net/authority/15#name-1',
            '@type': 'skos:Concept',
            'skos:prefLabel': 'ابو الطيب المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري',
            label: 'ابو الطيب المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري', 
            type: 'authorized',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/15#name-2',
            '@type': 'skos:Concept',
            'skos:altLabel': 'ابي الطيب المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري',
            label: 'ابي الطيب المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/15#name-3',
            '@type': 'skos:Concept',
            'skos:altLabel': 'المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري',
            label: 'المتنبي، احمد بن الحسين بن الحسن، 303-354 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/15#name-4',
            '@type': 'skos:Concept',
            'skos:altLabel': 'الجعفي، احمد بن الحسين بن الحسن، 303-354 هجري',
            label: 'الجعفي، احمد بن الحسين بن الحسن، 303-354 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/15#name-5',
            '@type': 'skos:Concept',
            'skos:altLabel': 'الكندي، احمد بن الحسين بن الحسن، 303-354 هجري',
            label: 'الكندي، احمد بن الحسين بن الحسن، 303-354 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/15#name-6',
            '@type': 'skos:Concept',
            'skos:altLabel': 'شاعر العرب، احمد بن الحسين بن الحسن، 303-354 هجري',
            label: 'شاعر العرب، احمد بن الحسين بن الحسن، 303-354 هجري', 
            type: 'variant',
            language: 'ar'
          },
          { 
            '@id': 'https://afiqa.net/authority/15#name-7',
            '@type': 'skos:Concept',
            'skos:altLabel': 'Abū al-Ṭayyib al-Mutanabbī, Aḥmad ibn al-Ḥusain al Mutanabbī, 915-965',
            label: 'Abū al-Ṭayyib al-Mutanabbī, Aḥmad ibn al-Ḥusain al Mutanabbī, 915-965', 
            type: 'variant',
            language: 'en'
          }
        ],
        works: [
          { 
            '@id': 'https://afiqa.net/work/15-1',
            '@type': 'bf:Work',
            'bf:title': 'ديوان ابي الطيب المتنبي، او، ديوان المتنبي',
            title: 'ديوان ابي الطيب المتنبي، او، ديوان المتنبي', 
            holdings: ['المكتبة المركزية - الجامعة المستنصرية', 'البوابة العراقية للمعرفة'] 
          },
          { 
            '@id': 'https://afiqa.net/work/15-2',
            '@type': 'bf:Work',
            'bf:title': 'من اروع ما قال المتنبي',
            title: 'من اروع ما قال المتنبي', 
            holdings: ['مكتبة ودار مخطوطات العتبة العباسية المقدسة'] 
          }
        ],
        sources: [
          { 
            '@type': 'bf:Source',
            citation: 'ديوان ابي الطيب المتنبي، الطبعة الثانية، 2009' 
          },
          { 
            '@type': 'bf:Source',
            citation: 'الاعلام / الزركلي، المجلد الاول، الطبعة الخامسة، 1980', 
            page: 'صفحة 115' 
          },
          { 
            '@type': 'bf:Source',
            citation: 'ويكيبيديا، اخر مراجعة 23 كانون الثاني 2024', 
            url: 'https://ar.wikipedia.org/wiki/أبو_الطيب_المتنبي' 
          }
        ],
        createdAt: new Date()
      }
    ];

    sampleRecords.forEach(record => {
      this.localRecords.set(record.id, record);
      this.uriIndex.set(record['@id'], record.id);
    });
  }

  /**
   * Search AFIQA records
   */
  async search(query: string): Promise<AfiqaRecord[]> {
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) {
      return Array.from(this.localRecords.values());
    }

    return Array.from(this.localRecords.values()).filter(record => {
      // Search in personal name
      if (record.personalName.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in variant names
      if (record.names.some(name => name.label.toLowerCase().includes(lowerQuery))) return true;
      
      // Search in works
      if (record.works?.some(work => work.title.toLowerCase().includes(lowerQuery))) return true;
      
      // Search in identifiers
      if (record.afiqaId.includes(lowerQuery)) return true;
      if (record.isni?.includes(lowerQuery)) return true;
      
      return false;
    });
  }

  /**
   * Get record by ID
   */
  async getById(id: string): Promise<AfiqaRecord | null> {
    return this.localRecords.get(id) || null;
  }

  /**
   * Get record by URI
   */
  async getByUri(uri: string): Promise<AfiqaRecord | null> {
    const id = this.uriIndex.get(uri);
    if (!id) return null;
    return this.localRecords.get(id) || null;
  }

  /**
   * Get record by AFIQA ID
   */
  async getByAfiqaId(afiqaId: string): Promise<AfiqaRecord | null> {
    return Array.from(this.localRecords.values()).find(
      record => record.afiqaId === afiqaId
    ) || null;
  }

  /**
   * Get all records
   */
  async getAll(): Promise<AfiqaRecord[]> {
    return Array.from(this.localRecords.values());
  }

  /**
   * Create or update a record
   */
  async save(record: AfiqaRecord): Promise<AfiqaRecord> {
    record.updatedAt = new Date();
    if (!record.createdAt) {
      record.createdAt = new Date();
    }
    this.localRecords.set(record.id, record);
    this.uriIndex.set(record['@id'], record.id);
    return record;
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<boolean> {
    const record = this.localRecords.get(id);
    if (record) {
      this.uriIndex.delete(record['@id']);
    }
    return this.localRecords.delete(id);
  }

  /**
   * Convert AFIQA record to BIBFRAME Agent (JSON-LD)
   */
  toBibframeAgent(record: AfiqaRecord) {
    return {
      '@context': record['@context'],
      '@id': record['@id'],
      '@type': 'bf:Person',
      'bf:label': record.personalName,
      'bf:identifiedBy': [
        record.isni && { 
          '@type': 'bf:Isni', 
          'rdf:value': record.isni,
          '@id': `https://isni.org/isni/${record.isni}`
        },
        record.lccn && { 
          '@type': 'bf:Lccn', 
          'rdf:value': record.lccn,
          '@id': `http://id.loc.gov/authorities/names/${record.lccn}`
        },
        record.afiqaId && { 
          '@type': 'bf:Identifier', 
          'rdf:value': `AFIQA:${record.afiqaId}`,
          '@id': `https://afiqa.net/authority/${record.afiqaId}`
        },
        record.qid && {
          '@type': 'bf:Identifier',
          'rdf:value': `WD:${record.qid}`,
          '@id': `http://www.wikidata.org/entity/${record.qid}`
        }
      ].filter(Boolean),
      'owl:sameAs': record['owl:sameAs'],
      'bf:birthDate': record.birthDate,
      'bf:deathDate': record.deathDate,
      'bf:gender': record.gender,
      'bf:hasVariant': record.names
        .filter(n => n.type === 'variant')
        .map(n => ({ 
          '@type': 'bf:VariantName', 
          '@id': n['@id'],
          'rdfs:label': n.label 
        }))
    };
  }

  /**
   * Export record as JSON-LD
   */
  toJsonLD(record: AfiqaRecord) {
    return {
      '@context': record['@context'],
      '@id': record['@id'],
      '@type': record['@type'],
      'owl:sameAs': record['owl:sameAs'],
      'schema:name': record['schema:name'],
      'schema:birthDate': record['schema:birthDate'],
      'schema:deathDate': record['schema:deathDate'],
      'schema:birthPlace': record['schema:birthPlace'],
      'schema:occupation': record['schema:occupation'],
      'skos:prefLabel': record.names.find(n => n.type === 'authorized')?.label,
      'skos:altLabel': record.names.filter(n => n.type === 'variant').map(n => n.label),
      'bf:hasWork': record.works?.map(w => ({
        '@id': w['@id'],
        '@type': w['@type'],
        'bf:title': w['bf:title']
      }))
    };
  }
}

export const afiqaService = new AfiqaService();
