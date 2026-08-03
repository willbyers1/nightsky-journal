import React, { useState, useMemo } from 'react';
import { Search, Calendar, Tag, Trash2, Edit3, ChevronDown, ChevronUp, Download, Upload, Info, Compass, Shield } from 'lucide-react';
import { JournalEntry } from '../types/journal';

interface JournalListProps {
  entries: JournalEntry[];
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onImportEntries: (entries: JournalEntry[]) => void;
}

export default function JournalList({
  entries,
  onEditEntry,
  onDeleteEntry,
  onImportEntries
}: JournalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    entries.forEach(e => {
      if (e.tags) {
        e.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // 1. Search text (matches title, notes, objectsObserved)
      const matchesSearch =
        searchTerm === '' ||
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.objectsObserved.some(o => o.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Selected tag
      const matchesTag =
        selectedTag === '' ||
        (entry.tags && entry.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));

      // 3. Date range
      const matchesStartDate = startDate === '' || entry.observationDate >= startDate;
      const matchesEndDate = endDate === '' || entry.observationDate <= endDate;

      return matchesSearch && matchesTag && matchesStartDate && matchesEndDate;
    });
  }, [entries, searchTerm, selectedTag, startDate, endDate]);

  const handleToggleExpand = (id: string) => {
    setExpandedEntryId(prev => (prev === id ? null : id));
  };

  // Export entries to JSON file
  const handleExportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nightsky-journal-telemetry-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import entries from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          // Verify format simple check
          const isValid = imported.every(item => item && typeof item === 'object' && 'observationDate' in item && 'notes' in item);
          if (isValid) {
            onImportEntries(imported);
            alert(`SUCCESSFULLY SYNCED ${imported.length} TELEMETRY RECORDS TO CORE DISK STORAGE!`);
          } else {
            alert('IMPORT ABORTED: INVALID DATA SPECIFICATION DETECTED.');
          }
        } else {
          alert('IMPORT ABORTED: RECORD ARRAY FORMAT REQUIRED.');
        }
      } catch (err) {
        alert('IMPORT FAILED: DECRYPTION / JSON CORRUPTION ERROR.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative border border-cyan-500/30 bg-slate-950/85 p-5 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.15)] font-mono text-cyan-400">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-cyan-500/20 gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-300" />
          <h2 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase">
            STARSHIP ARCHIVED LOGBOOK ({filteredEntries.length} RECORDS)
          </h2>
        </div>

        {/* Database import/export links */}
        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 transition-colors rounded text-cyan-300"
            title="Download archived logs"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT BACKUP
          </button>
          <label className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 transition-colors rounded text-cyan-300 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> IMPORT RESTORE
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filters Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 text-xs">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="FILTER LOGS OR TARGETS..."
            className="w-full bg-slate-900 border border-cyan-500/20 p-2 pl-8 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded uppercase placeholder-cyan-700 text-[10px]"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-cyan-600" />
        </div>

        {/* Tag Selection */}
        <div className="relative">
          <select
            className="w-full bg-slate-900 border border-cyan-500/20 p-2 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded text-[10px] cursor-pointer"
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
          >
            <option value="">SELECT LOG TAG (ALL)</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Date Start */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-cyan-600">FROM:</span>
          <input
            type="date"
            className="flex-1 bg-slate-900 border border-cyan-500/20 p-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded text-[10px]"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        {/* Date End */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-cyan-600">TO:</span>
          <input
            type="date"
            className="flex-1 bg-slate-900 border border-cyan-500/20 p-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded text-[10px]"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Logs Accordion List */}
      <div className="space-y-2.5">
        {filteredEntries.length === 0 ? (
          <div className="p-8 border border-dashed border-cyan-500/20 bg-slate-950/40 rounded text-center text-cyan-500 text-xs uppercase tracking-widest">
            NO LOG ARCHIVES DETECTED FOR CURRENT TEMPORAL PARAMETERS.
          </div>
        ) : (
          filteredEntries.map(entry => {
            const isExpanded = expandedEntryId === entry.id;
            return (
              <div
                key={entry.id}
                className={`border border-cyan-500/15 rounded bg-slate-950/40 hover:border-cyan-400/40 transition-all`}
              >
                {/* Header view */}
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer text-xs"
                  onClick={() => handleToggleExpand(entry.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300 uppercase tracking-wide">
                        {entry.title}
                      </span>
                      <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.2 rounded font-semibold">
                        {entry.observationDate} ({entry.observationTime})
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-cyan-500/80 uppercase">
                      <span className="flex items-center gap-0.5">
                        <Compass className="w-3 h-3 text-cyan-400" />
                        STATION: {entry.location.label || 'LOCAL'}
                      </span>
                      <span>SKY: {entry.skyConditions}</span>
                      <span>SEEING: {entry.seeing}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.objectsObserved.length > 0 && (
                      <span className="hidden md:inline text-[9px] bg-cyan-900/10 text-cyan-400 px-2 py-0.5 border border-cyan-500/10 rounded">
                        {entry.objectsObserved.length} CELESTIAL TARGETS
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                </div>

                {/* Expanded view */}
                {isExpanded && (
                  <div className="p-4 border-t border-cyan-500/10 bg-cyan-950/10 text-xs space-y-4">
                    {/* Objects list */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-cyan-500 uppercase font-semibold">TARGETS OBSERVED IN SECTOR:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.objectsObserved.map(obj => (
                          <span
                            key={obj}
                            className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/20 rounded text-[10px] text-cyan-300 font-semibold"
                          >
                            ★ {obj}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata attributes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] bg-slate-950/40 p-3 border border-cyan-500/5 rounded">
                      <div>
                        <span className="text-cyan-500">OPTICAL GEAR:</span>
                        <span className="text-cyan-300 ml-1.5 font-medium block sm:inline">
                          {entry.equipment || 'Naked Eye'}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyan-500">COORDINATE LABEL:</span>
                        <span className="text-cyan-300 ml-1.5 font-medium block sm:inline truncate">
                          {entry.location.label || 'Unnamed Station'}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyan-500">ATMOSPHERE REFR:</span>
                        <span className="text-cyan-300 ml-1.5 font-medium block sm:inline capitalize">
                          {entry.skyConditions} / {entry.seeing} seeing
                        </span>
                      </div>
                    </div>

                    {/* Logs Content notes */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-cyan-500 uppercase font-semibold">LOG NOTES DESCRIPTION:</div>
                      <div className="p-3.5 bg-slate-900/60 border border-cyan-500/20 text-cyan-100 rounded leading-relaxed whitespace-pre-wrap font-sans text-xs">
                        {entry.notes}
                      </div>
                    </div>

                    {/* Tags list */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <Tag className="w-3.5 h-3.5 text-cyan-500 mr-1" />
                        {entry.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[9px] text-cyan-400 font-medium tracking-wide bg-cyan-950/30 border border-cyan-500/10 px-1.5 py-0.5 rounded uppercase"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Edit/Delete Actions */}
                    <div className="flex justify-end gap-2.5 pt-3 border-t border-cyan-500/10">
                      <button
                        onClick={() => onEditEntry(entry)}
                        className="px-3 py-1.5 border border-cyan-500/40 hover:bg-cyan-900/40 text-cyan-300 rounded font-semibold uppercase text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> EDIT RECORD
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('CONFIRM LOG TRANSMISSION ERASE PROTOCOL? DATA WILL BE PURGED.')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="px-3 py-1.5 border border-red-500/40 hover:bg-red-950/40 text-red-400 rounded font-semibold uppercase text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> ERASE RECORD
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
