"use client";
import React, { useState } from "react";
import {
  X, Sliders, Palette, Type, Clock, Save, Download, Upload, Check, RefreshCw
} from "lucide-react";
import { MARVA_DIACRITICS, MARVA_TEXT_MACROS } from "../../../services/marvaService";

export interface MarvaPreferences {
  mandatoryColor: string;
  defaultFieldColor: string;
  dataChangedColor: string;
  workColor: string;
  instanceColor: string;
  itemColor: string;
  hubColor: string;
  showDiacriticBar: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  layoutMode: 'split' | 'stacked' | 'compact';
}

export const DEFAULT_MARVA_PREFERENCES: MarvaPreferences = {
  mandatoryColor: "#ef4444",
  defaultFieldColor: "#3b82f6",
  dataChangedColor: "#10b981",
  workColor: "#2563eb",
  instanceColor: "#ea580c",
  itemColor: "#059669",
  hubColor: "#7c3aed",
  showDiacriticBar: true,
  autoSave: true,
  autoSaveInterval: 30,
  layoutMode: "split"
};

interface MarvaPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: MarvaPreferences;
  onSavePreferences: (prefs: MarvaPreferences) => void;
  isDark?: boolean;
}

export function MarvaPreferencesModal({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  isDark = true
}: MarvaPreferencesModalProps) {
  const [localPrefs, setLocalPrefs] = useState<MarvaPreferences>(preferences);
  const [activeSubTab, setActiveSubTab] = useState<'colors' | 'macros' | 'layout' | 'data'>('colors');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePreferences(localPrefs);
    try {
      localStorage.setItem("marva-user-preferences", JSON.stringify(localPrefs));
    } catch {}
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    setLocalPrefs(DEFAULT_MARVA_PREFERENCES);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localPrefs, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "marva-preferences.json");
    dlAnchor.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setLocalPrefs({ ...DEFAULT_MARVA_PREFERENCES, ...parsed });
        } catch (err) {
          alert("Invalid preferences JSON file");
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border ${
          isDark ? "bg-[#0d131f]/95 border-white/10 text-white" : "bg-white/95 border-gray-200 text-gray-900"
        }`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Marva Preferences & Customization</h2>
              <p className="text-xs text-gray-400">Library of Congress Marva User Manual Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-white/[0.02]">
          {[
            { id: 'colors', label: 'Field Colors', icon: Palette },
            { id: 'macros', label: 'Diacritics & Macros', icon: Type },
            { id: 'layout', label: 'Layout & Auto-Save', icon: Clock },
            { id: 'data', label: 'Import / Export', icon: Download }
          ].map((t) => {
            const Icon = t.icon;
            const active = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                  active
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeSubTab === 'colors' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
                Configure field visual states conforming to the LC Marva color model. Mandatory fields and modified fields will dynamically adopt these shades.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mandatory Color */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <label className="block text-xs font-bold text-gray-300">
                    Mandatory Field Color (Required)
                  </label>
                  <p className="text-[11px] text-gray-400">Color used to highlight required LC BIBFRAME fields.</p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={localPrefs.mandatoryColor}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, mandatoryColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black/30 border border-white/10">
                      {localPrefs.mandatoryColor}
                    </span>
                  </div>
                </div>

                {/* Data Changed Color */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <label className="block text-xs font-bold text-gray-300">
                    Data Changed Color (Dirty State)
                  </label>
                  <p className="text-[11px] text-gray-400">Color applied to any field edited by the cataloger.</p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={localPrefs.dataChangedColor}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, dataChangedColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black/30 border border-white/10">
                      {localPrefs.dataChangedColor}
                    </span>
                  </div>
                </div>

                {/* Work Component Tint */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <label className="block text-xs font-bold text-blue-400">
                    Work Component Tint (Marva Blue)
                  </label>
                  <p className="text-[11px] text-gray-400">Primary header and border accent for Work fields.</p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={localPrefs.workColor}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, workColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black/30 border border-white/10">
                      {localPrefs.workColor}
                    </span>
                  </div>
                </div>

                {/* Instance Component Tint */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <label className="block text-xs font-bold text-amber-500">
                    Instance Component Tint (Marva Peach)
                  </label>
                  <p className="text-[11px] text-gray-400">Primary header and border accent for Instance fields.</p>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={localPrefs.instanceColor}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, instanceColor: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black/30 border border-white/10">
                      {localPrefs.instanceColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Box */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-gray-400">Live Field State Preview</span>
                <div className="flex flex-wrap gap-3 pt-1">
                  <div
                    className="px-3 py-2 rounded-xl text-xs font-medium border"
                    style={{ borderColor: localPrefs.mandatoryColor, color: localPrefs.mandatoryColor, background: `${localPrefs.mandatoryColor}15` }}
                  >
                    Mandatory Field * (e.g. Title, Instance)
                  </div>
                  <div
                    className="px-3 py-2 rounded-xl text-xs font-medium border"
                    style={{ borderColor: localPrefs.dataChangedColor, color: localPrefs.dataChangedColor, background: `${localPrefs.dataChangedColor}15` }}
                  >
                    Data Changed (Modified by Cataloger)
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'macros' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div>
                  <h4 className="text-xs font-bold text-white">Enable Quick Diacritics Bar</h4>
                  <p className="text-[11px] text-gray-400">Shows LC Marva floating accent toolbar for fast non-Latin transliteration.</p>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.showDiacriticBar}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, showDiacriticBar: e.target.checked })}
                  className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300">Available Marva Diacritics</h4>
                <div className="grid grid-cols-5 gap-2">
                  {MARVA_DIACRITICS.map((d) => (
                    <div key={d.name} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-lg font-bold block text-sky-400">{d.char}</span>
                      <span className="text-[10px] text-gray-400 block truncate">{d.name}</span>
                      <span className="text-[9px] font-mono text-gray-500">{d.shortcut}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-gray-300">Available Text Expansion Macros</h4>
                <div className="space-y-1.5">
                  {MARVA_TEXT_MACROS.map((m) => (
                    <div key={m.trigger} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <div className="flex items-center gap-2 font-mono text-sky-400 font-bold">
                        <span>{m.trigger}</span>
                        <span className="text-gray-400 font-normal">→</span>
                        <span className="text-gray-200 font-normal text-xs">{m.expansion}</span>
                      </div>
                      <span className="text-[10px] text-gray-500">{m.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'layout' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block">Cataloging Layout Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'split', label: 'Split Side-by-Side', desc: 'Work on left, Instance on right (LC Recommended)' },
                    { id: 'stacked', label: 'Stacked Cards', desc: 'Vertical scrolling cards with full width' },
                    { id: 'compact', label: 'Compact Tabbed', desc: 'Single panel with quick switching' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLocalPrefs({ ...localPrefs, layoutMode: l.id as any })}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        localPrefs.layoutMode === l.id
                          ? "bg-sky-500/10 border-sky-500 text-sky-400"
                          : "bg-white/[0.02] border-white/10 text-gray-300 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="text-xs font-bold block">{l.label}</span>
                      <span className="text-[10px] text-gray-400 block mt-1">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Marva Auto-Save</h4>
                    <p className="text-[11px] text-gray-400">Automatically persist record drafts to local cache and database.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localPrefs.autoSave}
                    onChange={(e) => setLocalPrefs({ ...localPrefs, autoSave: e.target.checked })}
                    className="w-5 h-5 rounded accent-sky-500 cursor-pointer"
                  />
                </div>

                {localPrefs.autoSave && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-gray-300">Auto-save interval:</span>
                    <select
                      value={localPrefs.autoSaveInterval}
                      onChange={(e) => setLocalPrefs({ ...localPrefs, autoSaveInterval: parseInt(e.target.value, 10) })}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white"
                    >
                      <option value="15">Every 15 seconds</option>
                      <option value="30">Every 30 seconds</option>
                      <option value="60">Every 1 minute</option>
                      <option value="120">Every 2 minutes</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white">Export & Backup Preferences</h4>
                <p className="text-[11px] text-gray-400">Download your color choices, macro settings, and layout customizations as a JSON file.</p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Preferences JSON
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white">Import Preferences</h4>
                <p className="text-[11px] text-gray-400">Restore preferences from a previously saved Marva JSON file.</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Select JSON File
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset to Defaults
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:from-sky-400 hover:to-blue-500 transition-all"
            >
              {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {savedNotice ? "Saved!" : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
