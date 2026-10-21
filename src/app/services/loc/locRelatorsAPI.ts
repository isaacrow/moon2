/**
 * LOC Relators API Service
 * API: https://id.loc.gov/vocabulary/relators
 * Used for: Contributor roles (MARC $e - author, editor, translator, etc.)
 */

export interface RelatorTerm {
  uri: string;
  label: string;
  code: string;
  definition?: string;
}

const BASE_URL = 'https://id.loc.gov/vocabulary/relators';

/**
 * Search relator terms
 */
export async function searchRelators(query: string): Promise<RelatorTerm[]> {
  if (!query || query.trim().length < 2) {
    return getCommonRelators();
  }

  try {
    const searchUrl = `${BASE_URL}/suggest2/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.warn(`Relators API error: ${response.status}`);
      return filterRelators(query);
    }

    const data = await response.json();
    
    if (!data || !data.hits) {
      return filterRelators(query);
    }

    return data.hits.map((hit: any) => ({
      uri: hit.uri || `${BASE_URL}/${hit.token}`,
      label: hit.aLabel || hit.suggestLabel || hit.token,
      code: hit.token,
      definition: hit.definition
    }));
  } catch (error) {
    console.error('Error searching relators:', error);
    return filterRelators(query);
  }
}

/**
 * Get all relator terms
 */
export function getAllRelators(): RelatorTerm[] {
  return RELATOR_TERMS;
}

/**
 * Get common relators for quick access
 */
export function getCommonRelators(): RelatorTerm[] {
  return COMMON_RELATORS;
}

/**
 * Filter relators by query
 */
function filterRelators(query: string): RelatorTerm[] {
  const lowerQuery = query.toLowerCase();
  return RELATOR_TERMS.filter(rel =>
    rel.label.toLowerCase().includes(lowerQuery) ||
    rel.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get relator by code
 */
export function getRelatorByCode(code: string): RelatorTerm | undefined {
  return RELATOR_TERMS.find(rel => rel.code === code);
}

/**
 * Common relators for quick selection
 */
export const COMMON_RELATORS: RelatorTerm[] = [
  { uri: `${BASE_URL}/aut`, label: 'Author', code: 'aut', definition: 'Person, family, or organization responsible for creating a work' },
  { uri: `${BASE_URL}/edt`, label: 'Editor', code: 'edt', definition: 'Person, family, or organization who prepares for publication' },
  { uri: `${BASE_URL}/trl`, label: 'Translator', code: 'trl', definition: 'Person or organization who renders a text from one language into another' },
  { uri: `${BASE_URL}/ill`, label: 'Illustrator', code: 'ill', definition: 'Person, family, or organization who creates illustrations' },
  { uri: `${BASE_URL}/ctb`, label: 'Contributor', code: 'ctb', definition: 'Person, family or organization who makes a contribution' },
  { uri: `${BASE_URL}/pbl`, label: 'Publisher', code: 'pbl', definition: 'Person or organization responsible for publishing' },
  { uri: `${BASE_URL}/com`, label: 'Compiler', code: 'com', definition: 'Person, family, or organization who produces a work by assembling parts' },
  { uri: `${BASE_URL}/dte`, label: 'Dedicatee', code: 'dte', definition: 'Entity to whom a resource is dedicated' },
  { uri: `${BASE_URL}/pht`, label: 'Photographer', code: 'pht', definition: 'Person, family, or organization responsible for creating a photographic work' },
  { uri: `${BASE_URL}/cre`, label: 'Creator', code: 'cre', definition: 'Person or organization responsible for the intellectual or artistic content' },
];

/**
 * Complete list of LC Relator terms
 * Source: https://id.loc.gov/vocabulary/relators
 */
export const RELATOR_TERMS: RelatorTerm[] = [
  { uri: `${BASE_URL}/abr`, label: 'Abridger', code: 'abr' },
  { uri: `${BASE_URL}/acp`, label: 'Art copyist', code: 'acp' },
  { uri: `${BASE_URL}/act`, label: 'Actor', code: 'act' },
  { uri: `${BASE_URL}/adi`, label: 'Art director', code: 'adi' },
  { uri: `${BASE_URL}/adp`, label: 'Adapter', code: 'adp' },
  { uri: `${BASE_URL}/aft`, label: 'Author of afterword', code: 'aft' },
  { uri: `${BASE_URL}/anl`, label: 'Analyst', code: 'anl' },
  { uri: `${BASE_URL}/anm`, label: 'Animator', code: 'anm' },
  { uri: `${BASE_URL}/ann`, label: 'Annotator', code: 'ann' },
  { uri: `${BASE_URL}/ant`, label: 'Bibliographic antecedent', code: 'ant' },
  { uri: `${BASE_URL}/ape`, label: 'Appellee', code: 'ape' },
  { uri: `${BASE_URL}/apl`, label: 'Appellant', code: 'apl' },
  { uri: `${BASE_URL}/app`, label: 'Applicant', code: 'app' },
  { uri: `${BASE_URL}/aqt`, label: 'Author in quotations', code: 'aqt' },
  { uri: `${BASE_URL}/arc`, label: 'Architect', code: 'arc' },
  { uri: `${BASE_URL}/ard`, label: 'Artistic director', code: 'ard' },
  { uri: `${BASE_URL}/arr`, label: 'Arranger', code: 'arr' },
  { uri: `${BASE_URL}/art`, label: 'Artist', code: 'art' },
  { uri: `${BASE_URL}/asg`, label: 'Assignee', code: 'asg' },
  { uri: `${BASE_URL}/asn`, label: 'Associated name', code: 'asn' },
  { uri: `${BASE_URL}/ato`, label: 'Autographer', code: 'ato' },
  { uri: `${BASE_URL}/att`, label: 'Attributed name', code: 'att' },
  { uri: `${BASE_URL}/auc`, label: 'Auctioneer', code: 'auc' },
  { uri: `${BASE_URL}/aud`, label: 'Author of dialog', code: 'aud' },
  { uri: `${BASE_URL}/aui`, label: 'Author of introduction', code: 'aui' },
  { uri: `${BASE_URL}/aus`, label: 'Screenwriter', code: 'aus' },
  { uri: `${BASE_URL}/aut`, label: 'Author', code: 'aut' },
  { uri: `${BASE_URL}/bdd`, label: 'Binding designer', code: 'bdd' },
  { uri: `${BASE_URL}/bjd`, label: 'Bookjacket designer', code: 'bjd' },
  { uri: `${BASE_URL}/bkd`, label: 'Book designer', code: 'bkd' },
  { uri: `${BASE_URL}/bkp`, label: 'Book producer', code: 'bkp' },
  { uri: `${BASE_URL}/blw`, label: 'Blurb writer', code: 'blw' },
  { uri: `${BASE_URL}/bnd`, label: 'Binder', code: 'bnd' },
  { uri: `${BASE_URL}/bpd`, label: 'Bookplate designer', code: 'bpd' },
  { uri: `${BASE_URL}/brd`, label: 'Broadcaster', code: 'brd' },
  { uri: `${BASE_URL}/brl`, label: 'Braille embosser', code: 'brl' },
  { uri: `${BASE_URL}/bsl`, label: 'Bookseller', code: 'bsl' },
  { uri: `${BASE_URL}/cas`, label: 'Caster', code: 'cas' },
  { uri: `${BASE_URL}/ccp`, label: 'Conceptor', code: 'ccp' },
  { uri: `${BASE_URL}/chr`, label: 'Choreographer', code: 'chr' },
  { uri: `${BASE_URL}/cli`, label: 'Client', code: 'cli' },
  { uri: `${BASE_URL}/cll`, label: 'Calligrapher', code: 'cll' },
  { uri: `${BASE_URL}/clr`, label: 'Colorist', code: 'clr' },
  { uri: `${BASE_URL}/clt`, label: 'Collotyper', code: 'clt' },
  { uri: `${BASE_URL}/cmm`, label: 'Commentator', code: 'cmm' },
  { uri: `${BASE_URL}/cmp`, label: 'Composer', code: 'cmp' },
  { uri: `${BASE_URL}/cmt`, label: 'Compositor', code: 'cmt' },
  { uri: `${BASE_URL}/cnd`, label: 'Conductor', code: 'cnd' },
  { uri: `${BASE_URL}/cng`, label: 'Cinematographer', code: 'cng' },
  { uri: `${BASE_URL}/cns`, label: 'Censor', code: 'cns' },
  { uri: `${BASE_URL}/coe`, label: 'Contestant-appellee', code: 'coe' },
  { uri: `${BASE_URL}/col`, label: 'Collector', code: 'col' },
  { uri: `${BASE_URL}/com`, label: 'Compiler', code: 'com' },
  { uri: `${BASE_URL}/con`, label: 'Conservator', code: 'con' },
  { uri: `${BASE_URL}/cor`, label: 'Collection registrar', code: 'cor' },
  { uri: `${BASE_URL}/cos`, label: 'Contestant', code: 'cos' },
  { uri: `${BASE_URL}/cot`, label: 'Contestant-appellant', code: 'cot' },
  { uri: `${BASE_URL}/cou`, label: 'Court governed', code: 'cou' },
  { uri: `${BASE_URL}/cov`, label: 'Cover designer', code: 'cov' },
  { uri: `${BASE_URL}/cpc`, label: 'Copyright claimant', code: 'cpc' },
  { uri: `${BASE_URL}/cpe`, label: 'Complainant-appellee', code: 'cpe' },
  { uri: `${BASE_URL}/cph`, label: 'Copyright holder', code: 'cph' },
  { uri: `${BASE_URL}/cpl`, label: 'Complainant', code: 'cpl' },
  { uri: `${BASE_URL}/cpt`, label: 'Complainant-appellant', code: 'cpt' },
  { uri: `${BASE_URL}/cre`, label: 'Creator', code: 'cre' },
  { uri: `${BASE_URL}/crp`, label: 'Correspondent', code: 'crp' },
  { uri: `${BASE_URL}/crr`, label: 'Corrector', code: 'crr' },
  { uri: `${BASE_URL}/crt`, label: 'Court reporter', code: 'crt' },
  { uri: `${BASE_URL}/csl`, label: 'Consultant', code: 'csl' },
  { uri: `${BASE_URL}/csp`, label: 'Consultant to a project', code: 'csp' },
  { uri: `${BASE_URL}/cst`, label: 'Costume designer', code: 'cst' },
  { uri: `${BASE_URL}/ctb`, label: 'Contributor', code: 'ctb' },
  { uri: `${BASE_URL}/cte`, label: 'Contestee-appellee', code: 'cte' },
  { uri: `${BASE_URL}/ctg`, label: 'Cartographer', code: 'ctg' },
  { uri: `${BASE_URL}/ctr`, label: 'Contractor', code: 'ctr' },
  { uri: `${BASE_URL}/cts`, label: 'Contestee', code: 'cts' },
  { uri: `${BASE_URL}/ctt`, label: 'Contestee-appellant', code: 'ctt' },
  { uri: `${BASE_URL}/cur`, label: 'Curator', code: 'cur' },
  { uri: `${BASE_URL}/cwt`, label: 'Commentator for written text', code: 'cwt' },
  { uri: `${BASE_URL}/dbp`, label: 'Distribution place', code: 'dbp' },
  { uri: `${BASE_URL}/dfd`, label: 'Defendant', code: 'dfd' },
  { uri: `${BASE_URL}/dfe`, label: 'Defendant-appellee', code: 'dfe' },
  { uri: `${BASE_URL}/dft`, label: 'Defendant-appellant', code: 'dft' },
  { uri: `${BASE_URL}/dgg`, label: 'Degree granting institution', code: 'dgg' },
  { uri: `${BASE_URL}/dgs`, label: 'Degree supervisor', code: 'dgs' },
  { uri: `${BASE_URL}/dis`, label: 'Dissertant', code: 'dis' },
  { uri: `${BASE_URL}/dln`, label: 'Delineator', code: 'dln' },
  { uri: `${BASE_URL}/dnc`, label: 'Dancer', code: 'dnc' },
  { uri: `${BASE_URL}/dnr`, label: 'Donor', code: 'dnr' },
  { uri: `${BASE_URL}/dpc`, label: 'Depicted', code: 'dpc' },
  { uri: `${BASE_URL}/dpt`, label: 'Depositor', code: 'dpt' },
  { uri: `${BASE_URL}/drm`, label: 'Draftsman', code: 'drm' },
  { uri: `${BASE_URL}/drt`, label: 'Director', code: 'drt' },
  { uri: `${BASE_URL}/dsr`, label: 'Designer', code: 'dsr' },
  { uri: `${BASE_URL}/dst`, label: 'Distributor', code: 'dst' },
  { uri: `${BASE_URL}/dtc`, label: 'Data contributor', code: 'dtc' },
  { uri: `${BASE_URL}/dte`, label: 'Dedicatee', code: 'dte' },
  { uri: `${BASE_URL}/dtm`, label: 'Data manager', code: 'dtm' },
  { uri: `${BASE_URL}/dto`, label: 'Dedicator', code: 'dto' },
  { uri: `${BASE_URL}/dub`, label: 'Dubious author', code: 'dub' },
  { uri: `${BASE_URL}/edc`, label: 'Editor of compilation', code: 'edc' },
  { uri: `${BASE_URL}/edm`, label: 'Editor of moving image work', code: 'edm' },
  { uri: `${BASE_URL}/edt`, label: 'Editor', code: 'edt' },
  { uri: `${BASE_URL}/egr`, label: 'Engraver', code: 'egr' },
  { uri: `${BASE_URL}/elg`, label: 'Electrician', code: 'elg' },
  { uri: `${BASE_URL}/elt`, label: 'Electrotyper', code: 'elt' },
  { uri: `${BASE_URL}/eng`, label: 'Engineer', code: 'eng' },
  { uri: `${BASE_URL}/enj`, label: 'Enacting jurisdiction', code: 'enj' },
  { uri: `${BASE_URL}/etr`, label: 'Etcher', code: 'etr' },
  { uri: `${BASE_URL}/evp`, label: 'Event place', code: 'evp' },
  { uri: `${BASE_URL}/exp`, label: 'Expert', code: 'exp' },
  { uri: `${BASE_URL}/fac`, label: 'Facsimilist', code: 'fac' },
  { uri: `${BASE_URL}/fds`, label: 'Film distributor', code: 'fds' },
  { uri: `${BASE_URL}/fld`, label: 'Field director', code: 'fld' },
  { uri: `${BASE_URL}/flm`, label: 'Film editor', code: 'flm' },
  { uri: `${BASE_URL}/fmd`, label: 'Film director', code: 'fmd' },
  { uri: `${BASE_URL}/fmk`, label: 'Filmmaker', code: 'fmk' },
  { uri: `${BASE_URL}/fmo`, label: 'Former owner', code: 'fmo' },
  { uri: `${BASE_URL}/fmp`, label: 'Film producer', code: 'fmp' },
  { uri: `${BASE_URL}/fnd`, label: 'Funder', code: 'fnd' },
  { uri: `${BASE_URL}/fpy`, label: 'First party', code: 'fpy' },
  { uri: `${BASE_URL}/frg`, label: 'Forger', code: 'frg' },
  { uri: `${BASE_URL}/gis`, label: 'Geographic information specialist', code: 'gis' },
  { uri: `${BASE_URL}/his`, label: 'Host institution', code: 'his' },
  { uri: `${BASE_URL}/hnr`, label: 'Honoree', code: 'hnr' },
  { uri: `${BASE_URL}/hst`, label: 'Host', code: 'hst' },
  { uri: `${BASE_URL}/ill`, label: 'Illustrator', code: 'ill' },
  { uri: `${BASE_URL}/ilu`, label: 'Illuminator', code: 'ilu' },
  { uri: `${BASE_URL}/ins`, label: 'Inscriber', code: 'ins' },
  { uri: `${BASE_URL}/inv`, label: 'Inventor', code: 'inv' },
  { uri: `${BASE_URL}/isb`, label: 'Issuing body', code: 'isb' },
  { uri: `${BASE_URL}/itr`, label: 'Instrumentalist', code: 'itr' },
  { uri: `${BASE_URL}/ive`, label: 'Interviewee', code: 'ive' },
  { uri: `${BASE_URL}/ivr`, label: 'Interviewer', code: 'ivr' },
  { uri: `${BASE_URL}/jud`, label: 'Judge', code: 'jud' },
  { uri: `${BASE_URL}/jug`, label: 'Jurisdiction governed', code: 'jug' },
  { uri: `${BASE_URL}/lbr`, label: 'Laboratory', code: 'lbr' },
  { uri: `${BASE_URL}/lbt`, label: 'Librettist', code: 'lbt' },
  { uri: `${BASE_URL}/ldr`, label: 'Laboratory director', code: 'ldr' },
  { uri: `${BASE_URL}/led`, label: 'Lead', code: 'led' },
  { uri: `${BASE_URL}/lee`, label: 'Libelee-appellee', code: 'lee' },
  { uri: `${BASE_URL}/lel`, label: 'Libelee', code: 'lel' },
  { uri: `${BASE_URL}/len`, label: 'Lender', code: 'len' },
  { uri: `${BASE_URL}/let`, label: 'Libelee-appellant', code: 'let' },
  { uri: `${BASE_URL}/lgd`, label: 'Lighting designer', code: 'lgd' },
  { uri: `${BASE_URL}/lie`, label: 'Libelant-appellee', code: 'lie' },
  { uri: `${BASE_URL}/lil`, label: 'Libelant', code: 'lil' },
  { uri: `${BASE_URL}/lit`, label: 'Libelant-appellant', code: 'lit' },
  { uri: `${BASE_URL}/lsa`, label: 'Landscape architect', code: 'lsa' },
  { uri: `${BASE_URL}/lse`, label: 'Licensee', code: 'lse' },
  { uri: `${BASE_URL}/lso`, label: 'Licensor', code: 'lso' },
  { uri: `${BASE_URL}/ltg`, label: 'Lithographer', code: 'ltg' },
  { uri: `${BASE_URL}/lyr`, label: 'Lyricist', code: 'lyr' },
  { uri: `${BASE_URL}/mcp`, label: 'Music copyist', code: 'mcp' },
  { uri: `${BASE_URL}/mdc`, label: 'Metadata contact', code: 'mdc' },
  { uri: `${BASE_URL}/med`, label: 'Medium', code: 'med' },
  { uri: `${BASE_URL}/mfp`, label: 'Manufacture place', code: 'mfp' },
  { uri: `${BASE_URL}/mfr`, label: 'Manufacturer', code: 'mfr' },
  { uri: `${BASE_URL}/mod`, label: 'Moderator', code: 'mod' },
  { uri: `${BASE_URL}/mon`, label: 'Monitor', code: 'mon' },
  { uri: `${BASE_URL}/mrb`, label: 'Marbler', code: 'mrb' },
  { uri: `${BASE_URL}/mrk`, label: 'Markup editor', code: 'mrk' },
  { uri: `${BASE_URL}/msd`, label: 'Musical director', code: 'msd' },
  { uri: `${BASE_URL}/mte`, label: 'Metal-engraver', code: 'mte' },
  { uri: `${BASE_URL}/mtk`, label: 'Minute taker', code: 'mtk' },
  { uri: `${BASE_URL}/mus`, label: 'Musician', code: 'mus' },
  { uri: `${BASE_URL}/nrt`, label: 'Narrator', code: 'nrt' },
  { uri: `${BASE_URL}/opn`, label: 'Opponent', code: 'opn' },
  { uri: `${BASE_URL}/org`, label: 'Originator', code: 'org' },
  { uri: `${BASE_URL}/orm`, label: 'Organizer', code: 'orm' },
  { uri: `${BASE_URL}/osp`, label: 'Onscreen presenter', code: 'osp' },
  { uri: `${BASE_URL}/oth`, label: 'Other', code: 'oth' },
  { uri: `${BASE_URL}/own`, label: 'Owner', code: 'own' },
  { uri: `${BASE_URL}/pan`, label: 'Panelist', code: 'pan' },
  { uri: `${BASE_URL}/pat`, label: 'Patron', code: 'pat' },
  { uri: `${BASE_URL}/pbd`, label: 'Publishing director', code: 'pbd' },
  { uri: `${BASE_URL}/pbl`, label: 'Publisher', code: 'pbl' },
  { uri: `${BASE_URL}/pdr`, label: 'Project director', code: 'pdr' },
  { uri: `${BASE_URL}/pfr`, label: 'Proofreader', code: 'pfr' },
  { uri: `${BASE_URL}/pht`, label: 'Photographer', code: 'pht' },
  { uri: `${BASE_URL}/plt`, label: 'Platemaker', code: 'plt' },
  { uri: `${BASE_URL}/pma`, label: 'Permitting agency', code: 'pma' },
  { uri: `${BASE_URL}/pmn`, label: 'Production manager', code: 'pmn' },
  { uri: `${BASE_URL}/pop`, label: 'Printer of plates', code: 'pop' },
  { uri: `${BASE_URL}/ppm`, label: 'Papermaker', code: 'ppm' },
  { uri: `${BASE_URL}/ppt`, label: 'Puppeteer', code: 'ppt' },
  { uri: `${BASE_URL}/pra`, label: 'Praeses', code: 'pra' },
  { uri: `${BASE_URL}/prc`, label: 'Process contact', code: 'prc' },
  { uri: `${BASE_URL}/prd`, label: 'Production personnel', code: 'prd' },
  { uri: `${BASE_URL}/pre`, label: 'Presenter', code: 'pre' },
  { uri: `${BASE_URL}/prf`, label: 'Performer', code: 'prf' },
  { uri: `${BASE_URL}/prg`, label: 'Programmer', code: 'prg' },
  { uri: `${BASE_URL}/prm`, label: 'Printmaker', code: 'prm' },
  { uri: `${BASE_URL}/prn`, label: 'Production company', code: 'prn' },
  { uri: `${BASE_URL}/pro`, label: 'Producer', code: 'pro' },
  { uri: `${BASE_URL}/prp`, label: 'Production place', code: 'prp' },
  { uri: `${BASE_URL}/prs`, label: 'Production designer', code: 'prs' },
  { uri: `${BASE_URL}/prt`, label: 'Printer', code: 'prt' },
  { uri: `${BASE_URL}/prv`, label: 'Provider', code: 'prv' },
  { uri: `${BASE_URL}/pta`, label: 'Patent applicant', code: 'pta' },
  { uri: `${BASE_URL}/pte`, label: 'Plaintiff-appellee', code: 'pte' },
  { uri: `${BASE_URL}/ptf`, label: 'Plaintiff', code: 'ptf' },
  { uri: `${BASE_URL}/pth`, label: 'Patent holder', code: 'pth' },
  { uri: `${BASE_URL}/ptt`, label: 'Plaintiff-appellant', code: 'ptt' },
  { uri: `${BASE_URL}/pup`, label: 'Publication place', code: 'pup' },
  { uri: `${BASE_URL}/rbr`, label: 'Rubricator', code: 'rbr' },
  { uri: `${BASE_URL}/rcd`, label: 'Recordist', code: 'rcd' },
  { uri: `${BASE_URL}/rce`, label: 'Recording engineer', code: 'rce' },
  { uri: `${BASE_URL}/rcp`, label: 'Addressee', code: 'rcp' },
  { uri: `${BASE_URL}/rdd`, label: 'Radio director', code: 'rdd' },
  { uri: `${BASE_URL}/red`, label: 'Redaktor', code: 'red' },
  { uri: `${BASE_URL}/ren`, label: 'Renderer', code: 'ren' },
  { uri: `${BASE_URL}/res`, label: 'Researcher', code: 'res' },
  { uri: `${BASE_URL}/rev`, label: 'Reviewer', code: 'rev' },
  { uri: `${BASE_URL}/rpc`, label: 'Radio producer', code: 'rpc' },
  { uri: `${BASE_URL}/rps`, label: 'Repository', code: 'rps' },
  { uri: `${BASE_URL}/rpt`, label: 'Reporter', code: 'rpt' },
  { uri: `${BASE_URL}/rpy`, label: 'Responsible party', code: 'rpy' },
  { uri: `${BASE_URL}/rse`, label: 'Respondent-appellee', code: 'rse' },
  { uri: `${BASE_URL}/rsg`, label: 'Restager', code: 'rsg' },
  { uri: `${BASE_URL}/rsp`, label: 'Respondent', code: 'rsp' },
  { uri: `${BASE_URL}/rsr`, label: 'Restorationist', code: 'rsr' },
  { uri: `${BASE_URL}/rst`, label: 'Respondent-appellant', code: 'rst' },
  { uri: `${BASE_URL}/rth`, label: 'Research team head', code: 'rth' },
  { uri: `${BASE_URL}/rtm`, label: 'Research team member', code: 'rtm' },
  { uri: `${BASE_URL}/sad`, label: 'Scientific advisor', code: 'sad' },
  { uri: `${BASE_URL}/sce`, label: 'Scenarist', code: 'sce' },
  { uri: `${BASE_URL}/scl`, label: 'Sculptor', code: 'scl' },
  { uri: `${BASE_URL}/scr`, label: 'Scribe', code: 'scr' },
  { uri: `${BASE_URL}/sds`, label: 'Sound designer', code: 'sds' },
  { uri: `${BASE_URL}/sec`, label: 'Secretary', code: 'sec' },
  { uri: `${BASE_URL}/sgd`, label: 'Stage director', code: 'sgd' },
  { uri: `${BASE_URL}/sgn`, label: 'Signer', code: 'sgn' },
  { uri: `${BASE_URL}/sht`, label: 'Supporting host', code: 'sht' },
  { uri: `${BASE_URL}/sll`, label: 'Seller', code: 'sll' },
  { uri: `${BASE_URL}/sng`, label: 'Singer', code: 'sng' },
  { uri: `${BASE_URL}/spk`, label: 'Speaker', code: 'spk' },
  { uri: `${BASE_URL}/spn`, label: 'Sponsor', code: 'spn' },
  { uri: `${BASE_URL}/spy`, label: 'Second party', code: 'spy' },
  { uri: `${BASE_URL}/srv`, label: 'Surveyor', code: 'srv' },
  { uri: `${BASE_URL}/std`, label: 'Set designer', code: 'std' },
  { uri: `${BASE_URL}/stg`, label: 'Setting', code: 'stg' },
  { uri: `${BASE_URL}/stl`, label: 'Storyteller', code: 'stl' },
  { uri: `${BASE_URL}/stm`, label: 'Stage manager', code: 'stm' },
  { uri: `${BASE_URL}/stn`, label: 'Standards body', code: 'stn' },
  { uri: `${BASE_URL}/str`, label: 'Stereotyper', code: 'str' },
  { uri: `${BASE_URL}/tcd`, label: 'Technical director', code: 'tcd' },
  { uri: `${BASE_URL}/tch`, label: 'Teacher', code: 'tch' },
  { uri: `${BASE_URL}/ths`, label: 'Thesis advisor', code: 'ths' },
  { uri: `${BASE_URL}/tld`, label: 'Television director', code: 'tld' },
  { uri: `${BASE_URL}/tlp`, label: 'Television producer', code: 'tlp' },
  { uri: `${BASE_URL}/trc`, label: 'Transcriber', code: 'trc' },
  { uri: `${BASE_URL}/trl`, label: 'Translator', code: 'trl' },
  { uri: `${BASE_URL}/tyd`, label: 'Type designer', code: 'tyd' },
  { uri: `${BASE_URL}/tyg`, label: 'Typographer', code: 'tyg' },
  { uri: `${BASE_URL}/uvp`, label: 'University place', code: 'uvp' },
  { uri: `${BASE_URL}/vac`, label: 'Voice actor', code: 'vac' },
  { uri: `${BASE_URL}/vdg`, label: 'Videographer', code: 'vdg' },
  { uri: `${BASE_URL}/wac`, label: 'Writer of added commentary', code: 'wac' },
  { uri: `${BASE_URL}/wal`, label: 'Writer of added lyrics', code: 'wal' },
  { uri: `${BASE_URL}/wam`, label: 'Writer of accompanying material', code: 'wam' },
  { uri: `${BASE_URL}/wat`, label: 'Writer of added text', code: 'wat' },
  { uri: `${BASE_URL}/wdc`, label: 'Woodcutter', code: 'wdc' },
  { uri: `${BASE_URL}/wde`, label: 'Wood engraver', code: 'wde' },
  { uri: `${BASE_URL}/win`, label: 'Writer of introduction', code: 'win' },
  { uri: `${BASE_URL}/wit`, label: 'Witness', code: 'wit' },
  { uri: `${BASE_URL}/wpr`, label: 'Writer of preface', code: 'wpr' },
  { uri: `${BASE_URL}/wst`, label: 'Writer of supplementary textual content', code: 'wst' },
];
