import React, { useState } from 'react';
import { Compass, Calendar, Clock, MapPin, Navigation } from 'lucide-react';
import { ObserverLocation } from '../types/astro';

interface LocationDateFormProps {
  location: ObserverLocation;
  date: Date;
  onChangeLocation: (loc: ObserverLocation) => void;
  onChangeDate: (date: Date) => void;
}

export default function LocationDateForm({
  location,
  date,
  onChangeLocation,
  onChangeDate
}: LocationDateFormProps) {
  const [latInput, setLatInput] = useState<string>(location.latitude.toString());
  const [lonInput, setLonInput] = useState<string>(location.longitude.toString());
  const [labelInput, setLabelInput] = useState<string>(location.label || '');
  const [dateStr, setDateStr] = useState<string>(date.toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState<string>(
    date.toTimeString().split(' ')[0].substring(0, 5)
  );

  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);

  const validateAndSubmit = (lat: string, lon: string, label: string) => {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      setError('LATITUDE LIMIT ERROR: MUST BE BETWEEN -90.0 AND 90.0 DEGREES');
      return false;
    }
    if (isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
      setError('LONGITUDE LIMIT ERROR: MUST BE BETWEEN -180.0 AND 180.0 DEGREES');
      return false;
    }

    setError(null);
    onChangeLocation({
      latitude: parsedLat,
      longitude: parsedLon,
      label: label.trim() || `COORD: ${parsedLat.toFixed(2)}N, ${parsedLon.toFixed(2)}E`
    });
    return true;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSubmit(latInput, lonInput, labelInput);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('GEOLOCATION PROTOCOL FAILED: NOT SUPPORTED BY SYSTEM');
      return;
    }

    setGeoLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLatInput(latitude.toFixed(4));
        setLonInput(longitude.toFixed(4));
        setLabelInput('Local Telemetry Coordinates');
        onChangeLocation({
          latitude,
          longitude,
          label: 'Local Telemetry Coordinates'
        });
        setGeoLoading(false);
      },
      (err) => {
        setError(`GEOLOCATION DENIED: ${err.message.toUpperCase()}`);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleDateChange = (newDateStr: string, newTimeStr: string) => {
    try {
      const parsedDate = new Date(`${newDateStr}T${newTimeStr}`);
      if (!isNaN(parsedDate.getTime())) {
        setDateStr(newDateStr);
        setTimeStr(newTimeStr);
        onChangeDate(parsedDate);
      }
    } catch (e) {
      setError('TEMPORAL MATRIX ERROR: INVALID DATE-TIME STRUCTURE');
    }
  };

  return (
    <div className="relative border border-cyan-500/30 bg-slate-950/80 p-5 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.15)] font-mono text-cyan-400">
      {/* Corner Brackets to give Starship console effect */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-cyan-500/20">
        <Compass className="w-5 h-5 animate-pulse text-cyan-300" />
        <h2 className="text-sm font-semibold tracking-wider text-cyan-300 uppercase">
          NAV-COMPUTER COORDINATES & TIME MATRIX
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Section */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase text-cyan-300 flex items-center gap-1.5">
            <MapPin className="w-4.5 h-4.5 text-cyan-400" />
            GEOGRAPHIC SENSORS
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-cyan-500 uppercase mb-1">LATITUDE (DEG)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] text-cyan-500 uppercase mb-1">LONGITUDE (DEG)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-cyan-500 uppercase mb-1">STATION NAME / SECTOR</label>
              <input
                type="text"
                placeholder="e.g. Earth Sector 0-1, Mojave Desert"
                className="w-full bg-slate-900 border border-cyan-500/30 p-2 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-cyan-950/60 border border-cyan-400 hover:bg-cyan-900/60 transition-colors text-cyan-300 py-2 font-semibold tracking-wide uppercase rounded text-xs"
              >
                UPDATE VECTOR
              </button>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                className="px-3 bg-cyan-900/20 border border-cyan-400/50 hover:bg-cyan-800/40 disabled:opacity-50 transition-colors text-cyan-400 flex items-center justify-center rounded"
                title="Use browser GPS telemetry"
              >
                {geoLoading ? (
                  <span className="animate-spin text-cyan-300">●</span>
                ) : (
                  <Navigation className="w-4 h-4 text-cyan-300" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Date Time Section */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase text-cyan-300 flex items-center gap-1.5">
            <Calendar className="w-4.5 h-4.5 text-cyan-400" />
            TEMPORAL CALIBRATOR
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] text-cyan-500 uppercase mb-1">LOG ENTRY DATE</label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-cyan-500/30 p-2 pr-8 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded"
                  value={dateStr}
                  onChange={(e) => handleDateChange(e.target.value, timeStr)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-cyan-500 uppercase mb-1">TARGET CHRONOMETRE TIME (LOCAL SOLAR)</label>
              <div className="relative">
                <input
                  type="time"
                  className="w-full bg-slate-900 border border-cyan-500/30 p-2 pr-8 text-cyan-300 focus:outline-none focus:border-cyan-400 rounded"
                  value={timeStr}
                  onChange={(e) => handleDateChange(dateStr, e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center bg-cyan-950/30 border border-cyan-500/20 p-2.5 rounded text-[11px] text-cyan-300/80">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                UTC LOG TIME:
              </span>
              <span className="font-semibold">{date.toUTCString()}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-2 bg-red-950/40 border border-red-500/30 rounded text-xs text-red-400 text-center tracking-wide font-semibold uppercase">
          {error}
        </div>
      )}
    </div>
  );
}
