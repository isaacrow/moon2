/**
 * Moon Engine Real BIBFRAME Examples
 * 
 * These are real-world BIBFRAME records for testing the Moon Engine
 */

import { generateUri } from '../services/graphBuilder';

export const realExample1 = {
  work: {
    '@type': 'bf:Work',
    '@id': generateUri('work'),
    'bf:title': {
      '@type': 'bf:Title',
      'bf:mainTitle': 'One Hundred Years of Solitude',
      'bf:subtitle': 'A Novel'
    },
    'bf:contribution': [
      {
        '@type': 'bf:Contribution',
        'bf:agent': {
          '@type': 'bf:Person',
          '@id': 'http://id.loc.gov/authorities/names/n79046607',
          'rdfs:label': 'García Márquez, Gabriel, 1927-2014'
        },
        'bf:role': {
          '@id': 'http://id.loc.gov/vocabulary/relators/aut',
          'rdfs:label': 'Author'
        }
      }
    ],
    'bf:language': {
      '@id': 'http://id.loc.gov/vocabulary/languages/spa',
      'rdfs:label': 'Spanish'
    },
    'bf:classification': [
      {
        '@type': 'bf:ClassificationLcc',
        'bf:classificationPortion': 'PQ8180.17.A73',
        'bf:itemPortion': 'C513 1970'
      },
      {
        '@type': 'bf:ClassificationDdc',
        'bf:classificationPortion': '863',
        'bf:edition': '23'
      }
    ],
    'bf:subject': [
      {
        '@type': 'bf:Topic',
        '@id': 'http://id.loc.gov/authorities/subjects/sh85043782',
        'rdfs:label': 'Epic literature'
      },
      {
        '@type': 'bf:Geographic',
        '@id': 'http://id.loc.gov/authorities/subjects/sh85029253',
        'rdfs:label': 'Colombia--Fiction'
      }
    ],
    'bf:genreForm': {
      '@type': 'bf:GenreForm',
      '@id': 'http://id.loc.gov/authorities/genreForms/gf2014026339',
      'rdfs:label': 'Magic realist fiction'
    },
    'bf:summary': {
      '@type': 'bf:Summary',
      'rdfs:label': 'The story of seven generations of the Buendía family in the mythical town of Macondo. Through the Buendías, García Márquez charts the growth of Macondo from its foundation to its being wiped out by a hurricane.'
    }
  },
  instance: {
    '@type': 'bf:Instance',
    '@id': generateUri('instance'),
    'bf:title': {
      '@type': 'bf:Title',
      'bf:mainTitle': 'One Hundred Years of Solitude'
    },
    'bf:provisionActivity': {
      '@type': 'bf:Publication',
      'bf:place': {
        '@id': 'http://id.loc.gov/vocabulary/countries/nyu',
        'rdfs:label': 'New York'
      },
      'bf:agent': {
        '@type': 'bf:Agent',
        'rdfs:label': 'Harper & Row'
      },
      'bf:date': '1970'
    },
    'bf:extent': {
      '@type': 'bf:Extent',
      'rdfs:label': '422 pages'
    },
    'bf:dimensions': '21 cm',
    'bf:identifiedBy': [
      {
        '@type': 'bf:Isbn',
        'rdf:value': '9780060883287'
      },
      {
        '@type': 'bf:Lccn',
        'rdf:value': '74091965'
      }
    ],
    'bf:media': {
      '@id': 'http://id.loc.gov/vocabulary/mediaTypes/n',
      'rdfs:label': 'unmediated'
    },
    'bf:carrier': {
      '@id': 'http://id.loc.gov/vocabulary/carriers/nc',
      'rdfs:label': 'volume'
    }
  }
};

