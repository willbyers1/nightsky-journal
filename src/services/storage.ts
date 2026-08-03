import { JournalEntry } from '../types/journal';

const STORAGE_KEY = 'nightsky_journal_entries';

const DEFAULT_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    title: 'Jupiter & Saturn Ring Telescopic Scan',
    observationDate: '2026-07-18',
    observationTime: '23:30',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      label: 'San Francisco, CA'
    },
    skyConditions: 'clear',
    seeing: 'excellent',
    equipment: '8-inch Dobsonian Telescope',
    objectsObserved: ['Jupiter', 'Saturn', 'Orion Nebula M42'],
    notes: 'Incredible clarity tonight! The Galilean moons of Jupiter (Io, Europa, Ganymede, Callisto) were perfectly lined up. Saturn\'s rings were tilted beautifully with the Cassini Division clearly visible at 150x magnification. Explored the Orion Nebula briefly as it rose, showing magnificent gas filaments under clear dark-sky conditions.',
    tags: ['Jupiter', 'Planets', 'Nebula']
  },
  {
    id: 'entry-2',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    title: 'Lunar Crescent & Vega Binocular Scan',
    observationDate: '2026-07-19',
    observationTime: '22:15',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      label: 'Brooklyn, NY'
    },
    skyConditions: 'partly-cloudy',
    seeing: 'fair',
    equipment: 'Naked Eye & 10x50 Binoculars',
    objectsObserved: ['Moon', 'Vega'],
    notes: 'Strong light pollution but Vega stands out as a brilliant beacon near the zenith. The crescent Moon was striking through binoculars, revealing high-contrast shadow lines along the crater Tycho and Mare Crisium. Some thin high-altitude cirrus clouds drifted past, creating a beautiful lunar halo effect.',
    tags: ['Moon', 'Binoculars']
  }
];

export function getJournalEntries(): JournalEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Seed with some default entries so it doesn't look empty and sad on first load
      saveJournalEntries(DEFAULT_ENTRIES);
      return DEFAULT_ENTRIES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return [];
  }
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
}

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt'>): JournalEntry {
  const newEntry: JournalEntry = {
    ...entry,
    id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };
  const entries = getJournalEntries();
  entries.unshift(newEntry); // Newest entries first
  saveJournalEntries(entries);
  return newEntry;
}

export function updateJournalEntry(updatedEntry: JournalEntry): void {
  const entries = getJournalEntries();
  const index = entries.findIndex(e => e.id === updatedEntry.id);
  if (index !== -1) {
    entries[index] = updatedEntry;
    saveJournalEntries(entries);
  }
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries();
  const filtered = entries.filter(e => e.id !== id);
  saveJournalEntries(filtered);
}
