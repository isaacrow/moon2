/**
 * 🧠 Ontology-Driven Form Renderer
 * Registry-powered, no templates, pure semantic rendering
 */

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Edit2, Link as LinkIcon, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  getPropertiesByDomain, 
  getCategoriesForDomain, 
  getPropertiesByCategory,
  OntologyProperty 
} from '../../../services/ontologyRegistry';
import { GraphStore } from '../../../services/graphStore';
import { AuthoritySelect } from './AuthoritySelect';
import {
  searchAllAuthorities,
  searchLanguages,
  searchCarriers,
  searchMediaTypes,
  searchCountries,
  searchRelators
} from '../../../services/authoritySearch';
import {
  TitleEditorModal,
  ContributionEditorModal,
  ProvisionActivityEditorModal,
  IdentifierEditorModal,
  ClassificationEditorModal
} from './BlankNodeEditors';

// i18n-aware label mapping for ontology properties and categories
const CATEGORY_I18N_MAP: Record<string, string> = {
  'Title Information': 'cat.titleInformation',
  'Contributors': 'cat.contributors',
  'Subject Access': 'cat.subjectAccess',
  'Classification Numbers': 'cat.classificationNumbers',
  'Language & Script': 'cat.languageScript',
  'Content Description': 'cat.contentDescription',
  'Publication & Distribution': 'cat.publicationDistribution',
  'Identifiers': 'cat.identifiers',
  'Physical Description': 'cat.physicalDescription',
  'Series Area': 'cat.seriesArea',
  'Notes & Annotations': 'cat.notesAnnotations',
  'Holdings & Access': 'cat.holdingsAccess',
  'Relationships': 'cat.relationships',
  'Administrative Metadata': 'cat.adminMetadata',
};

const PROPERTY_I18N_MAP: Record<string, string> = {
  'Title': 'ont.title',
  'Main Title': 'ont.mainTitle',
  'Subtitle': 'ont.subtitle',
  'Part Number': 'ont.partNumber',
  'Part Name': 'ont.partName',
  'Contribution': 'ont.contribution',
  'Agent': 'ont.agent',
  'Subject': 'ont.subject',
  'Genre/Form': 'ont.genreForm',
  'Classification': 'ont.classification',
  'Language': 'ont.language',
  'Content Type': 'ont.contentType',
  'Summary': 'ont.summary',
  'Note': 'ont.note',
  'Provision Activity': 'ont.provisionActivity',
  'Identifier': 'ont.identifier',
  'Carrier Type': 'ont.carrier',
  'Media Type': 'ont.media',
  'Extent': 'ont.extent',
  'Dimensions': 'ont.dimensions',
  'Mode of Issuance': 'ont.issuance',
  'Statement of Responsibility': 'ont.responsibilityStatement',
  'Edition Statement': 'ont.editionStatement',
  'Origin Place': 'ont.originPlace',
  'Origin Date': 'ont.originDate',
  'Intended Audience': 'ont.intendedAudience',
  'Table of Contents': 'ont.tableOfContents',
  'Illustrative Content': 'ont.illustrativeContent',
  'Color Content': 'ont.colorContent',
  'Supplementary Content': 'ont.supplementaryContent',
  'Series Statement': 'ont.seriesStatement',
  'Frequency': 'ont.frequencyNote',
  'Copyright Date': 'ont.copyrightDate',
  'Acquisition Source': 'ont.acquisitionSource',
  'Shelf Mark': 'ont.shelfMark',
  'Electronic Locator': 'ont.electronicLocator',
  'Held By': 'ont.heldBy',
  'Item Of': 'ont.itemOf',
  'Instance Of': 'ont.instanceOf',
  'Publication': 'ont.provisionActivity',
};

// Helper to translate a label with i18n fallback
function useTranslatedLabel() {
  const { t } = useTranslation();
  return (label: string) => {
    const key = PROPERTY_I18N_MAP[label];
    if (key) {
      const translated = t(key);
      if (translated !== key) return translated;
    }
    return label;
  };
}

function useTranslatedCategory() {
  const { t } = useTranslation();
  return (category: string) => {
    const key = CATEGORY_I18N_MAP[category];
    if (key) {
      const translated = t(key);
      if (translated !== key) return translated;
    }
    return category;
  };
}

