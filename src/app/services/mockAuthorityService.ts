// Mock Library of Congress Authority Service
// Simulates API calls to id.loc.gov

import { AuthorityLookupResult } from '../types/bibframe';

// Mock data for LCNAF (Library of Congress Name Authority File)
const mockLCNAF: AuthorityLookupResult[] = [
  { uri: 'http://id.loc.gov/authorities/names/n79021164', label: 'Austen, Jane, 1775-1817', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79029745', label: 'Shakespeare, William, 1564-1616', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79006936', label: 'Dickens, Charles, 1812-1870', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79046204', label: 'Twain, Mark, 1835-1910', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79081309', label: 'García Márquez, Gabriel, 1927-2014', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n50025011', label: 'Hemingway, Ernest, 1899-1961', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79007789', label: 'Kafka, Franz, 1883-1924', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79056054', label: 'Orwell, George, 1903-1950', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79018284', label: 'Joyce, James, 1882-1941', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79109957', label: 'Woolf, Virginia, 1882-1941', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79127862', label: 'Morrison, Toni', type: 'bf:Person', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n80126290', label: 'Atwood, Margaret, 1939-', type: 'bf:Person', source: 'LCNAF' },
];

// Mock data for LCSH (Library of Congress Subject Headings)
const mockLCSH: AuthorityLookupResult[] = [
  { uri: 'http://id.loc.gov/authorities/subjects/sh85043782', label: 'English literature', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85004336', label: 'American literature', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85076601', label: 'Libraries', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85077496', label: 'Literature', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85041800', label: 'Education', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85118553', label: 'Science', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85100849', label: 'Philosophy', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85061212', label: 'History', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85112549', label: 'Religion', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85122904', label: 'Social sciences', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85101653', label: 'Physics', type: 'bf:Topic', source: 'LCSH' },
  { uri: 'http://id.loc.gov/authorities/subjects/sh85063114', label: 'Humanities', type: 'bf:Topic', source: 'LCSH' },
];

// Mock data for Geographic subjects
const mockGeographic: AuthorityLookupResult[] = [
  { uri: 'http://id.loc.gov/authorities/names/n79081574', label: 'United States', type: 'bf:Place', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79023147', label: 'England', type: 'bf:Place', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79091461', label: 'France', type: 'bf:Place', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79089877', label: 'Germany', type: 'bf:Place', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79041917', label: 'New York (N.Y.)', type: 'bf:Place', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79045487', label: 'London (England)', type: 'bf:Place', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79058874', label: 'Paris (France)', type: 'bf:Place', source: 'LCNAF' },
];

// Mock data for LCGFT (Library of Congress Genre/Form Terms)
const mockLCGFT: AuthorityLookupResult[] = [
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026339', label: 'Fiction', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026481', label: 'Poetry', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026047', label: 'Biographies', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026266', label: 'Historical fiction', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026542', label: 'Science fiction', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026481', label: 'Mystery fiction', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026481', label: 'Romance fiction', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2014026150', label: 'Textbooks', type: 'bf:GenreForm', source: 'LCGFT' },
  { uri: 'http://id.loc.gov/authorities/genreForms/gf2011026387', label: 'Nonfiction', type: 'bf:GenreForm', source: 'LCGFT' },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function searchLCNAF(query: string): Promise<AuthorityLookupResult[]> {
  await delay(300); // Simulate API latency
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockLCNAF.filter(item => 
    item.label.toLowerCase().includes(lowerQuery)
  );
}

export async function searchLCSH(query: string): Promise<AuthorityLookupResult[]> {
  await delay(300);
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return [...mockLCSH, ...mockGeographic].filter(item => 
    item.label.toLowerCase().includes(lowerQuery)
  );
}

export async function searchLCGFT(query: string): Promise<AuthorityLookupResult[]> {
  await delay(300);
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockLCGFT.filter(item => 
    item.label.toLowerCase().includes(lowerQuery)
  );
}

// Language codes (ISO 639-2)
export const languageCodes = [
  { code: 'eng', label: 'English' },
  { code: 'fre', label: 'French' },
  { code: 'ger', label: 'German' },
  { code: 'spa', label: 'Spanish' },
  { code: 'ita', label: 'Italian' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'chi', label: 'Chinese' },
  { code: 'rus', label: 'Russian' },
  { code: 'ara', label: 'Arabic' },
  { code: 'por', label: 'Portuguese' },
];

// Content types
export const contentTypes = [
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/txt', label: 'text' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/cri', label: 'cartographic image' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/crt', label: 'cartographic three-dimensional form' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/prm', label: 'performed music' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/ntm', label: 'notated music' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/sti', label: 'still image' },
  { uri: 'http://id.loc.gov/vocabulary/contentTypes/tdi', label: 'two-dimensional moving image' },
];

