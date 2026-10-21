// Moon Engine Example Data Loader
// Pre-loaded BIBFRAME examples for testing and demonstration

import engine from './engine.tsx';

const exampleData = {
  'one-hundred-years': {
    work: {
      '@id': 'http://example.org/work/1',
      '@type': 'bf:Work',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'One Hundred Years of Solitude'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'One Hundred Years of Solitude'
      },
      'bf:creator': 'García Márquez, Gabriel',
      'bf:subject': 'Magic realism',
      'bf:language': 'spa',
      'bf:originDate': '1967',
      'bf:classification': 'PQ8180.17.A73',
      'bf:genreForm': 'Novel',
      'bf:summary': 'A landmark 1967 novel by Colombian author Gabriel García Márquez that tells the multi-generational story of the Buendía family.'
    },
    instance: {
      '@id': 'http://example.org/instance/1',
      '@type': 'bf:Instance',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'One Hundred Years of Solitude'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'One Hundred Years of Solitude'
      },
      'instanceOf': {
        '@id': 'http://example.org/work/1'
      },
      'bf:instanceOf': {
        '@id': 'http://example.org/work/1'
      },
      'bf:provisionActivity': {
        publisher: 'Harper & Row',
        place: 'New York',
        date: '1970'
      },
      'bf:identifiedBy': '978-0-06-088328-7',
      'bf:extent': '417 pages',
      'bf:dimensions': '21 cm',
      'bf:carrier': 'volume',
      'bf:editionStatement': 'First English edition'
    }
  },
  
  'al-ayyam': {
    work: {
      '@id': 'http://example.org/work/2',
      '@type': 'bf:Work',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'الأيام'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'الأيام'
      },
      'bf:creator': 'طه حسين',
      'bf:subject': 'Autobiography',
      'bf:language': 'ara',
      'bf:originDate': '1929',
      'bf:classification': 'PJ7820.U8',
      'bf:genreForm': 'Autobiography',
      'bf:summary': 'An autobiographical trilogy by Egyptian writer Taha Hussein, chronicling his childhood, education, and intellectual development in early 20th century Egypt.'
    },
    instance: {
      '@id': 'http://example.org/instance/2',
      '@type': 'bf:Instance',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'الأيام'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'الأيام'
      },
      'instanceOf': {
        '@id': 'http://example.org/work/2'
      },
      'bf:instanceOf': {
        '@id': 'http://example.org/work/2'
      },
      'bf:provisionActivity': {
        publisher: 'دار المعارف',
        place: 'القاهرة',
        date: '1929'
      },
      'bf:identifiedBy': '977-02-5123-4',
      'bf:extent': '3 volumes',
      'bf:dimensions': '20 cm',
      'bf:carrier': 'volume',
      'bf:editionStatement': 'الطبعة الأولى'
    }
  },
  
  'intro-algorithms': {
    work: {
      '@id': 'http://example.org/work/3',
      '@type': 'bf:Work',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Introduction to Algorithms'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Introduction to Algorithms'
      },
      'bf:creator': 'Cormen, Thomas H.',
      'bf:contributor': 'Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford',
      'bf:subject': 'Computer algorithms',
      'bf:language': 'eng',
      'bf:originDate': '1990',
      'bf:classification': 'QA76.9.A43',
      'bf:genreForm': 'Textbook',
      'bf:summary': 'A comprehensive textbook covering a broad range of algorithms in depth, yet making their design and analysis accessible to all levels of readers.'
    },
    instance: {
      '@id': 'http://example.org/instance/3',
      '@type': 'bf:Instance',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Introduction to Algorithms'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Introduction to Algorithms'
      },
      'instanceOf': {
        '@id': 'http://example.org/work/3'
      },
      'bf:instanceOf': {
        '@id': 'http://example.org/work/3'
      },
      'bf:provisionActivity': {
        publisher: 'MIT Press',
        place: 'Cambridge, MA',
        date: '2009'
      },
      'bf:identifiedBy': '978-0-262-03384-8',
      'bf:extent': 'xx, 1292 pages',
      'bf:dimensions': '24 cm',
      'bf:carrier': 'volume',
      'bf:editionStatement': 'Third edition'
    }
  },

  'sample-serial': {
    work: {
      '@id': 'http://example.org/work/4',
      '@type': 'bf:Work',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Journal of Library Science'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Journal of Library Science'
      },
      'bf:subject': 'Library science',
      'bf:language': 'eng',
      'bf:originDate': '1950',
      'bf:classification': 'Z671',
      'bf:genreForm': 'Periodical',
      'bf:summary': 'A peer-reviewed academic journal covering all aspects of library and information science.'
    },
    instance: {
      '@id': 'http://example.org/instance/4',
      '@type': 'bf:Instance',
      'title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Journal of Library Science'
      },
      'bf:title': {
        '@type': 'bf:Title',
        'bf:mainTitle': 'Journal of Library Science'
      },
      'instanceOf': {
        '@id': 'http://example.org/work/4'
      },
      'bf:instanceOf': {
        '@id': 'http://example.org/work/4'
      },
      'bf:provisionActivity': {
        publisher: 'American Library Association',
        place: 'Chicago',
        date: '1950-'
      },
      'bf:identifiedBy': '0022-2429',
      'bf:extent': 'volumes',
      'bf:dimensions': '28 cm',
      'bf:carrier': 'volume',
      'bf:editionStatement': 'Quarterly'
    }
  }
};

async function loadExampleData(): Promise<void> {
  console.log('[Examples] Loading example datasets...');

  try {
    if (!engine.isInitialized()) {
      throw new Error('[Examples] ❌ Engine not initialized - cannot load examples');
    }

    let successCount = 0;
    let failCount = 0;

    for (const [key, data] of Object.entries(exampleData)) {
      console.log(`[Examples] Processing example: ${key}`);
      
      const result = await engine.processBIBFRAME(data);
      
      if (result.success) {
        successCount++;
        console.log(`[Examples] ✅ ${key} loaded successfully`);
      } else {
        failCount++;
        console.error(`[Examples] ❌ ${key} failed:`, result.errors);
      }
    }

    console.log(`[Examples] ✅ Loaded ${successCount} examples successfully`);
    if (failCount > 0) {
      console.warn(`[Examples] ⚠️  ${failCount} examples failed to load`);
    }

  } catch (error) {
    console.error('[Examples] ❌ Failed to load example data:', error);
    throw error;
  }
}

function getExample(key: string) {
  return exampleData[key as keyof typeof exampleData];
}

function getAllExamples() {
  return exampleData;
}

function getExampleKeys() {
  return Object.keys(exampleData);
}

export { loadExampleData, getExample, getAllExamples, getExampleKeys };
export default exampleData;
