import React, { useState, useMemo } from 'react';
import { Crosshair, Star, Info, Moon, Compass } from 'lucide-react';
import { VisiblePlanet, VisibleConstellation } from '../types/astro';
import { calculatePlottedStars, PlottedStar } from '../services/astro';

interface SkyChartProps {
  date: Date;
  location: { latitude: number; longitude: number; label?: string };
  planets: VisiblePlanet[];
  constellations: VisibleConstellation[];
}

export default function SkyChart({
  date,
  location,
  planets,
  constellations
}: SkyChartProps) {
  const [selectedObject, setSelectedObject] = useState<{
    name: string;
    type: 'Planet' | 'Star' | 'Deep Sky';
    alt: number;
    az: number;
    mag: number;
    extra?: string;
  } | null>(null);

  // Constants for our SVG
  const cx = 250;
  const cy = 250;
  const rMax = 200; // Radius of the horizon circle

  // Calculate stars above horizon
  const starsAboveHorizon = useMemo(() => {
    return calculatePlottedStars(date, location.latitude, location.longitude);
  }, [date, location]);

  // Transform (alt, az) to SVG (x, y) coordinates
  // Center (cx, cy) is zenith (alt = 90). Outer boundary is horizon (alt = 0).
  // Azimuth is clockwise starting from North (up).
  const getCoords = (alt: number, az: number) => {
    // If object is below horizon, clamp or handle appropriately
    const altClamped = Math.max(0, alt);
    // Radius is proportional to Zenith angle (90 - alt)
    const r = rMax * (90 - altClamped) / 90;
    
    // Azimuth = 0 is N (up, -90 deg), 90 is E (right, 0 deg)
    const theta = ((az - 90) * Math.PI) / 180;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    return { x, y };
  };

  // Identify brightest stars for highlights
  const mainStars = useMemo(() => {
    return starsAboveHorizon.slice(0, 15);
  }, [starsAboveHorizon]);

  return (
    <div className="relative border border-cyan-500/30 bg-slate-950/85 p-5 rounded-md shadow-[0_0_20px_rgba(6,182,212,0.1)] font-mono text-cyan-400 flex flex-col items-center">
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

      {/* Header telemetry info */}
      <div className="w-full flex justify-between items-center pb-2 mb-4 border-b border-cyan-500/20 text-xs">
        <div className="flex items-center gap-1.5 uppercase font-semibold text-cyan-300">
          <Crosshair className="w-4 h-4 animate-spin text-cyan-400" />
          TACTICAL VIEWPORT SECTOR
        </div>
        <div className="text-[10px] text-cyan-500">
          FOV: 180° TOPOGRAPHIC PROJECTION
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left Side: Telemetry details */}
        <div className="space-y-4 text-xs order-2 lg:order-1 bg-cyan-950/20 p-4 border border-cyan-500/10 rounded">
          <div className="text-cyan-300 uppercase font-bold border-b border-cyan-500/20 pb-1.5 text-[11px] tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            CONSOLE READOUTS
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-cyan-500">SYSTEM LOCAL TIME:</span>
              <span className="text-cyan-300 font-semibold">
                {date.toLocaleTimeString([], { hour12: false })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-500">LATITUDE COORDS:</span>
              <span className="text-cyan-300">{location.latitude.toFixed(4)}°N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-500">LONGITUDE COORDS:</span>
              <span className="text-cyan-300">{location.longitude.toFixed(4)}°E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-500">VISIBLE PLANETS:</span>
              <span className="text-cyan-300">{planets.filter(p => p.altitude > 0).length} UNITS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-500">RESOLVED CONSTELLATIONS:</span>
              <span className="text-cyan-300">{constellations.length} SECTORS</span>
            </div>
          </div>

          <div className="pt-3 border-t border-cyan-500/20">
            {selectedObject ? (
              <div className="p-2.5 bg-cyan-950/40 border border-cyan-400/30 rounded space-y-1">
                <div className="text-[11px] font-bold text-cyan-200 uppercase flex items-center gap-1">
                  <Info className="w-3 h-3 text-cyan-300" />
                  {selectedObject.name} ({selectedObject.type})
                </div>
                <div className="grid grid-cols-2 text-[10px] text-cyan-400 gap-y-0.5">
                  <span>ALTITUDE:</span>
                  <span className="font-semibold text-cyan-300">{selectedObject.alt.toFixed(1)}°</span>
                  <span>AZIMUTH:</span>
                  <span className="font-semibold text-cyan-300">{selectedObject.az.toFixed(1)}°</span>
                  <span>MAGNITUDE:</span>
                  <span className="font-semibold text-cyan-300">{selectedObject.mag.toFixed(2)}</span>
                  {selectedObject.extra && (
                    <>
                      <span>CONSTELLATION:</span>
                      <span className="font-semibold text-cyan-300 truncate">{selectedObject.extra}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/40 border border-cyan-500/10 rounded text-center text-[10px] text-cyan-500 uppercase tracking-wide">
                SELECT CELESTIAL TARGET IN VIEWPORT FOR SCANNER FEED
              </div>
            )}
          </div>
        </div>

        {/* Center: Interactive SVG Sky Map */}
        <div className="flex justify-center order-1 lg:order-2">
          <div className="relative w-full max-w-[360px] aspect-square rounded-full border border-cyan-500/20 bg-radial-at-c from-slate-950 via-slate-950 to-black p-1 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full select-none cursor-crosshair"
            >
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Sky background overlay */}
              <circle cx={cx} cy={cy} r={rMax} fill="rgba(2, 6, 23, 0.5)" />

              {/* Altitude Grid Circles (30°, 60° Altitudes) */}
              <circle
                cx={cx}
                cy={cy}
                r={(rMax * 2) / 3}
                fill="none"
                stroke="rgba(6, 182, 212, 0.15)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={cx} y={cy - (rMax * 2) / 3 + 12} fill="rgba(6,182,212,0.4)" fontSize="8" textAnchor="middle">ALT: 30°</text>

              <circle
                cx={cx}
                cy={cy}
                r={rMax / 3}
                fill="none"
                stroke="rgba(6, 182, 212, 0.15)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={cx} y={cy - rMax / 3 + 12} fill="rgba(6,182,212,0.4)" fontSize="8" textAnchor="middle">ALT: 60°</text>

              {/* Horizon / Outer Edge */}
              <circle
                cx={cx}
                cy={cy}
                r={rMax}
                fill="none"
                stroke="rgba(6, 182, 212, 0.5)"
                strokeWidth="1.5"
              />

              {/* Cardinal Azimuth Axes */}
              <line
                x1={cx}
                y1={cy - rMax}
                x2={cx}
                y2={cy + rMax}
                stroke="rgba(6, 182, 212, 0.15)"
                strokeWidth="1"
              />
              <line
                x1={cx - rMax}
                y1={cy}
                x2={cx + rMax}
                y2={cy}
                stroke="rgba(6, 182, 212, 0.15)"
                strokeWidth="1"
              />

              {/* Angle ticks every 30 degrees */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = i * 30;
                if (angle % 90 === 0) return null;
                const rad = (angle * Math.PI) / 180;
                const x1 = cx + rMax * Math.cos(rad);
                const y1 = cy + rMax * Math.sin(rad);
                const x2 = cx + (rMax - 5) * Math.cos(rad);
                const y2 = cy + (rMax - 5) * Math.sin(rad);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(6, 182, 212, 0.3)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Cardinal Labels */}
              <text x={cx} y={cy - rMax - 8} fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">N</text>
              <text x={cx + rMax + 12} y={cy + 4} fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">E</text>
              <text x={cx} y={cy + rMax + 16} fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">S</text>
              <text x={cx - rMax - 12} y={cy + 4} fill="#22d3ee" fontSize="12" fontWeight="bold" textAnchor="middle">W</text>

              {/* Zenith indicator center */}
              <circle cx={cx} cy={cy} r="2" fill="#22d3ee" />
              <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#22d3ee" strokeWidth="0.5" />
              <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="#22d3ee" strokeWidth="0.5" />

              {/* Stars plotting */}
              {starsAboveHorizon.map((star, i) => {
                const { x, y } = getCoords(star.altitude, star.azimuth);
                // Size of star depends on magnitude (lower magnitude = brighter = larger size)
                // magnitude range typically -1.5 to 6.
                // map mag -1.5 to 1.2px radius, and mag 5 to 0.4px radius
                const size = Math.max(0.4, Math.min(3.5, 3 - star.magnitude * 0.4));
                const isSelected = selectedObject?.name === star.name;

                return (
                  <g key={`star-${i}`}>
                    {/* Glowing highlight for bright stars */}
                    {star.magnitude < 1.5 && (
                      <circle
                        cx={x}
                        cy={y}
                        r={size * 2}
                        fill="rgba(34, 211, 238, 0.2)"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={size}
                      fill={isSelected ? '#f43f5e' : '#cbd5e1'}
                      className="transition-colors hover:fill-cyan-400"
                      onClick={() =>
                        setSelectedObject({
                          name: star.name,
                          type: 'Star',
                          alt: star.altitude,
                          az: star.azimuth,
                          mag: star.magnitude,
                          extra: star.constellation
                        })
                      }
                    />
                  </g>
                );
              })}

              {/* Constellation line approximations to make it super starship viewport themed */}
              {/* Draw tactical HUD line grids between some bright visible stars */}
              {mainStars.length >= 4 &&
                mainStars.map((s, index) => {
                  if (index >= mainStars.length - 1) return null;
                  const current = getCoords(s.altitude, s.azimuth);
                  const next = getCoords(mainStars[index + 1].altitude, mainStars[index + 1].azimuth);
                  return (
                    <line
                      key={`const-line-${index}`}
                      x1={current.x}
                      y1={current.y}
                      x2={next.x}
                      y2={next.y}
                      stroke="rgba(34, 211, 238, 0.08)"
                      strokeWidth="0.75"
                    />
                  );
                })}

              {/* Planets & Moon plotting */}
              {planets
                .filter((p) => p.altitude > 0)
                .map((planet) => {
                  const { x, y } = getCoords(planet.altitude, planet.azimuth);
                  const isMoon = planet.name === 'Moon';
                  const isSelected = selectedObject?.name === planet.name;

                  return (
                    <g key={planet.name} className="cursor-pointer">
                      {/* Glow rings around planets */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isMoon ? '10' : '7'}
                        fill={isMoon ? 'url(#moonGlow)' : 'url(#glow)'}
                        className="animate-pulse"
                      />
                      {/* Outer target marker if selected */}
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="9"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                      {/* Planet core dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isMoon ? '4' : '3'}
                        fill={isMoon ? '#ffffff' : '#22d3ee'}
                        onClick={() =>
                          setSelectedObject({
                            name: planet.name,
                            type: isMoon ? 'Deep Sky' : 'Planet',
                            alt: planet.altitude,
                            az: planet.azimuth,
                            mag: planet.magnitude
                          })
                        }
                      />
                      {/* Planet Label */}
                      <text
                        x={x + 6}
                        y={y - 6}
                        fill={isSelected ? '#f43f5e' : '#22d3ee'}
                        fontSize="7"
                        fontWeight="bold"
                        onClick={() =>
                          setSelectedObject({
                            name: planet.name,
                            type: isMoon ? 'Deep Sky' : 'Planet',
                            alt: planet.altitude,
                            az: planet.azimuth,
                            mag: planet.magnitude
                          })
                        }
                      >
                        {planet.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
        </div>

        {/* Right Side: Quick view lists */}
        <div className="space-y-4 text-[11px] order-3">
          <div className="bg-cyan-950/20 border border-cyan-500/15 rounded p-3 space-y-2">
            <div className="text-cyan-300 font-bold uppercase tracking-wider text-[10px] pb-1 border-b border-cyan-500/10">
              BRIGHTEST OBJECT TELEMETRY
            </div>
            <div className="space-y-1">
              {planets
                .filter((p) => p.altitude > 0)
                .slice(0, 3)
                .map((p) => (
                  <div
                    key={p.name}
                    className="flex justify-between hover:bg-cyan-950/40 p-1 rounded cursor-pointer transition-colors"
                    onClick={() =>
                      setSelectedObject({
                        name: p.name,
                        type: p.name === 'Moon' ? 'Deep Sky' : 'Planet',
                        alt: p.altitude,
                        az: p.azimuth,
                        mag: p.magnitude
                      })
                    }
                  >
                    <span className="text-cyan-400 font-medium">{p.name.toUpperCase()}</span>
                    <span className="text-cyan-500">
                      ALT: {p.altitude.toFixed(0)}° / MAG: {p.magnitude.toFixed(1)}
                    </span>
                  </div>
                ))}

              {starsAboveHorizon.slice(0, 4).map((s) => (
                <div
                  key={s.name}
                  className="flex justify-between hover:bg-cyan-950/40 p-1 rounded cursor-pointer transition-colors"
                  onClick={() =>
                    setSelectedObject({
                      name: s.name,
                      type: 'Star',
                      alt: s.altitude,
                      az: s.azimuth,
                      mag: s.magnitude,
                      extra: s.constellation
                    })
                  }
                >
                  <span className="text-slate-300 font-medium">★ {s.name}</span>
                  <span className="text-cyan-600">
                    ALT: {s.altitude.toFixed(0)}° / MAG: {s.magnitude.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cyan-950/25 border border-cyan-500/10 p-2.5 rounded text-[9px] text-cyan-500/80 uppercase">
            * INTERACTIVE VIEWPORT GUIDE: ROTATE MOBILE OR CLICK OBJECT GLYPHS TO READ RADIAL COORDINATES.
          </div>
        </div>
      </div>
    </div>
  );
}