// Carrier types
export const carrierTypes = [
  { uri: 'http://id.loc.gov/vocabulary/carriers/nc', label: 'volume' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/no', label: 'online resource' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/cd', label: 'computer disc' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/sd', label: 'audio disc' },
  { uri: 'http://id.loc.gov/vocabulary/carriers/vd', label: 'videodisc' },
];

// Media types
export const mediaTypes = [
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/n', label: 'unmediated' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/c', label: 'computer' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/s', label: 'audio' },
  { uri: 'http://id.loc.gov/vocabulary/mediaTypes/v', label: 'video' },
];

// Mode of issuance
export const issuanceModes = [
  { uri: 'http://id.loc.gov/vocabulary/issuance/mono', label: 'single unit' },
  { uri: 'http://id.loc.gov/vocabulary/issuance/serl', label: 'serial' },
  { uri: 'http://id.loc.gov/vocabulary/issuance/intg', label: 'integrating resource' },
  { uri: 'http://id.loc.gov/vocabulary/issuance/mulm', label: 'multipart monograph' },
];

// Mock data for Publishers (LCNAF Organizations)
const mockPublishers: AuthorityLookupResult[] = [
  { uri: 'http://id.loc.gov/authorities/names/n79084793', label: 'Oxford University Press', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n78095617', label: 'Cambridge University Press', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n78086291', label: 'Penguin Books', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79084169', label: 'HarperCollins Publishers', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n80126290', label: 'Random House', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n50048595', label: 'Macmillan Publishers', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79084071', label: 'Springer', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n79084196', label: 'Wiley', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n80017751', label: 'McGraw-Hill', type: 'bf:Organization', source: 'LCNAF' },
  { uri: 'http://id.loc.gov/authorities/names/n78095330', label: 'Elsevier', type: 'bf:Organization', source: 'LCNAF' },
];

// Mock data for Intended Audience
export const intendedAudiences = [
  { uri: 'http://id.loc.gov/vocabulary/audiences/juv', label: 'Juvenile' },
  { uri: 'http://id.loc.gov/vocabulary/audiences/ado', label: 'Adolescent' },
  { uri: 'http://id.loc.gov/vocabulary/audiences/gen', label: 'General' },
  { uri: 'http://id.loc.gov/vocabulary/audiences/pre', label: 'Preschool' },
  { uri: 'http://id.loc.gov/vocabulary/audiences/spe', label: 'Specialized' },
];

// Mock data for Illustrative Content
export const illustrativeContent = [
  { uri: 'http://id.loc.gov/vocabulary/millus/ill', label: 'Illustrations' },
  { uri: 'http://id.loc.gov/vocabulary/millus/map', label: 'Maps' },
  { uri: 'http://id.loc.gov/vocabulary/millus/pht', label: 'Photographs' },
  { uri: 'http://id.loc.gov/vocabulary/millus/por', label: 'Portraits' },
  { uri: 'http://id.loc.gov/vocabulary/millus/cht', label: 'Charts' },
  { uri: 'http://id.loc.gov/vocabulary/millus/grf', label: 'Graphs' },
];

// Mock data for Color Content
export const colorContent = [
  { uri: 'http://id.loc.gov/vocabulary/mcolor/blw', label: 'Black and white' },
  { uri: 'http://id.loc.gov/vocabulary/mcolor/clr', label: 'Color' },
  { uri: 'http://id.loc.gov/vocabulary/mcolor/mix', label: 'Mixed' },
];

// Mock data for Supplementary Content
export const supplementaryContent = [
  { uri: 'http://id.loc.gov/vocabulary/msupplcont/ind', label: 'Index' },
  { uri: 'http://id.loc.gov/vocabulary/msupplcont/bib', label: 'Bibliography' },
  { uri: 'http://id.loc.gov/vocabulary/msupplcont/glo', label: 'Glossary' },
  { uri: 'http://id.loc.gov/vocabulary/msupplcont/toc', label: 'Table of contents' },
];

// Search function for Publishers
export async function searchPublishers(query: string): Promise<AuthorityLookupResult[]> {
  await delay(300);
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockPublishers.filter(item => 
    item.label.toLowerCase().includes(lowerQuery)
  );
}

// Search function for Places
export async function searchPlaces(query: string): Promise<AuthorityLookupResult[]> {
  await delay(300);
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return mockGeographic.filter(item => 
    item.label.toLowerCase().includes(lowerQuery)
  );
}
