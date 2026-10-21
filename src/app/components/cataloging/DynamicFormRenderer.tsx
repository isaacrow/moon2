/**
 * Dynamic Form Renderer
 * Renders cataloging forms based on template definitions and property registry
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { TemplateSection, TemplateField } from '../../../services/templateEngine';
import { getPropertyByName, BibframePropertyDefinition } from '../../../services/bibframePropertyRegistry';
import { AuthoritySelect } from './AuthoritySelect';
import {
  searchAllAuthorities,
  searchLanguages,
  searchCarriers,
  searchMediaTypes,
  searchCountries,
  AuthorityResult
} from '../../../services/authoritySearch';

interface DynamicFormRendererProps {
  sections: TemplateSection[];
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export function DynamicFormRenderer({ sections, data, onChange }: DynamicFormRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded !== false).map(s => s.title))
  );

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <SectionRenderer
          key={idx}
          section={section}
          expanded={expandedSections.has(section.title)}
          onToggle={() => toggleSection(section.title)}
          data={data}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function SectionRenderer({
  section,
  expanded,
  onToggle,
  data,
  onChange
}: {
  section: TemplateSection;
  expanded: boolean;
  onToggle: () => void;
  data: Record<string, any>;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 flex items-center justify-between transition-all"
        type="button"
      >
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Section Content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {section.fields.map((field, idx) => (
            <FieldRenderer
              key={idx}
              field={field}
              value={data[field.property]}
              onChange={(value) => onChange(field.property, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange
}: {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
}) {
  const property = getPropertyByName(field.property);
  if (!property) {
    return (
      <div className="text-red-600">
        Property not found: {field.property}
      </div>
    );
  }

  const isRequired = field.required ?? property.required;
  const isRepeatable = field.repeatable ?? property.repeatable;

  // Handle repeatable fields
  if (isRepeatable && property.type !== 'structured') {
    return (
      <RepeatableFieldRenderer
        property={property}
        values={Array.isArray(value) ? value : value ? [value] : []}
        onChange={onChange}
        isRequired={isRequired}
      />
    );
  }

  // Handle structured fields (Title, Contribution, etc.)
  if (property.type === 'structured') {
    return (
      <StructuredFieldRenderer
        property={property}
        value={value}
        onChange={onChange}
        isRequired={isRequired}
        isRepeatable={isRepeatable}
      />
    );
  }

  // Single field
  return (
    <SingleFieldRenderer
      property={property}
      value={value}
      onChange={onChange}
      isRequired={isRequired}
    />
  );
}

function SingleFieldRenderer({
  property,
  value,
  onChange,
  isRequired
}: {
  property: BibframePropertyDefinition;
  value: any;
  onChange: (value: any) => void;
  isRequired: boolean;
}) {
  const getAuthoritySearch = () => {
    if (property.controlledVocab === 'languages') return searchLanguages;
    if (property.controlledVocab === 'carriers') return searchCarriers;
    if (property.controlledVocab === 'mediaTypes') return searchMediaTypes;
    if (property.controlledVocab === 'countries') return searchCountries;
    
    // Default to subject search
    return (q: string) => searchAllAuthorities(q, 'subject');
  };

  return (
    <div className="space-y-2">
      {property.type === 'authority' ? (
        <AuthoritySelect
          label={property.label}
          value={value}
          onChange={onChange}
          onSearch={getAuthoritySearch()}
          placeholder={property.inputHint || `Search ${property.label.toLowerCase()}...`}
          required={isRequired}
          allowCustom
        />
      ) : property.type === 'textarea' ? (
        <>
          <label className="block text-sm font-semibold text-gray-700">
            {property.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.inputHint || property.description}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      ) : property.type === 'year' ? (
        <>
          <label className="block text-sm font-semibold text-gray-700">
            {property.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
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
        </>
      ) : property.type === 'date' ? (
        <>
          <label className="block text-sm font-semibold text-gray-700">
            {property.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      ) : (
        <>
          <label className="block text-sm font-semibold text-gray-700">
            {property.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={property.inputHint || property.description}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      )}
      {property.description && !property.inputHint && (
        <p className="text-xs text-gray-500">{property.description}</p>
      )}
    </div>
  );
}

function RepeatableFieldRenderer({
  property,
  values,
  onChange,
  isRequired
}: {
  property: BibframePropertyDefinition;
  values: any[];
  onChange: (values: any[]) => void;
  isRequired: boolean;
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
          {isRequired && <span className="text-red-500 ml-1">*</span>}
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
            <SingleFieldRenderer
              property={{ ...property, label: `${property.label} ${index + 1}` }}
              value={val}
              onChange={(newVal) => updateValue(index, newVal)}
              isRequired={false}
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

function StructuredFieldRenderer({
  property,
  value,
  onChange,
  isRequired,
  isRepeatable
}: {
  property: BibframePropertyDefinition;
  value: any;
  onChange: (value: any) => void;
  isRequired: boolean;
  isRepeatable: boolean;
}) {
  // Handle Title structure
  if (property.shortName === 'bf:title') {
    return (
      <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900">
          {property.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </h4>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Main Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={value?.mainTitle || ''}
            onChange={(e) => onChange({ ...value, mainTitle: e.target.value })}
            placeholder="Enter main title"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
          <input
            type="text"
            value={value?.subtitle || ''}
            onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
            placeholder="Enter subtitle"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  }

  // Handle Contribution structure
  if (property.shortName === 'bf:contribution') {
    const contributions = Array.isArray(value) ? value : value ? [value] : [{ agent: null, role: 'aut' }];

    const addContribution = () => {
      onChange([...contributions, { agent: null, role: 'aut' }]);
    };

    const updateContribution = (index: number, field: string, val: any) => {
      const updated = [...contributions];
      updated[index][field] = val;
      onChange(updated);
    };

    const removeContribution = (index: number) => {
      onChange(contributions.filter((_: any, i: number) => i !== index));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            {property.label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <button
            onClick={addContribution}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition-all"
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Contributor
          </button>
        </div>

        {contributions.map((contrib: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Contributor {index + 1}</span>
              {contributions.length > 1 && (
                <button
                  onClick={() => removeContribution(index)}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  type="button"
                >
                  Remove
                </button>
              )}
            </div>

            <AuthoritySelect
              label="Agent"
              value={contrib.agent}
              onChange={(val) => updateContribution(index, 'agent', val)}
              onSearch={(q) => searchAllAuthorities(q, 'person')}
              placeholder="Search for person or organization..."
              required
              allowCustom
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={contrib.role || 'aut'}
                onChange={(e) => updateContribution(index, 'role', e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="aut">Author (aut)</option>
                <option value="edt">Editor (edt)</option>
                <option value="trl">Translator (trl)</option>
                <option value="ill">Illustrator (ill)</option>
                <option value="ctb">Contributor (ctb)</option>
                <option value="cre">Creator (cre)</option>
                <option value="pht">Photographer (pht)</option>
                <option value="com">Compiler (com)</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Generic structured field
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {property.label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            onChange(e.target.value);
          }
        }}
        rows={4}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
