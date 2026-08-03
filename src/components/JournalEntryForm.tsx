import React, { useState, useEffect } from 'react';
import { BookOpen, AlertTriangle, Save, X, Plus, Sparkles } from 'lucide-react';
import { JournalEntry } from '../types/journal';
import { ObserverLocation, VisiblePlanet, VisibleConstellation } from '../types/astro';

interface JournalEntryFormProps {
  location: ObserverLocation;
  date: Date;
  planets: VisiblePlanet[];
  constellations: VisibleConstellation[];
  editingEntry: JournalEntry | null;
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'> | JournalEntry) => void;
  onCancel: () => void;
}

export default function JournalEntryForm({
  location,
  date,
  planets,
  constellations,
  editingEntry,
  onSave,
  onCancel
}: JournalEntryFormProps) {
  // Prepopulate form fields
  const [title, setTitle] = useState('');
  const [observationDate, setObservationDate] = useState('');
  const [observationTime, setObservationTime] = useState('');
  const [skyConditions, setSkyConditions] = useState<'clear' | 'partly-cloudy' | 'hazy' | 'overcast'>('clear');
  const [seeing, setSeeing] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [equipment, setEquipment] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [objectsObserved, setObjectsObserved] = useState<string[]>([]);
  const [customObject, setCustomObject] = useState('');

  const [error, setError] = useState<string | null>(null);

  // Set initial states or load from editingEntry
  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || '');
      setObservationDate(editingEntry.observationDate);
      setObservationTime(editingEntry.observationTime);
      setSkyConditions(editingEntry.skyConditions);
      setSeeing(editingEntry.seeing);
      setEquipment(editingEntry.equipment || '');
      setNotes(editingEntry.notes);
      setObjectsObserved(editingEntry.objectsObserved || []);
      setTagsInput(editingEntry.tags ? editingEntry.tags.join(', ') : '');
    } else {
      // New log entry pre-fills
      setTitle(`Midnight Log: sector ${location.label || 'SOL-3'}`);
      setObservationDate(date.toISOString().split('T')[0]);
      setObservationTime(date.toTimeString().split(' ')[0].substring(0, 5));
      setSkyConditions('clear');
      setSeeing('good');
      setEquipment('Telescope & Naked Eye');
      setNotes('');
      // Pre-select visible planets by default
      const visiblePlanets = planets.filter(p => p.altitude > 0).map(p => p.name);
      setObjectsObserved(visiblePlanets);
      setTagsInput('Astronomy, Space-Log');
    }
  }, [editingEntry, location, date, planets]);

  // Combine visible planets & constellations for user to multi-select
  const visibleSelectionList = useMemo(() => {
    const list: { name: string; type: 'Planet' | 'Constellation' }[] = [];
    planets.forEach(p => {
      if (p.altitude > 0) list.push({ name: p.name, type: 'Planet' });
    });
    constellations.slice(0, 8).forEach(c => {
      list.push({ name: c.name, type: 'Constellation' });
    });
    return list;
  }, [planets, constellations]);

  const toggleObjectSelection = (name: string) => {
    setObjectsObserved(prev =>
      prev.includes(name) ? prev.filter(o => o !== name) : [...prev, name]
    );
  };

  const addCustomObject = () => {
    if (customObject.trim() && !objectsObserved.includes(customObject.trim())) {
      setObjectsObserved(prev => [...prev, customObject.trim()]);
      setCustomObject('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('TRANSMISSION SHIELD ERROR: LOG TITLE CANNOT BE EMPTY.');
      return;
    }
    if (!notes.trim()) {
      setError('TRANSMISSION SHIELD ERROR: OBSERVATION NOTES FIELD REQUIRED.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const savedData = {
      title: title.trim(),
      observationDate,
      observationTime,
      location: editingEntry ? editingEntry.location : location,
      skyConditions,
      seeing,
      equipment: equipment.trim(),
      objectsObserved,
      notes: notes.trim(),
      tags
    };

    if (editingEntry) {
      onSave({
        ...editingEntry,
        ...savedData
      });
    } else {
      onSave(savedData);
    }
  };

  return (
    <div className="relative border border-cyan-500/30 bg-slate-950/90 p-5 rounded-md shadow-[0_0_20px_rgba(6,182,212,0.2)] font-mono text-cyan-400">
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-300" />
          <h2 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase">
            {editingEntry ? 'EDIT OBSERVER LOG TRANSMISSION' : 'COMPILE NEW STARSHIP LOG ENTRY'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-cyan-600 hover:text-cyan-300 transition-colors"
          title="Abort log compilation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">LOG ENTRY TITLE</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-cyan-500/30 p-2.5 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded"
              placeholder="e.g. Sector 4 Cluster Grid Scan"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Date & Time fields */}
          <div>
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">OBSERVATION DATE</label>
            <input
              type="date"
              className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded"
              value={observationDate}
              onChange={e => setObservationDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">OBSERVATION TIME</label>
            <input
              type="time"
              className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded"
              value={observationTime}
              onChange={e => setObservationTime(e.target.value)}
            />
          </div>

          {/* Location coordinate reference display */}
          <div className="md:col-span-2 bg-cyan-950/20 border border-cyan-500/10 p-2 rounded">
            <span className="text-[10px] text-cyan-500 uppercase">TELEMETRY REFERENCE COORDS:</span>
            <span className="text-cyan-300 ml-2 font-bold uppercase">
              {editingEntry ? editingEntry.location.label : location.label} ({editingEntry ? editingEntry.location.latitude.toFixed(4) : location.latitude.toFixed(4)}°N, {editingEntry ? editingEntry.location.longitude.toFixed(4) : location.longitude.toFixed(4)}°E)
            </span>
          </div>

          {/* Sky Conditions & Seeing */}
          <div>
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">SKY CONDITIONS</label>
            <select
              className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded cursor-pointer"
              value={skyConditions}
              onChange={e => setSkyConditions(e.target.value as any)}
            >
              <option value="clear">CLEAR (0-10% OBSCURED)</option>
              <option value="partly-cloudy">PARTLY CLOUDY (10-50% OBSCURED)</option>
              <option value="hazy">HAZY / ATMOSPHERIC NOISE</option>
              <option value="overcast">OVERCAST (INHIBITED VIEW)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">SEEING QUALITY (STEADINESS)</label>
            <select
              className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded cursor-pointer"
              value={seeing}
              onChange={e => setSeeing(e.target.value as any)}
            >
              <option value="excellent">EXCELLENT (0-0.5" EXTREMELY STABLE)</option>
              <option value="good">GOOD (0.5-1.0" MINIMAL FLICKER)</option>
              <option value="fair">FAIR (1.0-2.0" ATMOSPHERIC DISTORTION)</option>
              <option value="poor">POOR (&gt;2.0" HIGH FLUCTUATIONS)</option>
            </select>
          </div>

          {/* Equipment */}
          <div className="md:col-span-2">
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">OPTICS / EQUIPMENT USED</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-cyan-500/30 p-2.5 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded"
              placeholder="e.g. 10x50 Binoculars, Naked Eye, Schmidt-Cassegrain Telescope"
              value={equipment}
              onChange={e => setEquipment(e.target.value)}
            />
          </div>

          {/* Multi-select objects observed */}
          <div className="md:col-span-2">
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">CELESTIAL TARGETS OBSERVED</label>
            <div className="border border-cyan-500/20 bg-slate-900/60 p-3 rounded space-y-3">
              {/* Pre-fill quick clicks */}
              <div className="flex flex-wrap gap-2">
                {visibleSelectionList.map(item => {
                  const isSelected = objectsObserved.includes(item.name);
                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => toggleObjectSelection(item.name)}
                      className={`px-2 py-1 rounded text-[10px] border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950/40 border-cyan-950 text-cyan-700 hover:text-cyan-400'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{item.name.toUpperCase()}</span>
                      <span className="text-[8px] text-cyan-600/80">({item.type[0]})</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom object addition */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ADD CUSTOM COORD / OBJECT TARGET..."
                  className="flex-1 bg-slate-900 border border-cyan-500/20 p-2 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded text-[10px]"
                  value={customObject}
                  onChange={e => setCustomObject(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomObject();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addCustomObject}
                  className="px-3 bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 font-semibold rounded text-[10px]"
                >
                  <Plus className="w-4.5 h-4.5 inline" /> ADD
                </button>
              </div>

              {/* Show selected items list */}
              {objectsObserved.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-cyan-500/10">
                  <span className="text-[9px] text-cyan-500 uppercase mr-1 self-center">CURRENTLY SELECTED:</span>
                  {objectsObserved.map(name => (
                    <span
                      key={name}
                      onClick={() => toggleObjectSelection(name)}
                      className="px-1.5 py-0.5 bg-red-950/20 hover:bg-red-900/40 hover:border-red-500/30 border border-cyan-500/20 rounded text-[9px] text-cyan-300 cursor-pointer transition-colors"
                      title="Click to remove"
                    >
                      {name} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes description field */}
          <div className="md:col-span-2">
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">OBSERVATION LOG DESCRIPTION (FREE-TEXT NOTES)</label>
            <textarea
              className="w-full bg-slate-900 border border-cyan-500/30 p-2.5 h-36 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded text-xs resize-none"
              placeholder="Log atmospheric details, orbital alignment, visual notes, magnitude deviations..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="block text-[10px] text-cyan-500 uppercase mb-1">LOG ENTRY TAGS (SEPARATED BY COMMA)</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-200 focus:outline-none focus:border-cyan-400 rounded"
              placeholder="Planets, Moon, Galaxy, Binoculars, Clear"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded text-red-400 tracking-wider font-semibold uppercase flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-500 font-semibold uppercase rounded transition-colors"
          >
            ABORT ENTRY
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-cyan-950 border border-cyan-400 hover:bg-cyan-900 text-cyan-300 font-bold uppercase rounded flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>TRANSMIT & SAVE TO DISK</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// Hook helper
import { useMemo } from 'react';
