import {
  MakeTime,
  Observer,
  Equator,
  Horizon,
  SearchRiseSet,
  SiderealTime,
  Body,
  Illumination
} from 'astronomy-engine';

function MakeObserver(lat: number, lon: number, height: number): Observer {
  return new Observer(lat, lon, height);
}


import starCatalogData from '../data/starCatalog.json';
import { ObserverLocation, VisiblePlanet, VisibleConstellation } from '../types/astro';

// Helper to convert azimuth to compass direction
export function getCompassDirection(azimuthDeg: number): string {
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

// Convert a Date object to HH:MM format
export function formatTimeHM(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export interface TwilightTimes {
  sunset: string;
  sunrise: string;
  civilTwilightEvening: string;
  civilTwilightMorning: string;
  astronomicalTwilightEvening: string;
  astronomicalTwilightMorning: string;
  isDark: boolean;
}

/**
 * Calculates twilight times and sunset/sunrise for the given date and location.
 */
export function calculateTwilight(date: Date, lat: number, lon: number): TwilightTimes {
  const observer = MakeObserver(lat, lon, 0);
  
  // Create a base date for midday on the selected date to search around
  const midday = new Date(date);
  midday.setHours(12, 0, 0, 0);
  const timeMidday = MakeTime(midday);

  // Search sunset (direction -1) and sunrise (direction 1)
  const sunsetTime = SearchRiseSet(Body.Sun, observer, -1, timeMidday, 1);
  const sunriseTime = SearchRiseSet(Body.Sun, observer, 1, timeMidday, 1);

  // Fallbacks if no rise/set occurs (polar day/night)
  const sunsetDate = sunsetTime ? sunsetTime.date : new Date(midday.getTime() + 6 * 3600 * 1000);
  const sunriseDate = sunriseTime ? sunriseTime.date : new Date(midday.getTime() + 18 * 3600 * 1000);

  // We can calculate twilight times by checking when the Sun crosses specific altitudes:
  // Civil twilight: -6 degrees
  // Astronomical twilight: -18 degrees
  // To keep things robust, deterministic and fast, we can approximate the twilight offsets:
  // In typical latitudes, civil twilight is roughly 35-45 minutes after sunset / before sunrise.
  // Astronomical twilight is roughly 80-100 minutes after sunset / before sunrise.
  // Let's use a standard model that scales based on latitude to prevent astronomical engine from throwing limits on polar regions:
  const absLat = Math.abs(lat);
  let factor = 1.0;
  if (absLat > 50) {
    factor = 1.5; // Twilight is longer at high latitudes
  }
  if (absLat > 60) {
    factor = 2.0;
  }
  if (absLat > 70) {
    factor = 3.0;
  }

  const civilOffsetMs = 40 * 60 * 1000 * factor;
  const astroOffsetMs = 95 * 60 * 1000 * factor;

  const civilEvening = new Date(sunsetDate.getTime() + civilOffsetMs);
  const civilMorning = new Date(sunriseDate.getTime() - civilOffsetMs);

  const astroEvening = new Date(sunsetDate.getTime() + astroOffsetMs);
  const astroMorning = new Date(sunriseDate.getTime() - astroOffsetMs);

  // Check if the current selected time is within the dark window (between astroEvening and astroMorning of the next day)
  // Let's compute Sun's altitude at the specified time to be exact
  const currentTime = MakeTime(date);
  const sunEq = Equator(Body.Sun, currentTime, observer, true, true);
  const sunHor = Horizon(currentTime, observer, sunEq.ra, sunEq.dec, 'normal');
  
  // True dark window means Sun is below civil twilight (-6) or astronomical twilight (-18)
  const isDark = sunHor.altitude < -6;

  return {
    sunset: formatTimeHM(sunsetDate),
    sunrise: formatTimeHM(sunriseDate),
    civilTwilightEvening: formatTimeHM(civilEvening),
    civilTwilightMorning: formatTimeHM(civilMorning),
    astronomicalTwilightEvening: formatTimeHM(astroEvening),
    astronomicalTwilightMorning: formatTimeHM(astroMorning),
    isDark
  };
}

/**
 * Calculates Local Sidereal Time (LST) in hours (0..24).
 */
export function calculateLST(date: Date, longitude: number): number {
  const time = MakeTime(date);
  const gst = SiderealTime(time);
  let lst = gst + longitude / 15.0;
  lst = (lst % 24 + 24) % 24;
  return lst;
}

/**
 * Computes positions of planets and the Moon.
 */
export function calculatePlanets(date: Date, lat: number, lon: number): VisiblePlanet[] {
  const observer = MakeObserver(lat, lon, 0);
  const time = MakeTime(date);

  const bodies = [
    { name: 'Mercury', key: Body.Mercury },
    { name: 'Venus', key: Body.Venus },
    { name: 'Mars', key: Body.Mars },
    { name: 'Jupiter', key: Body.Jupiter },
    { name: 'Saturn', key: Body.Saturn },
    { name: 'Uranus', key: Body.Uranus },
    { name: 'Neptune', key: Body.Neptune },
    { name: 'Moon', key: Body.Moon }
  ];

  const results: VisiblePlanet[] = [];

  for (const item of bodies) {
    try {
      // 1. Calculate Equatorial Coords
      const eq = Equator(item.key, time, observer, true, true);
      
      // 2. Calculate Horizon Coords (Alt/Az)
      const hor = Horizon(time, observer, eq.ra, eq.dec, 'normal');

      // 3. Calculate Rise/Set/Transit times
      // We look around midday of the current date
      const midday = new Date(date);
      midday.setHours(12, 0, 0, 0);
      const timeMidday = MakeTime(midday);

      const riseT = SearchRiseSet(item.key, observer, 1, timeMidday, 1);
      const setT = SearchRiseSet(item.key, observer, -1, timeMidday, 1);

      // 4. Calculate Magnitude using Illumination function
      let magnitude = 1.0;
      try {
        const illum = Illumination(item.key, time);
        magnitude = illum.mag;
      } catch (e) {
        // Fallback standard magnitudes if illumination throws an error
        if (item.name === 'Mercury') magnitude = 0.5;
        else if (item.name === 'Venus') magnitude = -4.2;
        else if (item.name === 'Mars') magnitude = 1.0;
        else if (item.name === 'Jupiter') magnitude = -2.2;
        else if (item.name === 'Saturn') magnitude = 0.8;
        else if (item.name === 'Uranus') magnitude = 5.7;
        else if (item.name === 'Neptune') magnitude = 7.8;
        else if (item.name === 'Moon') magnitude = -12.0;
      }

      results.push({
        name: item.name,
        altitude: hor.altitude,
        azimuth: hor.azimuth,
        magnitude,
        riseTime: riseT ? formatTimeHM(riseT.date) : 'Circumpolar',
        setTime: setT ? formatTimeHM(setT.date) : 'Circumpolar'
      });
    } catch (e) {
      console.warn(`Error calculating coordinates for ${item.name}:`, e);
    }
  }

  // Sort by brightness (lower magnitude is brighter)
  return results.sort((a, b) => a.magnitude - b.magnitude);
}

/**
 * Computes constellations visibility and their properties.
 */
export function calculateConstellations(date: Date, lat: number, lon: number): VisibleConstellation[] {
  const observer = MakeObserver(lat, lon, 0);
  const time = MakeTime(date);

  // Group stars from catalog by constellation
  const constellationMap: Record<string, {
    stars: typeof starCatalogData;
    sumAltitude: number;
    countAboveHorizon: number;
    brightestStarMag: number;
    sumAzimuthX: number; // For average azimuth calculation via vector components
    sumAzimuthY: number;
  }> = {};

  for (const star of starCatalogData) {
    try {
      const hor = Horizon(time, observer, star.ra, star.dec, 'normal');
      
      const constellationName = star.constellation;
      if (!constellationMap[constellationName]) {
        constellationMap[constellationName] = {
          stars: [],
          sumAltitude: 0,
          countAboveHorizon: 0,
          brightestStarMag: Infinity,
          sumAzimuthX: 0,
          sumAzimuthY: 0
        };
      }

      const group = constellationMap[constellationName];
      group.stars.push(star);
      
      const rad = (hor.azimuth * Math.PI) / 180;
      group.sumAzimuthX += Math.cos(rad);
      group.sumAzimuthY += Math.sin(rad);

      if (hor.altitude > 0) {
        group.sumAltitude += hor.altitude;
        group.countAboveHorizon++;
      }

      if (star.mag < group.brightestStarMag) {
        group.brightestStarMag = star.mag;
      }
    } catch (e) {
      // Ignore calculation error for individual star
    }
  }

  const results: VisibleConstellation[] = [];

  for (const [name, data] of Object.entries(constellationMap)) {
    if (data.countAboveHorizon > 0) {
      const averageAltitude = data.sumAltitude / data.countAboveHorizon;
      
      // Calculate average azimuth direction
      const avgX = data.sumAzimuthX / data.stars.length;
      const avgY = data.sumAzimuthY / data.stars.length;
      let avgAzimuth = (Math.atan2(avgY, avgX) * 180) / Math.PI;
      avgAzimuth = (avgAzimuth % 360 + 360) % 360;

      const direction = getCompassDirection(avgAzimuth);

      // Best viewing time is typically when it's highest in the sky
      // For simplicity, we can state "Tonight" or specify direction-based best window
      let bestViewingTime = 'Late Evening';
      if (averageAltitude > 45) {
        bestViewingTime = 'Midnight (Zenith)';
      } else if (direction.includes('E')) {
        bestViewingTime = 'Early Evening';
      } else if (direction.includes('W')) {
        bestViewingTime = 'Pre-dawn';
      }

      results.push({
        name,
        averageAltitude,
        bestViewingTime,
        brightestStarMagnitude: data.brightestStarMag,
        starsCount: data.stars.length,
        starsAboveHorizon: data.countAboveHorizon,
        direction
      });
    }
  }

  // Sort by average altitude (highest first) and prominence
  return results.sort((a, b) => b.averageAltitude - a.averageAltitude);
}

/**
 * Returns stars in Alt/Az coordinates for plotting on the sky chart.
 */
export interface PlottedStar {
  name: string;
  altitude: number;
  azimuth: number;
  magnitude: number;
  constellation: string;
}

export function calculatePlottedStars(date: Date, lat: number, lon: number): PlottedStar[] {
  const observer = MakeObserver(lat, lon, 0);
  const time = MakeTime(date);
  const plotted: PlottedStar[] = [];

  for (const star of starCatalogData) {
    try {
      const hor = Horizon(time, observer, star.ra, star.dec, 'normal');
      if (hor.altitude > 0) {
        plotted.push({
          name: star.name,
          altitude: hor.altitude,
          azimuth: hor.azimuth,
          magnitude: star.mag,
          constellation: star.constellation
        });
      }
    } catch (e) {
      // Skip
    }
  }

  return plotted;
}
