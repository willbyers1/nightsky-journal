export interface ObserverLocation {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface VisiblePlanet {
  name: string;
  altitude: number; // in degrees
  azimuth: number;  // in degrees
  magnitude: number;
  riseTime?: string;
  transitTime?: string;
  setTime?: string;
}

export interface VisibleConstellation {
  name: string;
  averageAltitude: number; // in degrees
  bestViewingTime?: string;
  brightestStarMagnitude: number;
  starsCount: number;
  starsAboveHorizon: number;
  direction?: string;
}