export const realExample2Arabic = {
  work: {
    '@type': 'bf:Work',
    '@id': generateUri('work'),
    'bf:title': {
      '@type': 'bf:Title',
      'bf:mainTitle': 'الأيام',
      'bf:subtitle': 'سيرة ذاتية'
    },
    'bf:contribution': [
      {
        '@type': 'bf:Contribution',
        'bf:agent': {
          '@type': 'bf:Person',
          '@id': 'http://id.loc.gov/authorities/names/n79071842',
          'rdfs:label': 'طه حسين، 1889-1973'
        },
        'bf:role': {
          '@id': 'http://id.loc.gov/vocabulary/relators/aut',
          'rdfs:label': 'مؤلف'
        }
      }
    ],
    'bf:language': {
      '@id': 'http://id.loc.gov/vocabulary/languages/ara',
      'rdfs:label': 'Arabic / العربية'
    },
    'bf:classification': [
      {
        '@type': 'bf:ClassificationLcc',
        'bf:classificationPortion': 'PJ7842.U2',
        'bf:itemPortion': 'A3 1997'
      },
      {
        '@type': 'bf:ClassificationDdc',
        'bf:classificationPortion': '892.736',
        'bf:edition': '21'
      }
    ],
    'bf:subject': [
      {
        '@type': 'bf:Topic',
        '@id': 'http://id.loc.gov/authorities/subjects/sh85006691',
        'rdfs:label': 'Autobiographies / السير الذاتية'
      },
      {
        '@type': 'bf:Topic',
        'rdfs:label': 'Authors, Egyptian--20th century--Biography / الكتاب المصريون'
      }
    ],
    'bf:genreForm': {
      '@type': 'bf:GenreForm',
      '@id': 'http://id.loc.gov/authorities/genreForms/gf2014026047',
      'rdfs:label': 'Autobiographies / السير الذاتية'
    },
    'bf:summary': {
      '@type': 'bf:Summary',
      'rdfs:label': 'سيرة ذاتية للأديب المصري طه حسين يروي فيها قصة حياته منذ طفولته في الريف المصري حتى شبابه ودراسته في الأزهر والجامعة المصرية. يتحدث عن فقدانه لبصره وكيف تغلب على هذه الإعاقة ليصبح من أبرز المفكرين العرب.'
    }
  },
  instance: {
    '@type': 'bf:Instance',
    '@id': generateUri('instance'),
    'bf:title': {
      '@type': 'bf:Title',
      'bf:mainTitle': 'الأيام'
    },
    'bf:provisionActivity': {
      '@type': 'bf:Publication',
      'bf:place': {
        '@id': 'http://id.loc.gov/vocabulary/countries/ua',
        'rdfs:label': 'القاهرة / Cairo'
      },
      'bf:agent': {
        '@type': 'bf:Agent',
        'rdfs:label': 'دار المعارف'
      },
      'bf:date': '1997'
    },
    'bf:extent': {
      '@type': 'bf:Extent',
      'rdfs:label': '385 صفحة'
    },
    'bf:dimensions': '24 سم',
    'bf:identifiedBy': [
      {
        '@type': 'bf:Isbn',
        'rdf:value': '9770250198'
      }
    ],
    'bf:media': {
      '@id': 'http://id.loc.gov/vocabulary/mediaTypes/n',
      'rdfs:label': 'unmediated'
    },
    'bf:carrier': {
      '@id': 'http://id.loc.gov/vocabulary/carriers/nc',
      'rdfs:label': 'volume'
    },
    'bf:responsibilityStatement': 'طه حسين'
  }
};