interface OntologyDrivenFormRendererProps {
  entityType: string; // 'Work', 'Expression', 'Instance', 'Item'
  nodeUri: string;
  graphStore: GraphStore;
  onChange: (nodeUri: string, property: string, value: any) => void;
  hiddenFields?: Set<string>;
  onHideField?: (fieldKey: string) => void;
}

export function OntologyDrivenFormRenderer({ 
  entityType, 
  nodeUri, 
  graphStore,
  onChange,
  hiddenFields,
  onHideField,
}: OntologyDrivenFormRendererProps) {
  const categories = getCategoriesForDomain(entityType);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.slice(0, 2)) // Expand first 2 by default
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const node = graphStore.getNode(nodeUri);
  if (!node) return null;

  return (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <div
          key={category}
          className="rounded-[20px] overflow-visible"
          style={{
            position: 'relative',
            zIndex: categories.length - index,
            background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <CategorySection
            category={category}
            entityType={entityType}
            nodeUri={nodeUri}
            node={node}
            expanded={expandedCategories.has(category)}
            onToggle={() => toggleCategory(category)}
            onChange={onChange}
            hiddenFields={hiddenFields}
            onHideField={onHideField}
          />
        </div>
      ))}
    </div>
  );
}

function CategorySection({
  category,
  entityType,
  nodeUri,
  node,
  expanded,
  onToggle,
  onChange,
  hiddenFields,
  onHideField,
}: {
  category: string;
  entityType: string;
  nodeUri: string;
  node: any;
  expanded: boolean;
  onToggle: () => void;
  onChange: (nodeUri: string, property: string, value: any) => void;
  hiddenFields?: Set<string>;
  onHideField?: (fieldKey: string) => void;
}) {
  const allProperties = getPropertiesByCategory(entityType, category);
  const properties = hiddenFields
    ? allProperties.filter(p => !hiddenFields.has(`registry:${p.shortName}`))
    : allProperties;
  const requiredCount = properties.filter(p => p.required).length;

  if (properties.length === 0) return null;

  const translateCategory = useTranslatedCategory();

  return (
    <div className="rounded-[20px] overflow-visible">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between transition-all"
        style={{
          background: "linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
          borderBottom: expanded ? "1px solid rgba(255,255,255,0.1)" : "none",
        }}
        type="button"
      >
        <div className="text-start">
          <h3 className="text-lg font-bold" style={{ color: "rgba(0,0,0,0.85)" }}>{translateCategory(category)}</h3>
          <p className="text-sm mt-1" style={{ color: "rgba(0,0,0,0.5)" }}>
            {properties.length} properties
            {requiredCount > 0 && ` • ${requiredCount} required`}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5" style={{ color: "rgba(0,0,0,0.5)" }} />
        ) : (
          <ChevronDown className="h-5 w-5" style={{ color: "rgba(0,0,0,0.5)" }} />
        )}
      </button>

      {/* Category Content */}
      {expanded && (
        <div
          className="p-6 space-y-6 overflow-visible"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.1) 100%)",
          }}
        >
          {properties.map((property) => (
            <div key={property.shortName} className="relative group overflow-visible">
              <PropertyRenderer
                property={property}
                value={node[property.shortName]}
                onChange={(value) => onChange(nodeUri, property.shortName, value)}
              />
              {onHideField && (
                <button
                  onClick={() => onHideField(`registry:${property.shortName}`)}
                  className="absolute -top-1 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                  style={{
                    background: "rgba(255,59,48,0.9)",
                    border: "2px solid rgba(255,255,255,0.8)",
                    insetInlineEnd: "-4px",
                  }}
                  title={`Hide ${property.label}`}
                  type="button"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyRenderer({
  property,
  value,
  onChange
}: {
  property: OntologyProperty;
  value: any;
  onChange: (value: any) => void;
}) {
  // Handle repeatable properties
  if (property.repeatable && property.rangeType !== 'BlankNode') {
    return (
      <RepeatablePropertyRenderer
        property={property}
        values={Array.isArray(value) ? value : value ? [value] : []}
        onChange={onChange}
      />
    );
  }

  // Handle BlankNode properties
  if (property.rangeType === 'BlankNode') {
    return (
      <BlankNodePropertyRenderer
        property={property}
        value={value}
        onChange={onChange}
      />
    );
  }

  // Single value property
  return (
    <SinglePropertyRenderer
      property={property}
      value={value}
      onChange={onChange}
    />
  );
}

function SinglePropertyRenderer({
  property,
  value,
  onChange
}: {
  property: OntologyProperty;
  value: any;
  onChange: (value: any) => void;
}) {
  const getAuthoritySearch = () => {
    if (property.controlledVocab === 'languages') return searchLanguages;
    if (property.controlledVocab === 'carriers') return searchCarriers;
    if (property.controlledVocab === 'mediaTypes') return searchMediaTypes;
    if (property.controlledVocab === 'countries') return searchCountries;
    if (property.controlledVocab === 'relators') return searchRelators;
    
    // Default to general search
    return (q: string) => searchAllAuthorities(q, 'subject');
  };

  const translateLabel = useTranslatedLabel();

  // Authority-based URI input
  if (property.rangeType === 'URI' || property.inputComponent === 'AuthoritySelect') {
    return (
      <div className="space-y-2">
        <AuthoritySelect
          label={translateLabel(property.label)}
          value={value}
          onChange={onChange}
          onSearch={getAuthoritySearch()}
          placeholder={property.inputHint || `Search ${property.label.toLowerCase()}...`}
          required={property.required}
          allowCustom
        />
        {property.description && (
          <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{property.description}</p>
        )}
        {value && typeof value === 'object' && value.uri && (
          <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(30,80,180,0.8)" }}>
            <LinkIcon className="h-3 w-3" />
            <span className="font-mono">{value.uri}</span>
          </div>
        )}
      </div>
    );
  }

  // Text area
  if (property.inputComponent === 'TextArea') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold" style={{ color: "rgba(0,0,0,0.85)" }}>
          {translateLabel(property.label)}
          {property.required && <span className="ml-1 text-red-600">*</span>}
        </label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={property.inputHint || property.description}
          rows={4}
          className="w-full px-4 py-3 rounded-xl placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            color: "rgba(0,0,0,0.8)",
          }}
        />
        {property.description && (
          <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{property.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(0,0,0,0.4)" }}>
          <FileText className="h-3 w-3" />
          <span>Literal value</span>
        </div>
      </div>
    );
  }

  // Year input
  if (property.inputComponent === 'YearInput') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold" style={{ color: "rgba(0,0,0,0.85)" }}>
          {translateLabel(property.label)}
          {property.required && <span className="ml-1 text-red-600">*</span>}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="YYYY"
          pattern="\d{4}"
          maxLength={4}
          className="w-full px-4 py-3 rounded-xl placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            color: "rgba(0,0,0,0.8)",
          }}
        />
        {property.description && (
          <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{property.description}</p>
        )}
      </div>
    );
  }

  // Date input
  if (property.inputComponent === 'DateInput') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold" style={{ color: "rgba(0,0,0,0.85)" }}>
          {translateLabel(property.label)}
          {property.required && <span className="ml-1 text-red-600">*</span>}
        </label>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            color: "rgba(0,0,0,0.8)",
          }}
        />
        {property.description && (
          <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{property.description}</p>
        )}
      </div>
    );
  }

  // Default text input
  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-semibold" style={{ color: "rgba(0,0,0,0.85)" }}>
        {translateLabel(property.label)}
        {property.required && <span className="ml-1 text-red-600">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={property.inputHint || property.description}
        className="w-full px-4 py-3 rounded-xl placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
          color: "rgba(0,0,0,0.8)",
        }}
      />
      {property.description && (
        <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{property.description}</p>
      )}
    </div>
  );
}

