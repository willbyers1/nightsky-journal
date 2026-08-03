import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, Moon, Sun, Compass, Orbit, Star, BookOpen } from 'lucide-react';
import { VisiblePlanet, VisibleConstellation } from '../types/astro';
import { calculateTwilight } from '../services/astro';

interface VisibleObjectsListProps {
  date: Date;
  location: { latitude: number; longitude: number; label?: string };
  planets: VisiblePlanet[];
  constellations: VisibleConstellation[];
  onLogQuickstart: (objectName: string) => void;
}

export default function VisibleObjectsList({
  date,
  location,
  planets,
  constellations,
  onLogQuickstart
}: VisibleObjectsListProps) {
  const [activeTab, setActiveTab] = useState<'planets' | 'constellations' | 'twilight'>('planets');

  // Compute twilights
  const twilight = calculateTwilight(date, location.latitude, location.longitude);

  return (
    <div className="relative border border-cyan-500/30 bg-slate-950/85 p-5 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.15)] font-mono text-cyan-400">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

      {/* Title */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Orbit className="w-5 h-5 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
          <h2 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase">
            SOLAR SYSTEM & SECTOR OBSERVED OBJECTS
          </h2>
        </div>
        {/* Twilight simple indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${twilight.isDark ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[10px] text-cyan-500 uppercase">
            {twilight.isDark ? 'DARK-SKY ACTIVE' : 'DAYLIGHT INHIBIT'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 text-xs">
        <button
          onClick={() => setActiveTab('planets')}
          className={`flex-1 py-2 border transition-all uppercase font-semibold ${
            activeTab === 'planets'
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-400'
              : 'bg-transparent text-cyan-600 border-cyan-950 hover:text-cyan-400 hover:border-cyan-500/30'
          } rounded`}
        >
          PLANETS & MOON
        </button>
        <button
          onClick={() => setActiveTab('constellations')}
          className={`flex-1 py-2 border transition-all uppercase font-semibold ${
            activeTab === 'constellations'
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-400'
              : 'bg-transparent text-cyan-600 border-cyan-950 hover:text-cyan-400 hover:border-cyan-500/30'
          } rounded`}
        >
          CONSTELLATIONS & CLUSTERS
        </button>
        <button
          onClick={() => setActiveTab('twilight')}
          className={`flex-1 py-2 border transition-all uppercase font-semibold ${
            activeTab === 'twilight'
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-400'
              : 'bg-transparent text-cyan-600 border-cyan-950 hover:text-cyan-400 hover:border-cyan-500/30'
          } rounded`}
        >
          EPHEMERIS & TWILIGHT
        </button>
      </div>

      {/* Planets Tab */}
      {activeTab === 'planets' && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cyan-500/20 text-cyan-500 uppercase text-[10px]">
                  <th className="py-2">BODY</th>
                  <th className="py-2">ALTITUDE</th>
                  <th className="py-2">AZIMUTH / DIR</th>
                  <th className="py-2">MAGNITUDE</th>
                  <th className="py-2">RISE/SET (LOCAL)</th>
                  <th className="py-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {planets.map((planet) => {
                  const isVisible = planet.altitude > 0;
                  return (
                    <tr
                      key={planet.name}
                      className={`hover:bg-cyan-950/20 transition-all ${
                        isVisible ? 'text-cyan-300 font-medium' : 'text-cyan-700/60'
                      }`}
                    >
                      <td className="py-3 flex items-center gap-1.5">
                        {isVisible ? (
                          <Eye className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-cyan-700/60 shrink-0" />
                        )}
                        <span className="tracking-wide font-bold">{planet.name.toUpperCase()}</span>
                      </td>
                      <td className="py-3">
                        {planet.altitude.toFixed(1)}°
                        {isVisible && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1 rounded ml-1">
                            VISIBLE
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {planet.azimuth.toFixed(1)}°
                        {isVisible && (
                          <span className="text-cyan-400 font-bold ml-1">
                            ({getDirectionLabel(planet.azimuth)})
                          </span>
                        )}
                      </td>
                      <td className="py-3">{planet.magnitude.toFixed(2)}</td>
                      <td className="py-3 text-[10px]">
                        R: {planet.riseTime} / S: {planet.setTime}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onLogQuickstart(planet.name)}
                          className="px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 rounded text-[10px] uppercase font-bold transition-all inline-flex items-center gap-1"
                          title="Log observation"
                        >
                          <BookOpen className="w-3 h-3" /> LOG
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-cyan-600 uppercase">
            * NOTE: RE-CALCULATION LIVE. MAGNITUDES COMPUTED VIA DYNAMIC PLANETARY GEOMETRY FORMULAS.
          </p>
        </div>
      )}

      {/* Constellations Tab */}
      {activeTab === 'constellations' && (
        <div className="space-y-3">
          <div className="overflow-y-auto max-h-[350px] pr-1 space-y-2.5">
            {constellations.map((constellation) => (
              <div
                key={constellation.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-cyan-500/15 bg-cyan-950/10 rounded hover:bg-cyan-950/20 transition-all text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-cyan-300 uppercase tracking-wide">
                      {constellation.name}
                    </span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.2 rounded">
                      RESOLVED {constellation.starsAboveHorizon}/{constellation.starsCount}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-500 uppercase flex flex-wrap gap-x-3">
                    <span>AVG ALTITUDE: <strong className="text-cyan-400">{constellation.averageAltitude.toFixed(1)}°</strong></span>
                    <span>BEARING: <strong className="text-cyan-400">{constellation.direction}</strong></span>
                    <span>BRIGHTEST STAR MAG: <strong className="text-cyan-400">{constellation.brightestStarMagnitude.toFixed(2)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 sm:mt-0 justify-between sm:justify-end">
                  <span className="text-[10px] bg-cyan-900/30 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded uppercase">
                    {constellation.bestViewingTime}
                  </span>
                  <button
                    onClick={() => onLogQuickstart(constellation.name)}
                    className="px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 rounded text-[10px] uppercase font-bold transition-all"
                  >
                    LOG
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-cyan-600 uppercase">
            * SECTORS CLASSIFIED BY SPATIAL CLUSTERING OF OBSERVABLE SPECTRAL SOURCES.
          </p>
        </div>
      )}

      {/* Twilight Tab */}
      {activeTab === 'twilight' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-cyan-950/20 p-4 border border-cyan-500/10 rounded">
            <div className="text-cyan-300 uppercase font-bold text-[10px] tracking-wider flex items-center gap-1">
              <Sun className="w-4 h-4 text-amber-500" />
              SOLAR TELEMETRY
            </div>
            <div className="space-y-1 text-cyan-400 text-[11px]">
              <div className="flex justify-between">
                <span>SUNRISE CHRONO:</span>
                <span className="text-cyan-200">{twilight.sunrise} LOCAL</span>
              </div>
              <div className="flex justify-between">
                <span>SUNSET CHRONO:</span>
                <span className="text-cyan-200">{twilight.sunset} LOCAL</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 bg-cyan-950/20 p-4 border border-cyan-500/10 rounded">
            <div className="text-cyan-300 uppercase font-bold text-[10px] tracking-wider flex items-center gap-1">
              <Moon className="w-4 h-4 text-slate-400" />
              TWILIGHT MATRIX (PM/AM)
            </div>
            <div className="space-y-1.5 text-cyan-400 text-[11px]">
              <div className="flex justify-between">
                <span>CIVIL TWILIGHT:</span>
                <span className="text-cyan-200">{twilight.civilTwilightEvening} / {twilight.civilTwilightMorning}</span>
              </div>
              <div className="flex justify-between">
                <span>ASTRONOMICAL:</span>
                <span className="text-cyan-200">{twilight.astronomicalTwilightEvening} / {twilight.astronomicalTwilightMorning}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-cyan-950/30 border border-cyan-500/20 p-3.5 rounded text-cyan-300 text-[10px] flex items-center gap-2 uppercase">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse shrink-0" />
            <span>
              ASTRONOMICAL OBSERVED WINDOW tonight is active when solar altitude descends below -18 degrees (at {twilight.astronomicalTwilightEvening}). Atmospheric refraction is calibrated automatically.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to get simple azimuth directions
function getDirectionLabel(azimuthDeg: number): string {
  const normAz = (azimuthDeg % 360 + 360) % 360;
  if (normAz >= 337.5 || normAz < 22.5) return 'N';
  if (normAz >= 22.5 && normAz < 67.5) return 'NE';
  if (normAz >= 67.5 && normAz < 112.5) return 'E';
  if (normAz >= 112.5 && normAz < 157.5) return 'SE';
  if (normAz >= 157.5 && normAz < 202.5) return 'S';
  if (normAz >= 202.5 && normAz < 247.5) return 'SW';
  if (normAz >= 247.5 && normAz < 292.5) return 'W';
  return 'NW';
}
