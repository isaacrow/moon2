/**
 * 🧠 Ontology-Driven Form Renderer
 * Registry-powered, no templates, pure semantic rendering
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Edit2, Link as LinkIcon, FileText } from 'lucide-react';
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

interface OntologyDrivenFormRendererProps {
  entityType: string; // 'Work', 'Expression', 'Instance', 'Item'
  nodeUri: string;
  graphStore: GraphStore;
  onChange: (nodeUri: string, property: string, value: any) => void;
}

export function OntologyDrivenFormRenderer({ 
  entityType, 
  nodeUri, 
  graphStore,
  onChange 
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
      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          entityType={entityType}
          nodeUri={nodeUri}
          node={node}
          expanded={expandedCategories.has(category)}
          onToggle={() => toggleCategory(category)}
          onChange={onChange}
        />
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
  onChange
}: {
  category: string;
  entityType: string;
  nodeUri: string;
  node: any;
  expanded: boolean;
  onToggle: () => void;
  onChange: (nodeUri: string, property: string, value: any) => void;
}) {
  const properties = getPropertiesByCategory(entityType, category);
  const requiredCount = properties.filter(p => p.required).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 flex items-center justify-between transition-all"
        type="button"
      >
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-900">{category}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {properties.length} properties
            {requiredCount > 0 && ` • ${requiredCount} required`}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Category Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {properties.map((property) => (
            <PropertyRenderer
              key={property.shortName}
              property={property}
              value={node[property.shortName]}
              onChange={(value) => onChange(nodeUri, property.shortName, value)}
            />
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

  // Authority-based URI input
  if (property.rangeType === 'URI' || property.inputComponent === 'AuthoritySelect') {
    return (
      <div className="space-y-2">
        <AuthoritySelect
          label={property.label}
          value={value}
          onChange={onChange}
          onSearch={getAuthoritySearch()}
          placeholder={property.inputHint || `Search ${property.label.toLowerCase()}...`}
          required={property.required}
          allowCustom
        />
        {property.description && (
          <p className="text-xs text-gray-500">{property.description}</p>
        )}
        {value && typeof value === 'object' && value.uri && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
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
        <label className="block text-sm font-semibold text-gray-700">
          {property.label}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={property.inputHint || property.description}
          rows={4}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {property.description && (
          <p className="text-xs text-gray-500">{property.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500">
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
        <label className="block text-sm font-semibold text-gray-700">
          {property.label}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="YYYY"
          pattern="\d{4}"
          maxLength={4}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {property.description && (
          <p className="text-xs text-gray-500">{property.description}</p>
        )}
      </div>
    );
  }

  // Date input
  if (property.inputComponent === 'DateInput') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {property.label}
          {property.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {property.description && (
          <p className="text-xs text-gray-500">{property.description}</p>
        )}
      </div>
    );
  }

  // Default text input
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {property.label}
        {property.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={property.inputHint || property.description}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {property.description && (
        <p className="text-xs text-gray-500">{property.description}</p>
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {property.label}
          {property.required && <span className="text-red-500 ml-1">*</span>}
          <span className="text-xs text-gray-500 ml-2">(Repeatable)</span>
        </label>
        <button
          onClick={addValue}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition-all"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {values.length === 0 && (
        <div className="text-gray-500 text-sm italic">No values added yet</div>
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
            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all mt-7"
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

  const handleOpenEditor = () => {
    setShowModal(true);
  };

  const handleSave = (newValue: any) => {
    onChange(newValue);
    setShowModal(false);
  };

  const renderSummary = () => {
    if (!value) return <span className="text-gray-400">Not configured</span>;

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

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {property.label}
        {property.required && <span className="text-red-500 ml-1">*</span>}
        <span className="text-xs text-gray-500 ml-2">(Structured)</span>
      </label>

      <button
        onClick={handleOpenEditor}
        className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg text-left transition-all group"
        type="button"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
            <span className="text-gray-700">{renderSummary()}</span>
          </div>
          <span className="text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100">
            Edit →
          </span>
        </div>
      </button>

      {property.description && (
        <p className="text-xs text-gray-500">{property.description}</p>
      )}

      {/* Modals */}
      {showModal && property.inputComponent === 'TitleEditor' && (
        <TitleEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} />
      )}
      {showModal && property.inputComponent === 'ContributionEditor' && (
        <ContributionEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} />
      )}
      {showModal && property.inputComponent === 'ProvisionActivityEditor' && (
        <ProvisionActivityEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} />
      )}
      {showModal && property.inputComponent === 'IdentifierEditor' && (
        <IdentifierEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} />
      )}
      {showModal && property.inputComponent === 'ClassificationEditor' && (
        <ClassificationEditorModal value={value} onChange={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