function RepeatablePropertyRenderer({
  property,
  values,
  onChange
}: {
  property: OntologyProperty;
  values: any[];
  onChange: (values: any[]) => void;
}) {
  const addValue = () => {
    onChange([...values, '']);
  };

  const updateValue = (index: number, newValue: any) => {
    const updated = [...values];
    updated[index] = newValue;
    onChange(updated);
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const translateLabel = useTranslatedLabel();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold" style={{ color: "rgba(0,0,0,0.85)" }}>
          {translateLabel(property.label)}
          {property.required && <span className="ml-1 text-red-600">*</span>}
          <span className="text-xs ml-2" style={{ color: "rgba(0,0,0,0.4)" }}>(Repeatable)</span>
        </label>
        <button
          onClick={addValue}
          className="px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all"
          style={{
            background: "rgba(0,0,0,0.06)",
            border: "1px solid rgba(0,0,0,0.12)",
            color: "rgba(0,0,0,0.7)",
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {values.length === 0 && (
        <div className="text-sm italic" style={{ color: "rgba(0,0,0,0.35)" }}>No values added yet</div>
      )}

      {values.map((val, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex-1">
            <SinglePropertyRenderer
              property={{ ...property, label: `${property.label} ${index + 1}`, required: false }}
              value={val}
              onChange={(newVal) => updateValue(index, newVal)}
            />
          </div>
          <button
            onClick={() => removeValue(index)}
            className="px-3 py-2 rounded-xl transition-all mt-7"
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "rgba(180,30,30,0.8)",
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function BlankNodePropertyRenderer({
  property,
  value,
  onChange
}: {
  property: OntologyProperty;
  value: any;
  onChange: (value: any) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenEditor = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setShowModal(true);
  };

  const handleSave = (newValue: any) => {
    onChange(newValue);
    setShowModal(false);
  };

  const renderSummary = () => {
    if (!value) return <span style={{ color: "rgba(0,0,0,0.35)" }}>Not configured</span>;

    if (property.inputComponent === 'TitleEditor') {
      return <span>{value.mainTitle}{value.subtitle && `: ${value.subtitle}`}</span>;
    }

    if (property.inputComponent === 'ContributionEditor') {
      if (Array.isArray(value)) {
        return <span>{value.length} contributor(s)</span>;
      }
      return <span>{value.agent?.label || 'Unknown'} ({value.role})</span>;
    }

    if (property.inputComponent === 'ProvisionActivityEditor') {
      return <span>{value.agent?.label || 'Publisher'} ({value.date})</span>;
    }

    if (property.inputComponent === 'IdentifierEditor') {
      if (Array.isArray(value)) {
        return <span>{value.length} identifier(s)</span>;
      }
      return <span>{value.type}: {value.value}</span>;
    }

    if (property.inputComponent === 'ClassificationEditor') {
      return <span>{value.scheme}: {value.number}</span>;
    }

    return <span className="font-mono text-xs">{JSON.stringify(value).substring(0, 50)}...</span>;
  };

  const translateLabel = useTranslatedLabel();

  return (
    <div className="relative space-y-2">
      <label className="block text-sm font-semibold" style={{ color: "rgba(0,0,0,0.85)" }}>
        {translateLabel(property.label)}
        {property.required && <span className="ml-1 text-red-600">*</span>}
        <span className="text-xs ml-2" style={{ color: "rgba(0,0,0,0.4)" }}>(Structured)</span>
      </label>

      <button
        ref={triggerRef}
        onClick={handleOpenEditor}
        className="w-full px-4 py-3 rounded-xl text-left transition-all group"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "2px dashed rgba(0,0,0,0.12)",
        }}
        type="button"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" style={{ color: "rgba(0,0,0,0.4)" }} />
            <span style={{ color: "rgba(0,0,0,0.6)" }}>{renderSummary()}</span>
          </div>
          <span className="text-xs font-semibold opacity-0 group-hover:opacity-100" style={{ color: "rgba(30,80,180,0.8)" }}>
            Edit →
          </span>
        </div>
      </button>

      {property.description && (
        <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{property.description}</p>
      )}

      {/* Modals */}
      {showModal && property.inputComponent === 'TitleEditor' && (
        <TitleEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} triggerRect={triggerRect} />
      )}
      {showModal && property.inputComponent === 'ContributionEditor' && (
        <ContributionEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} triggerRect={triggerRect} />
      )}
      {showModal && property.inputComponent === 'ProvisionActivityEditor' && (
        <ProvisionActivityEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} triggerRect={triggerRect} />
      )}
      {showModal && property.inputComponent === 'IdentifierEditor' && (
        <IdentifierEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} triggerRect={triggerRect} />
      )}
      {showModal && property.inputComponent === 'ClassificationEditor' && (
        <ClassificationEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} triggerRect={triggerRect} />
      )}
    </div>
  );
}