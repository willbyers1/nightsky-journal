import React, { useState, useEffect, useMemo } from 'react';
import { Orbit, Compass, Clock, BookOpen, Plus, Sparkles, Terminal, Info } from 'lucide-react';
import { ObserverLocation, VisiblePlanet, VisibleConstellation } from './types/astro';
import { JournalEntry } from './types/journal';
import { calculatePlanets, calculateConstellations, calculateTwilight } from './services/astro';
import { getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry, saveJournalEntries } from './services/storage';

// Components
import Galaxy from './components/Galaxy';
import LocationDateForm from './components/LocationDateForm';
import SkyChart from './components/SkyChart';
import VisibleObjectsList from './components/VisibleObjectsList';
import JournalEntryForm from './components/JournalEntryForm';
import JournalList from './components/JournalList';

export default function App() {
  // Baseline date-time state
  const [date, setDate] = useState<Date>(new Date());
  
  // Baseline Observer Location state (default to San Francisco coordinates for immediate rendering)
  const [location, setLocation] = useState<ObserverLocation>({
    latitude: 37.7749,
    longitude: -122.4194,
    label: 'SOL-3 Sector (San Francisco, CA)'
  });

  // Journal entries state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  
  // Interface toggle states
  const [isCompilingLog, setIsCompilingLog] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Load entries on mount
  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  // Sync real-time clock baseline ticking (updates date state every minute for accurate tracking)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only tick real-time if compilation/forms are not actively open (to avoid shifting user coordinates mid-edit)
      if (!isCompilingLog && !editingEntry) {
        setDate(new Date());
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isCompilingLog, editingEntry]);

  // Calculations derived from current location & date baseline
  const planets = useMemo(() => {
    return calculatePlanets(date, location.latitude, location.longitude);
  }, [date, location]);

  const constellations = useMemo(() => {
    return calculateConstellations(date, location.latitude, location.longitude);
  }, [date, location]);

  const twilight = useMemo(() => {
    return calculateTwilight(date, location.latitude, location.longitude);
  }, [date, location]);

  // Actions
  const handleSaveEntry = (newOrUpdatedData: Omit<JournalEntry, 'id' | 'createdAt'> | JournalEntry) => {
    if ('id' in newOrUpdatedData) {
      // Updating existing entry
      updateJournalEntry(newOrUpdatedData as JournalEntry);
    } else {
      // Adding new entry
      addJournalEntry(newOrUpdatedData);
    }
    // Refresh list
    setEntries(getJournalEntries());
    // Close forms
    setIsCompilingLog(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    deleteJournalEntry(id);
    setEntries(getJournalEntries());
  };

  const handleImportEntries = (imported: JournalEntry[]) => {
    saveJournalEntries(imported);
    setEntries(imported);
  };

  const handleEditTrigger = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsCompilingLog(true);
    // Scroll smoothly to formulation console
    document.getElementById('compilation-console')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hot-link to instantly start compiling a log centered around a specific target
  const handleLogQuickstart = (objectName: string) => {
    setIsCompilingLog(true);
    setEditingEntry(null);
    
    // Smooth scroll
    setTimeout(() => {
      document.getElementById('compilation-console')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="relative min-h-screen bg-black text-cyan-400 font-mono select-none overflow-x-hidden">
      {/* Background Interactive Nebula effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Galaxy
          density={1.2}
          starSpeed={0.15}
          glowIntensity={0.35}
          twinkleIntensity={0.6}
          rotationSpeed={0.03}
          hueShift={120}
          transparent={true}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Glowing Terminal Header Banner */}
        <header className="relative border border-cyan-500/40 bg-slate-950/90 p-5 rounded-md shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 bg-cyan-950/50 border border-cyan-500/30 rounded-full animate-pulse">
                <Orbit className="w-8 h-8 text-cyan-300" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold tracking-widest text-cyan-100 flex items-center justify-center md:justify-start gap-1">
                  NIGHTSKY-JOURNAL <span className="text-[10px] bg-cyan-900/60 border border-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-400">V1.2.6</span>
                </h1>
                <p className="text-[10px] text-cyan-500 tracking-wider uppercase mt-1">
                  STARSHIP NAVIGATION CONTROL & CELESTIAL METRIC RECORDER
                </p>
              </div>
            </div>

            {/* Quick telemetry indicators */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] bg-slate-900/40 p-2.5 border border-cyan-500/10 rounded">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>OBS-STATION:</span>
                <span className="text-cyan-200 uppercase truncate max-w-[120px]">
                  {location.label ? location.label.split('(')[0] : 'SOL-3'}
                </span>
              </div>
              <div className="h-4 w-px bg-cyan-500/20" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>CHRONOMETER:</span>
                <span className="text-cyan-200">
                  {date.toLocaleTimeString([], { hour12: false })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid System */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Side: Coordinates & Tactical Map (Alt/Az Sky chart Viewport) */}
          <section className="lg:col-span-7 space-y-6">
            <LocationDateForm
              location={location}
              date={date}
              onChangeLocation={setLocation}
              onChangeDate={setDate}
            />

            <SkyChart
              date={date}
              location={location}
              planets={planets}
              constellations={constellations}
            />
          </section>

          {/* Right Side: Visible celestial objects and quick actions */}
          <section className="lg:col-span-5">
            <VisibleObjectsList
              date={date}
              location={location}
              planets={planets}
              constellations={constellations}
              onLogQuickstart={handleLogQuickstart}
            />
          </section>
        </main>

        {/* Floating Quick Action / Compilation Trigger Banner */}
        {!isCompilingLog && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                setEditingEntry(null);
                setIsCompilingLog(true);
                setTimeout(() => {
                  document.getElementById('compilation-console')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-6 py-3.5 bg-cyan-950/70 border border-cyan-400 text-cyan-300 font-bold uppercase rounded-md tracking-wider hover:bg-cyan-900 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2 text-sm"
            >
              <Plus className="w-5 h-5 text-cyan-300" />
              <span>RECORD NEW OBSERVATION LOG ENTRY TONIGHT</span>
            </button>
          </div>
        )}

        {/* Active Log compilation Form Console */}
        {isCompilingLog && (
          <section id="compilation-console" className="scroll-mt-6">
            <JournalEntryForm
              location={location}
              date={date}
              planets={planets}
              constellations={constellations}
              editingEntry={editingEntry}
              onSave={handleSaveEntry}
              onCancel={() => {
                setIsCompilingLog(false);
                setEditingEntry(null);
              }}
            />
          </section>
        )}

        {/* Historic logs list with search, tag filtering, details, backup syncing */}
        <section className="scroll-mt-6">
          <JournalList
            entries={entries}
            onEditEntry={handleEditTrigger}
            onDeleteEntry={handleDeleteEntry}
            onImportEntries={handleImportEntries}
          />
        </section>

        {/* Custom Terminal System Status Footer */}
        <footer className="border-t border-cyan-500/10 pt-5 mt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-cyan-600 uppercase font-mono gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-500" />
            <span>CORE COMPUTER DISK ONLINE // CLIENT-SIDE STORAGE ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-4">
            <span>STATION COORDS: {location.latitude.toFixed(2)}N, {location.longitude.toFixed(2)}E</span>
            <span>DATA ENCRYPTION STANDARD: AES-256 LOCAL</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