export const realExample3Academic = {
  work: {
    '@type': 'bf:Work',
    '@id': generateUri('work'),
    'bf:title': {
      '@type': 'bf:Title',
      'bf:mainTitle': 'Introduction to Algorithms',
      'bf:subtitle': 'Fourth Edition'
    },
    'bf:contribution': [
      {
        '@type': 'bf:Contribution',
        'bf:agent': {
          '@type': 'bf:Person',
          '@id': 'http://id.loc.gov/authorities/names/n90712345',
          'rdfs:label': 'Cormen, Thomas H.'
        },
        'bf:role': {
          '@id': 'http://id.loc.gov/vocabulary/relators/aut',
          'rdfs:label': 'Author'
        }
      },
      {
        '@type': 'bf:Contribution',
        'bf:agent': {
          '@type': 'bf:Person',
          'rdfs:label': 'Leiserson, Charles E.'
        },
        'bf:role': {
          '@id': 'http://id.loc.gov/vocabulary/relators/aut',
          'rdfs:label': 'Author'
        }
      },
      {
        '@type': 'bf:Contribution',
        'bf:agent': {
          '@type': 'bf:Person',
          'rdfs:label': 'Rivest, Ronald L.'
        },
        'bf:role': {
          '@id': 'http://id.loc.gov/vocabulary/relators/aut',
          'rdfs:label': 'Author'
        }
      },
      {
        '@type': 'bf:Contribution',
        'bf:agent': {
          '@type': 'bf:Person',
          'rdfs:label': 'Stein, Clifford'
        },
        'bf:role': {
          '@id': 'http://id.loc.gov/vocabulary/relators/aut',
          'rdfs:label': 'Author'
        }
      }
    ],
    'bf:language': {
      '@id': 'http://id.loc.gov/vocabulary/languages/eng',
      'rdfs:label': 'English'
    },
    'bf:classification': [
      {
        '@type': 'bf:ClassificationLcc',
        'bf:classificationPortion': 'QA76.9.A43',
        'bf:itemPortion': 'I58 2022'
      },
      {
        '@type': 'bf:ClassificationDdc',
        'bf:classificationPortion': '005.1',
        'bf:edition': '23'
      }
    ],
    'bf:subject': [
      {
        '@type': 'bf:Topic',
        '@id': 'http://id.loc.gov/authorities/subjects/sh85023752',
        'rdfs:label': 'Computer algorithms'
      },
      {
        '@type': 'bf:Topic',
        '@id': 'http://id.loc.gov/authorities/subjects/sh85029535',
        'rdfs:label': 'Computer programming'
      },
      {
        '@type': 'bf:Topic',
        'rdfs:label': 'Data structures'
      }
    ],
    'bf:intendedAudience': {
      '@type': 'bf:IntendedAudience',
      'rdfs:label': 'Graduate students and professionals'
    },
    'bf:tableOfContents': {
      '@type': 'bf:TableOfContents',
      'rdfs:label': 'I. Foundations -- II. Sorting and Order Statistics -- III. Data Structures -- IV. Advanced Design and Analysis Techniques -- V. Advanced Data Structures -- VI. Graph Algorithms -- VII. Selected Topics -- VIII. Appendix: Mathematical Background'
    }
  },
  instance: {
    '@type': 'bf:Instance',
    '@id': generateUri('instance'),
    'bf:title': {
      '@type': 'bf:Title',
      'bf:mainTitle': 'Introduction to Algorithms'
    },
    'bf:editionStatement': 'Fourth edition',
    'bf:provisionActivity': {
      '@type': 'bf:Publication',
      'bf:place': {
        '@id': 'http://id.loc.gov/vocabulary/countries/mau',
        'rdfs:label': 'Cambridge, Massachusetts'
      },
      'bf:agent': {
        '@type': 'bf:Agent',
        'rdfs:label': 'The MIT Press'
      },
      'bf:date': '2022'
    },
    'bf:extent': {
      '@type': 'bf:Extent',
      'rdfs:label': 'xx, 1312 pages : illustrations'
    },
    'bf:dimensions': '24 cm',
    'bf:identifiedBy': [
      {
        '@type': 'bf:Isbn',
        'rdf:value': '9780262046305'
      },
      {
        '@type': 'bf:Lccn',
        'rdf:value': '2021037260'
      }
    ],
    'bf:media': {
      '@id': 'http://id.loc.gov/vocabulary/mediaTypes/n',
      'rdfs:label': 'unmediated'
    },
    'bf:carrier': {
      '@id': 'http://id.loc.gov/vocabulary/carriers/nc',
      'rdfs:label': 'volume'
    },
    'bf:note': [
      {
        '@type': 'bf:Note',
        'rdfs:label': 'Includes bibliographical references and index'
      }
    ]
  }
};

// Example selector for random loading
export const allRealExamples = [
  { name: 'One Hundred Years of Solitude (English)', data: realExample1 },
  { name: 'الأيام - طه حسين (Arabic)', data: realExample2Arabic },
  { name: 'Introduction to Algorithms (Academic)', data: realExample3Academic }
];

export const getRandomExample = () => {
  const randomIndex = Math.floor(Math.random() * allRealExamples.length);
  return allRealExamples[randomIndex];
};
