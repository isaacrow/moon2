export interface FOLIOModule {
  id: string;
  name: string;
  category: 'ui' | 'ui-plugin' | 'ui-handler' | 'stripes' | 'platform' | 'mod' | 'edge' | 'mgr' | 'app' | 'other';
  description: string;
  github?: string;
  apiDocs?: string;
  userDocs?: string;
  settings?: string;
  otherDocs?: string;
  repositories?: number;
  tags?: string[];
}

export const folioModules: FOLIOModule[] = [
  // Frontend UI Repos
  {
    id: 'ui-acquisition-units',
    name: 'ui-acquisition-units',
    category: 'ui',
    description: 'Management of Acquisition unit records. The ui-acquisition-units repo is used for the management of Acquisition unit records in FOLIO.',
    github: 'https://github.com/folio-org/ui-acquisition-units',
    settings: 'https://docs.folio.org/docs/settings/settings_acquisition_units/settings_acquisition_units/',
    tags: ['acquisitions', 'units', 'management']
  },
  {
    id: 'ui-agreements',
    name: 'ui-agreements',
    category: 'ui',
    description: 'Stripes front end module for ERM. Management of various E-resource tasks including handling agreements and viewing available E-resources.',
    github: 'https://github.com/folio-org/ui-agreements',
    settings: 'https://docs.folio.org/docs/settings/settings_agreements/settings_agreements/',
    userDocs: 'https://sunflower.docs.folio.org/docs/erm/agreements/',
    tags: ['erm', 'agreements', 'e-resources']
  },
  {
    id: 'ui-authorization-policies',
    name: 'ui-authorization-policies',
    category: 'ui',
    description: 'FOLIO app for Authorization Policies. Stripes UI module for authorization roles requests and related resources.',
    github: 'https://github.com/folio-org/ui-authorization-policies',
    tags: ['authorization', 'policies', 'security']
  },
  {
    id: 'ui-authorization-roles',
    name: 'ui-authorization-roles',
    category: 'ui',
    description: 'FOLIO app for Authorization Roles management.',
    github: 'https://github.com/folio-org/ui-authorization-roles',
    tags: ['authorization', 'roles', 'security']
  },
  {
    id: 'ui-bulk-edit',
    name: 'ui-bulk-edit',
    category: 'ui',
    description: 'Bulk editing functionality for FOLIO records. Allows editing multiple records simultaneously.',
    github: 'https://github.com/folio-org/ui-bulk-edit',
    tags: ['bulk', 'editing', 'productivity']
  },
  {
    id: 'ui-calendar',
    name: 'ui-calendar',
    category: 'ui',
    description: 'FOLIO institutional calendar UI module. Stripes UI module for institutional calendar functions.',
    github: 'https://github.com/folio-org/ui-calendar',
    settings: 'https://docs.folio.org/docs/settings/settings_calendar/settings_calendar/',
    tags: ['calendar', 'scheduling', 'hours']
  },
  {
    id: 'ui-checkin',
    name: 'ui-checkin',
    category: 'ui',
    description: 'Checking in items with simulated scans. Stripes UI module for checking items in with simulated scans of barcodes.',
    github: 'https://github.com/folio-org/ui-checkin',
    userDocs: 'https://sunflower.docs.folio.org/docs/access/check-in/checkin/',
    tags: ['circulation', 'check-in', 'scanning']
  },
  {
    id: 'ui-checkout',
    name: 'ui-checkout',
    category: 'ui',
    description: 'Checking out items with simulated scans. UI module for checking items out with simulated scans of patron card and item barcode.',
    github: 'https://github.com/folio-org/ui-checkout',
    userDocs: 'https://sunflower.docs.folio.org/docs/access/check-out/checkout/',
    tags: ['circulation', 'checkout', 'scanning']
  },
  {
    id: 'ui-circulation',
    name: 'ui-circulation',
    category: 'ui',
    description: 'Circulation management. Stripes UI module for Circulation management including loan policies and rules.',
    github: 'https://github.com/folio-org/ui-circulation',
    settings: 'https://docs.folio.org/docs/settings/settings_circulation/settings_circulation/',
    userDocs: 'https://sunflower.docs.folio.org/docs/access/',
    tags: ['circulation', 'loans', 'policies']
  },
  {
    id: 'ui-circulation-log',
    name: 'ui-circulation-log',
    category: 'ui',
    description: 'Circulation log tracking and auditing.',
    github: 'https://github.com/folio-org/ui-circulation-log',
    userDocs: 'https://sunflower.docs.folio.org/docs/access/circulation-log/circ_log/',
    tags: ['circulation', 'logging', 'audit']
  },
  {
    id: 'ui-claims',
    name: 'ui-claims',
    category: 'ui',
    description: 'Claims management module for FOLIO.',
    github: 'https://github.com/folio-org/ui-claims',
    tags: ['acquisitions', 'claims', 'serials']
  },
  {
    id: 'ui-consortia-settings',
    name: 'ui-consortia-settings',
    category: 'ui',
    description: 'Consortia settings management. Used for the management of consortia settings in FOLIO.',
    github: 'https://github.com/folio-org/ui-consortia-settings',
    tags: ['consortia', 'settings', 'multi-tenant']
  },
  {
    id: 'ui-courses',
    name: 'ui-courses',
    category: 'ui',
    description: 'Course reserves UI for FOLIO. Maintaining information about courses and associated course reserves.',
    github: 'https://github.com/folio-org/ui-courses',
    settings: 'https://docs.folio.org/docs/settings/settings_courses/settings_courses/',
    userDocs: 'https://sunflower.docs.folio.org/docs/access/courses/courses/',
    tags: ['courses', 'reserves', 'education']
  },
  {
    id: 'ui-dashboard',
    name: 'ui-dashboard',
    category: 'ui',
    description: 'A stripes app to display/customise FOLIO widgets. Dashboard customization and widget management.',
    github: 'https://github.com/folio-org/ui-dashboard',
    tags: ['dashboard', 'widgets', 'customization']
  },
  {
    id: 'ui-data-export',
    name: 'ui-data-export',
    category: 'ui',
    description: 'Data export managing. Application for data export functionality.',
    github: 'https://github.com/folio-org/ui-data-export',
    settings: 'https://docs.folio.org/docs/settings/settings_data_export/settings_data_export/',
    userDocs: 'https://sunflower.docs.folio.org/docs/metadata/data-export/',
    tags: ['export', 'data', 'marc']
  },
  {
    id: 'ui-data-import',
    name: 'ui-data-import',
    category: 'ui',
    description: 'Managing batch loader feature. Application for Data Import functionality including MARC records.',
    github: 'https://github.com/folio-org/ui-data-import',
    settings: 'https://docs.folio.org/docs/settings/settings_data_import/settings_data_import/',
    userDocs: 'https://sunflower.docs.folio.org/docs/metadata/data-import/',
    tags: ['import', 'data', 'marc', 'batch']
  },
  {
    id: 'ui-developer',
    name: 'ui-developer',
    category: 'ui',
    description: 'Developer facilities. Stripes UI module for managing developer settings. Not included in production deployments.',
    github: 'https://github.com/folio-org/ui-developer',
    tags: ['developer', 'debugging', 'tools']
  },
  {
    id: 'ui-eholdings',
    name: 'ui-eholdings',
    category: 'ui',
    description: 'FOLIO eholdings App. Manage electronic holdings with EBSCO knowledge base integration.',
    github: 'https://github.com/folio-org/ui-eholdings',
    settings: 'https://docs.folio.org/docs/settings/settings_eholdings/settings_eholdings/',
    userDocs: 'https://sunflower.docs.folio.org/docs/erm/eholdings/',
    tags: ['eholdings', 'ebsco', 'electronic']
  },
  {
    id: 'ui-erm-comparisons',
    name: 'ui-erm-comparisons',
    category: 'ui',
    description: 'Stripes App for ERM Comparison. Compare Agreement and Package objects.',
    github: 'https://github.com/folio-org/ui-erm-comparisons',
    tags: ['erm', 'comparison', 'agreements']
  },
  {
    id: 'ui-erm-usage',
    name: 'ui-erm-usage',
    category: 'ui',
    description: 'Managing ERM usage statistics. Enter credentials for accessing usage data providers and harvest statistics.',
    github: 'https://github.com/folio-org/ui-erm-usage',
    userDocs: 'https://sunflower.docs.folio.org/docs/erm/eusage/',
    tags: ['erm', 'usage', 'statistics', 'counter']
  },
  {
    id: 'ui-finance',
    name: 'ui-finance',
    category: 'ui',
    description: 'Management of ledgers, funds, and budgets. Dashboard with account totals for current fiscal year.',
    github: 'https://github.com/folio-org/ui-finance',
    settings: 'https://docs.folio.org/docs/settings/settings_finance/settings_finance/',
    userDocs: 'https://sunflower.docs.folio.org/docs/acquisitions/finance/',
    tags: ['finance', 'ledgers', 'budgets', 'funds']
  },
  {
    id: 'ui-inventory',
    name: 'ui-inventory',
    category: 'ui',
    description: 'Administrating instances, holdings records and items. Core cataloging interface.',
    github: 'https://github.com/folio-org/ui-inventory',
    settings: 'https://docs.folio.org/docs/settings/settings_inventory/settings_inventory/',
    userDocs: 'https://sunflower.docs.folio.org/docs/metadata/inventory/',
    tags: ['inventory', 'cataloging', 'instances', 'holdings']
  },
  {
    id: 'ui-invoice',
    name: 'ui-invoice',
    category: 'ui',
    description: 'Invoice management for acquisitions workflow.',
    github: 'https://github.com/folio-org/ui-invoice',
    settings: 'https://docs.folio.org/docs/settings/settings_invoices/settings_invoices/',
    userDocs: 'https://sunflower.docs.folio.org/docs/acquisitions/invoices/',
    tags: ['invoices', 'acquisitions', 'finance']
  },
  {
    id: 'ui-licenses',
    name: 'ui-licenses',
    category: 'ui',
    description: 'FOLIO front end module for licenses. Management of licenses for electronic resources.',
    github: 'https://github.com/folio-org/ui-licenses',
    settings: 'https://docs.folio.org/docs/settings/settings_licenses/settings_licenses/',
    userDocs: 'https://sunflower.docs.folio.org/docs/erm/licenses/',
    tags: ['licenses', 'erm', 'legal']
  },
  {
    id: 'ui-lists',
    name: 'ui-lists',
    category: 'ui',
    description: 'Create and manage Lists - queries across multiple modules (missing items, inactive users, etc).',
    github: 'https://github.com/folio-org/ui-lists',
    tags: ['lists', 'queries', 'reporting']
  },
  {
    id: 'ui-marc-authorities',
    name: 'ui-marc-authorities',
    category: 'ui',
    description: 'MARC Authorities module for administrating authority records.',
    github: 'https://github.com/folio-org/ui-marc-authorities',
    userDocs: 'https://sunflower.docs.folio.org/docs/metadata/inventory/marcauthority/',
    tags: ['marc', 'authorities', 'cataloging']
  },
  {
    id: 'ui-notes',
    name: 'ui-notes',
    category: 'ui',
    description: 'FOLIO Notes Helper App. Dealing with notes on all types of objects.',
    github: 'https://github.com/folio-org/ui-notes',
    settings: 'https://docs.folio.org/docs/settings/settings_notes/settings_notes/',
    tags: ['notes', 'annotations', 'collaboration']
  },
  {
    id: 'ui-orders',
    name: 'ui-orders',
    category: 'ui',
    description: 'Purchase orders management for acquisitions.',
    github: 'https://github.com/folio-org/ui-orders',
    settings: 'https://docs.folio.org/docs/settings/settings_orders/settings_orders/',
    userDocs: 'https://sunflower.docs.folio.org/docs/acquisitions/orders/',
    tags: ['orders', 'acquisitions', 'purchasing']
  },
  {
    id: 'ui-organizations',
    name: 'ui-organizations',
    category: 'ui',
    description: 'Managing organization records. Vendor and supplier information management.',
    github: 'https://github.com/folio-org/ui-organizations',
    settings: 'https://docs.folio.org/docs/settings/settings_organizations/settings_organizations/',
    userDocs: 'https://sunflower.docs.folio.org/docs/acquisitions/organizations/',
    tags: ['organizations', 'vendors', 'acquisitions']
  },
  {
    id: 'ui-quick-marc',
    name: 'ui-quick-marc',
    category: 'ui',
    description: 'quickMARC editor. Plugin for quick editing of MARC records.',
    github: 'https://github.com/folio-org/ui-quick-marc',
    userDocs: 'https://sunflower.docs.folio.org/docs/metadata/inventory/quickmarc/',
    tags: ['marc', 'editor', 'cataloging', 'quickmarc']
  },
  {
    id: 'ui-receiving',
    name: 'ui-receiving',
    category: 'ui',
    description: 'Receiving materials in acquisitions workflow.',
    github: 'https://github.com/folio-org/ui-receiving',
    userDocs: 'https://sunflower.docs.folio.org/docs/acquisitions/receiving/',
    tags: ['receiving', 'acquisitions', 'materials']
  },
  {
    id: 'ui-requests',
    name: 'ui-requests',
    category: 'ui',
    description: 'Making requests on items. Patron request management including holds.',
    github: 'https://github.com/folio-org/ui-requests',
    userDocs: 'https://sunflower.docs.folio.org/docs/access/requests/requests/',
    tags: ['requests', 'holds', 'circulation']
  },
  {
    id: 'ui-users',
    name: 'ui-users',
    category: 'ui',
    description: 'Administrating users. Searching, sorting, filtering, viewing, editing and creating users.',
    github: 'https://github.com/folio-org/ui-users',
    settings: 'https://docs.folio.org/docs/settings/settings_users/settings_users/',
    userDocs: 'https://sunflower.docs.folio.org/docs/users/',
    tags: ['users', 'patrons', 'management']
  },

  // Backend Modules
  {
    id: 'mod-agreements',
    name: 'mod-agreements',
    category: 'mod',
    description: 'Backend for ERM agreements. Handling agreements which control institution access to resources.',
    github: 'https://github.com/folio-org/mod-agreements',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-agreements',
    tags: ['erm', 'agreements', 'backend']
  },
  {
    id: 'mod-authtoken',
    name: 'mod-authtoken',
    category: 'mod',
    description: 'Filtering requests based on JWT tokens. Responsible for checking valid tokens and permissions.',
    github: 'https://github.com/folio-org/mod-authtoken',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-authtoken',
    tags: ['authentication', 'security', 'jwt']
  },
  {
    id: 'mod-calendar',
    name: 'mod-calendar',
    category: 'mod',
    description: 'Calendar functionalities for service points to maintain hours of operation.',
    github: 'https://github.com/folio-org/mod-calendar',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-calendar',
    tags: ['calendar', 'hours', 'service-points']
  },
  {
    id: 'mod-circulation',
    name: 'mod-circulation',
    category: 'mod',
    description: 'FOLIO circulation capabilities. Loan items from inventory with circulation rules.',
    github: 'https://github.com/folio-org/mod-circulation',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-circulation',
    tags: ['circulation', 'loans', 'rules']
  },
  {
    id: 'mod-circulation-storage',
    name: 'mod-circulation-storage',
    category: 'mod',
    description: 'Persistent storage of loans, loan policies, circulation rules, and requests.',
    github: 'https://github.com/folio-org/mod-circulation-storage',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-circulation-storage',
    tags: ['circulation', 'storage', 'database']
  },
  {
    id: 'mod-configuration',
    name: 'mod-configuration',
    category: 'mod',
    description: 'Configuration module based on raml-module-builder backed by PostgreSQL.',
    github: 'https://github.com/folio-org/mod-configuration',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-configuration',
    tags: ['configuration', 'settings', 'database']
  },
  {
    id: 'mod-data-export',
    name: 'mod-data-export',
    category: 'mod',
    description: 'Exporting inventory records in various formats.',
    github: 'https://github.com/folio-org/mod-data-export',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-data-export',
    tags: ['export', 'marc', 'data']
  },
  {
    id: 'mod-data-import',
    name: 'mod-data-import',
    category: 'mod',
    description: 'Uploading files, initial handling and sending records for further processing.',
    github: 'https://github.com/folio-org/mod-data-import',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-data-import',
    tags: ['import', 'marc', 'data', 'batch']
  },
  {
    id: 'mod-email',
    name: 'mod-email',
    category: 'mod',
    description: 'API for delivering email messages and notifications.',
    github: 'https://github.com/folio-org/mod-email',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-email',
    tags: ['email', 'notifications', 'smtp']
  },
  {
    id: 'mod-feesfines',
    name: 'mod-feesfines',
    category: 'mod',
    description: 'Central feesfines management for FOLIO systems.',
    github: 'https://github.com/folio-org/mod-feesfines',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-feesfines',
    tags: ['fees', 'fines', 'payments']
  },
  {
    id: 'mod-finance',
    name: 'mod-finance',
    category: 'mod',
    description: 'Business logic module for finances, ledgers, funds, and budgets.',
    github: 'https://github.com/folio-org/mod-finance',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-finance',
    tags: ['finance', 'budgets', 'ledgers']
  },
  {
    id: 'mod-finance-storage',
    name: 'mod-finance-storage',
    category: 'mod',
    description: 'CRUD module to manage finance-data persistence (ledgers, funds, budgets).',
    github: 'https://github.com/folio-org/mod-finance-storage',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-finance-storage',
    tags: ['finance', 'storage', 'database']
  },
  {
    id: 'mod-graphql',
    name: 'mod-graphql',
    category: 'mod',
    description: 'Executing GraphQL queries. Auto-generated graph from RAML and JSON Schema.',
    github: 'https://github.com/folio-org/mod-graphql',
    tags: ['graphql', 'api', 'query']
  },
  {
    id: 'mod-inventory',
    name: 'mod-inventory',
    category: 'mod',
    description: 'FOLIO compatible inventory module for instances, holdings, and items.',
    github: 'https://github.com/folio-org/mod-inventory',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-inventory',
    tags: ['inventory', 'cataloging', 'metadata']
  },
  {
    id: 'mod-inventory-storage',
    name: 'mod-inventory-storage',
    category: 'mod',
    description: 'Persistent storage for FOLIO inventory data.',
    github: 'https://github.com/folio-org/mod-inventory-storage',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-inventory-storage',
    tags: ['inventory', 'storage', 'database']
  },
  {
    id: 'mod-invoice',
    name: 'mod-invoice',
    category: 'mod',
    description: 'Invoice business logic module for acquisitions.',
    github: 'https://github.com/folio-org/mod-invoice',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-invoice',
    tags: ['invoices', 'acquisitions', 'finance']
  },
  {
    id: 'mod-licenses',
    name: 'mod-licenses',
    category: 'mod',
    description: 'FOLIO service module for licenses management.',
    github: 'https://github.com/folio-org/mod-licenses',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-licenses',
    tags: ['licenses', 'erm', 'legal']
  },
  {
    id: 'mod-login',
    name: 'mod-login',
    category: 'mod',
    description: 'Username/password login. Verifying identity and issuing JWT.',
    github: 'https://github.com/folio-org/mod-login',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-login',
    tags: ['login', 'authentication', 'security']
  },
  {
    id: 'mod-notes',
    name: 'mod-notes',
    category: 'mod',
    description: 'Notes on all types of objects backend storage.',
    github: 'https://github.com/folio-org/mod-notes',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-notes',
    tags: ['notes', 'annotations', 'storage']
  },
  {
    id: 'mod-oai-pmh',
    name: 'mod-oai-pmh',
    category: 'mod',
    description: 'Implementing OAI-PMH metadata harvesting protocol with RESTful API.',
    github: 'https://github.com/folio-org/mod-oai-pmh',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-oai-pmh',
    tags: ['oai-pmh', 'harvesting', 'metadata']
  },
  {
    id: 'mod-orders',
    name: 'mod-orders',
    category: 'mod',
    description: 'Orders business logic module for acquisitions.',
    github: 'https://github.com/folio-org/mod-orders',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-orders',
    tags: ['orders', 'acquisitions', 'purchasing']
  },
  {
    id: 'mod-orders-storage',
    name: 'mod-orders-storage',
    category: 'mod',
    description: 'Storage (CRUD) module for Orders data.',
    github: 'https://github.com/folio-org/mod-orders-storage',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-orders-storage',
    tags: ['orders', 'storage', 'database']
  },
  {
    id: 'mod-organizations',
    name: 'mod-organizations',
    category: 'mod',
    description: 'Organizations business logic module for vendor management.',
    github: 'https://github.com/folio-org/mod-organizations',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-organizations',
    tags: ['organizations', 'vendors', 'acquisitions']
  },
  {
    id: 'mod-organizations-storage',
    name: 'mod-organizations-storage',
    category: 'mod',
    description: 'Persistent storage of organizations data.',
    github: 'https://github.com/folio-org/mod-organizations-storage',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-organizations-storage',
    tags: ['organizations', 'storage', 'database']
  },
  {
    id: 'mod-patron',
    name: 'mod-patron',
    category: 'mod',
    description: 'Allow 3rd party discovery services to perform patron actions via discovery UI.',
    github: 'https://github.com/folio-org/mod-patron',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-patron',
    tags: ['patron', 'discovery', 'api']
  },
  {
    id: 'mod-permissions',
    name: 'mod-permissions',
    category: 'mod',
    description: 'Permissions and permissions/user associations with hierarchy support.',
    github: 'https://github.com/folio-org/mod-permissions',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-permissions',
    tags: ['permissions', 'security', 'authorization']
  },
  {
    id: 'mod-pubsub',
    name: 'mod-pubsub',
    category: 'mod',
    description: 'Publisher-subscriber module for event-driven approach.',
    github: 'https://github.com/folio-org/mod-pubsub',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-pubsub',
    tags: ['pubsub', 'events', 'messaging']
  },
  {
    id: 'mod-quick-marc',
    name: 'mod-quick-marc',
    category: 'mod',
    description: 'Backend for quickMARC editor. Spring Boot-based API for MARC record editing.',
    github: 'https://github.com/folio-org/mod-quick-marc',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-quick-marc',
    tags: ['marc', 'editor', 'quickmarc']
  },
  {
    id: 'mod-search',
    name: 'mod-search',
    category: 'mod',
    description: 'Search functionality for instance and authorities via REST API using CQL.',
    github: 'https://github.com/folio-org/mod-search',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-search',
    tags: ['search', 'elasticsearch', 'cql']
  },
  {
    id: 'mod-sender',
    name: 'mod-sender',
    category: 'mod',
    description: 'Sending messages through delivery channels (email, SMS, etc).',
    github: 'https://github.com/folio-org/mod-sender',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-sender',
    tags: ['notifications', 'messaging', 'delivery']
  },
  {
    id: 'mod-source-record-manager',
    name: 'mod-source-record-manager',
    category: 'mod',
    description: 'Source record manager module for MARC records.',
    github: 'https://github.com/folio-org/mod-source-record-manager',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-source-record-manager',
    tags: ['marc', 'srs', 'records']
  },
  {
    id: 'mod-source-record-storage',
    name: 'mod-source-record-storage',
    category: 'mod',
    description: 'Persistent source record storage for MARC records.',
    github: 'https://github.com/folio-org/mod-source-record-storage',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-source-record-storage',
    tags: ['marc', 'srs', 'storage']
  },
  {
    id: 'mod-tags',
    name: 'mod-tags',
    category: 'mod',
    description: 'Central list of tags that can be assigned to various objects.',
    github: 'https://github.com/folio-org/mod-tags',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-tags',
    tags: ['tags', 'metadata', 'organization']
  },
  {
    id: 'mod-users',
    name: 'mod-users',
    category: 'mod',
    description: 'Domain Model to Manage Users. Central user management for FOLIO.',
    github: 'https://github.com/folio-org/mod-users',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-users',
    tags: ['users', 'patrons', 'management']
  },
  {
    id: 'mod-users-bl',
    name: 'mod-users-bl',
    category: 'mod',
    description: 'Business logic join module for user-centric data access.',
    github: 'https://github.com/folio-org/mod-users-bl',
    apiDocs: 'https://dev.folio.org/reference/api/#mod-users-bl',
    tags: ['users', 'business-logic', 'api']
  },

  // Stripes Framework
  {
    id: 'stripes',
    name: 'stripes',
    category: 'stripes',
    description: 'UI framework for building front-end FOLIO modules. Toolkit for single-page web applications.',
    github: 'https://github.com/folio-org/stripes',
    tags: ['framework', 'ui', 'react']
  },
  {
    id: 'stripes-core',
    name: 'stripes-core',
    category: 'stripes',
    description: 'The core of Stripes platform. Modular platform for React components consuming REST data.',
    github: 'https://github.com/folio-org/stripes-core',
    tags: ['framework', 'core', 'react']
  },
  {
    id: 'stripes-components',
    name: 'stripes-components',
    category: 'stripes',
    description: 'Component library for Stripes. React components and utility functions.',
    github: 'https://github.com/folio-org/stripes-components',
    otherDocs: 'https://folio-org.github.io/stripes-components/',
    tags: ['components', 'ui', 'library']
  },
  {
    id: 'stripes-cli',
    name: 'stripes-cli',
    category: 'stripes',
    description: 'Command line interface for creating, building, and testing Stripes UI modules.',
    github: 'https://github.com/folio-org/stripes-cli',
    tags: ['cli', 'tools', 'development']
  },
  {
    id: 'stripes-connect',
    name: 'stripes-connect',
    category: 'stripes',
    description: 'Declarative REST data access for React components.',
    github: 'https://github.com/folio-org/stripes-connect',
    tags: ['data', 'rest', 'connect']
  },
  {
    id: 'stripes-smart-components',
    name: 'stripes-smart-components',
    category: 'stripes',
    description: 'Suite of smart components that communicate with Okapi web-services.',
    github: 'https://github.com/folio-org/stripes-smart-components',
    tags: ['components', 'smart', 'okapi']
  },

  // Edge APIs
  {
    id: 'edge-oai-pmh',
    name: 'edge-oai-pmh',
    category: 'edge',
    description: 'Edge API for Metadata Harvesting (OAI-PMH Version 2.0).',
    github: 'https://github.com/folio-org/edge-oai-pmh',
    apiDocs: 'https://dev.folio.org/reference/api/#edge-oai-pmh',
    tags: ['edge', 'oai-pmh', 'harvesting']
  },
  {
    id: 'edge-patron',
    name: 'edge-patron',
    category: 'edge',
    description: 'Edge API for 3rd party discovery services. Patron self-service actions (holds, renewals).',
    github: 'https://github.com/folio-org/edge-patron',
    apiDocs: 'https://dev.folio.org/reference/api/#edge-patron',
    tags: ['edge', 'patron', 'discovery']
  },
  {
    id: 'edge-rtac',
    name: 'edge-rtac',
    category: 'edge',
    description: 'Edge API for RTAC (RealTime Availability Check) for discovery services.',
    github: 'https://github.com/folio-org/edge-rtac',
    apiDocs: 'https://dev.folio.org/reference/api/#edge-rtac',
    tags: ['edge', 'rtac', 'availability']
  },
  {
    id: 'edge-sip2',
    name: 'edge-sip2',
    category: 'edge',
    description: '3M Standard Interchange Protocol (SIP) support. Bridge for self-service stations.',
    github: 'https://github.com/folio-org/edge-sip2',
    tags: ['edge', 'sip2', 'self-service']
  },

  // Platforms
  {
    id: 'platform-complete',
    name: 'platform-complete',
    category: 'platform',
    description: 'Complete set of Stripes modules for FOLIO. Full platform with all modules.',
    github: 'https://github.com/folio-org/platform-complete',
    tags: ['platform', 'complete', 'deployment']
  },
  {
    id: 'platform-erm',
    name: 'platform-erm',
    category: 'platform',
    description: 'FOLIO Stripes platform for ERM modules.',
    github: 'https://github.com/folio-org/platform-erm',
    tags: ['platform', 'erm', 'deployment']
  },

  // Infrastructure
  {
    id: 'okapi',
    name: 'okapi',
    category: 'other',
    description: 'Okapi core and modules. Gateway for FOLIO microservices with authentication, authorization, and service discovery.',
    github: 'https://github.com/folio-org/okapi',
    apiDocs: 'https://dev.folio.org/reference/api/#okapi',
    tags: ['okapi', 'gateway', 'infrastructure', 'core']
  },
  {
    id: 'raml-module-builder',
    name: 'raml-module-builder',
    category: 'other',
    description: 'Framework allowing easy module creation based on RAML files.',
    github: 'https://github.com/folio-org/raml-module-builder',
    apiDocs: 'https://dev.folio.org/reference/api/#raml-module-builder',
    tags: ['framework', 'raml', 'development']
  },
];
