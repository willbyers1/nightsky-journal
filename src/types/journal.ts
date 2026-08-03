import { ObserverLocation } from './astro';

export interface JournalEntry {
  id: string;
  createdAt: string;
  title: string;
  observationDate: string; // YYYY-MM-DD
  observationTime: string; // HH:MM
  location: ObserverLocation;
  skyConditions: 'clear' | 'partly-cloudy' | 'hazy' | 'overcast';
  seeing: 'poor' | 'fair' | 'good' | 'excellent';
  equipment?: string;
  objectsObserved: string[];
  notes: string;
  tags?: string[];
}
