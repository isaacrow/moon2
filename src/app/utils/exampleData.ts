// Example BIBFRAME records for testing and demonstration

import { BIBFRAMEWork, BIBFRAMEInstance } from '../types/bibframe';

export const exampleWork: Partial<BIBFRAMEWork> = {
  '@type': 'bf:Work',
  '@id': 'http://example.org/work/pride-and-prejudice',
  'bf:creator': [
    {
      uri: 'http://id.loc.gov/authorities/names/n79021164',
      label: 'Austen, Jane, 1775-1817',
      type: 'bf:Person',
      source: 'LCNAF',
    },
  ],
  'bf:title': {
    '@type': 'bf:Title',
    'bf:mainTitle': 'Pride and prejudice',
  },
  'bf:subject': [
    {
      uri: 'http://id.loc.gov/authorities/subjects/sh85043782',
      label: 'English literature',
      type: 'bf:Topic',
      source: 'LCSH',
    },
  ],
  'bf:genreForm': [
    {
      uri: 'http://id.loc.gov/authorities/genreForms/gf2014026339',
      label: 'Fiction',
      type: 'bf:GenreForm',
      source: 'LCGFT',
    },
  ],
  'bf:classification': [
    {
      '@type': 'bf:ClassificationLcc',
      'bf:classificationPortion': 'PR4034',
      'bf:source': 'LCC',
    },
    {
      '@type': 'bf:ClassificationDdc',
      'bf:classificationPortion': '823.7',
      'bf:source': 'DDC',
    },
  ],
  'bf:language': [
    {
      '@type': 'bf:Language',
      '@id': 'http://id.loc.gov/vocabulary/languages/eng',
      'rdfs:label': 'English',
    },
  ],
  'bf:content': [
    {
      '@type': 'bf:Content',
      '@id': 'http://id.loc.gov/vocabulary/contentTypes/txt',
      'rdfs:label': 'text',
    },
  ],
  'bf:summary': [
    {
      '@type': 'bf:Summary',
      'rdfs:label':
        'A classic novel of manners that follows the romantic entanglements of the Bennet family, particularly the intelligent Elizabeth Bennet and the wealthy Mr. Darcy.',
    },
  ],
};

export const exampleInstance: Partial<BIBFRAMEInstance> = {
  '@type': 'bf:Instance',
  '@id': 'http://example.org/instance/pride-and-prejudice-penguin-2003',
  'bf:title': {
    '@type': 'bf:Title',
    'bf:mainTitle': 'Pride and prejudice',
  },
  'bf:responsibilityStatement': 'Jane Austen ; with an introduction by Anna Quindlen',
  'bf:editionStatement': 'Penguin Classics edition',
  'bf:provisionActivity': [
    {
      '@type': 'bf:Publication',
      'bf:place': {
        '@type': 'bf:Place',
        'rdfs:label': 'New York',
      },
      'bf:agent': {
        '@type': 'bf:Agent',
        'rdfs:label': 'Penguin Books',
      },
      'bf:date': '2003',
    },
  ],
  'bf:issuance': {
    '@type': 'bf:Issuance',
    '@id': 'http://id.loc.gov/vocabulary/issuance/mono',
    'rdfs:label': 'single unit',
  },
  'bf:identifiedBy': [
    {
      '@type': 'bf:Isbn',
      'rdf:value': '0-14-143951-3',
    },
  ],
  'bf:carrier': [
    {
      '@type': 'bf:Carrier',
      '@id': 'http://id.loc.gov/vocabulary/carriers/nc',
      'rdfs:label': 'volume',
    },
  ],
  'bf:media': [
    {
      '@type': 'bf:Media',
      '@id': 'http://id.loc.gov/vocabulary/mediaTypes/n',
      'rdfs:label': 'unmediated',
    },
  ],
  'bf:extent': {
    '@type': 'bf:Extent',
    'rdfs:label': '1 volume (xviii, 333 pages)',
  },
  'bf:dimensions': '20 cm',
};
