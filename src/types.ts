export type PolarizationType = 'linear' | 'circular' | 'elliptical';

export interface WaveParams {
  polarization: PolarizationType;
  frequency: number;       // In Hz / scaled factor
  amplitudeE: number;      // Amplitude of Electric Field
  amplitudeB: number;      // Amplitude of Magnetic Field
  phaseDiff: number;       // Phase difference in radians
  speed: number;           // Propagation speed
  showE: boolean;          // Show Electric Field (blue)
  showB: boolean;          // Show Magnetic Field (red)
  showPoynting: boolean;   // Show Poynting Vector S (gold)
  showGrid: boolean;       // Show the 3D floor grid
  showLabels: boolean;     // Show equation labels
  autoRotate: boolean;     // Auto-rotate the 3D camera
  colorMode: 'neon' | 'spectrum' | 'monochrome';
}

export interface SpectrumBand {
  id: string;
  name: string;
  frequencyRange: string;
  wavelengthRange: string;
  energyRange: string;
  description: string;
  applications: string[];
  defaultFreq: number;      // Scaled frequency (e.g. 1 to 10)
  defaultAmp: number;       // Scaled amplitude (e.g. 30 to 120)
  color: string;            // Primary tailwind color class
  hexColor: string;         // Hex color for rendering
}

export interface Camera3D {
  yaw: number;             // Angle around Y axis (horizontal rotation)
  pitch: number;           // Angle around X axis (vertical rotation)
  zoom: number;            // Zoom scale factor
}

export interface Particle3D {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  speed: number;
}
