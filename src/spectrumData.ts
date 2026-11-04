import { SpectrumBand } from './types';

export const SPECTRUM_BANDS: SpectrumBand[] = [
  {
    id: 'radio',
    name: 'Radio Waves',
    frequencyRange: '< 300 GHz',
    wavelengthRange: '> 1 mm',
    energyRange: '< 1.24 meV',
    description: 'Longest wavelengths in the electromagnetic spectrum, used to transmit data across global distances without physical connection.',
    applications: ['AM/FM Radio broadcasting', 'Wi-Fi and mobile networks', 'GPS Navigation', 'Radio Astronomy (VLA)'],
    defaultFreq: 1.2,
    defaultAmp: 75,
    color: 'emerald',
    hexColor: '#10b981'
  },
  {
    id: 'microwave',
    name: 'Microwaves',
    frequencyRange: '300 MHz - 300 GHz',
    wavelengthRange: '1 mm - 1 m',
    energyRange: '1.24 µeV - 1.24 meV',
    description: 'Sub-millimeter to meter waves that excite molecular rotations, making them perfect for heating moisture-rich substances and long-range radar.',
    applications: ['Microwave Ovens', 'Doppler Radar systems', 'Satellite communication', 'Cosmic Microwave Background (CMB) study'],
    defaultFreq: 2.2,
    defaultAmp: 70,
    color: 'teal',
    hexColor: '#14b8a6'
  },
  {
    id: 'infrared',
    name: 'Infrared (IR)',
    frequencyRange: '300 GHz - 430 THz',
    wavelengthRange: '700 nm - 1 mm',
    energyRange: '1.24 meV - 1.7 eV',
    description: 'Invisible thermal radiation felt as heat. Everything with temperature emits infrared, making it vital for thermal imaging and sensor tech.',
    applications: ['Night-vision goggles', 'TV remote controls', 'Fiber-optic telecommunications', 'James Webb Space Telescope (JWST)'],
    defaultFreq: 3.5,
    defaultAmp: 65,
    color: 'amber',
    hexColor: '#f59e0b'
  },
  {
    id: 'visible',
    name: 'Visible Light',
    frequencyRange: '430 THz - 750 THz',
    wavelengthRange: '380 nm - 700 nm',
    energyRange: '1.7 eV - 3.3 eV',
    description: 'The narrow sliver of the spectrum detectable by the human eye, spanning from red (longer wavelengths) to violet (shorter wavelengths).',
    applications: ['Human vision', 'Photography & Art', 'Photosynthesis in plants', 'Fiber-optic internet lasers'],
    defaultFreq: 5.0,
    defaultAmp: 60,
    color: 'sky',
    hexColor: '#0ea5e9'
  },
  {
    id: 'ultraviolet',
    name: 'Ultraviolet (UV)',
    frequencyRange: '750 THz - 30 PHz',
    wavelengthRange: '10 nm - 380 nm',
    energyRange: '3.3 eV - 124 eV',
    description: 'Energetic rays emitted by high-temperature bodies like the Sun. Capable of causing chemical reactions and sterilizing pathogens.',
    applications: ['Blacklights & Forensics', 'Water purification systems', 'Medical sterilization', 'Suntans & Vitamin D synthesis'],
    defaultFreq: 6.8,
    defaultAmp: 55,
    color: 'indigo',
    hexColor: '#6366f1'
  },
  {
    id: 'xray',
    name: 'X-Rays',
    frequencyRange: '30 PHz - 30 EHz',
    wavelengthRange: '0.01 nm - 10 nm',
    energyRange: '124 eV - 124 keV',
    description: 'Highly penetrating ionizing radiation that can pass through soft tissues but is absorbed by denser structures like bone, allowing anatomical imaging.',
    applications: ['Medical radiography', 'Airport security screening', 'X-ray crystallography', 'Supernova & black hole observations'],
    defaultFreq: 8.5,
    defaultAmp: 45,
    color: 'violet',
    hexColor: '#8b5cf6'
  },
  {
    id: 'gamma',
    name: 'Gamma Rays',
    frequencyRange: '> 10 EHz',
    wavelengthRange: '< 0.01 nm',
    energyRange: '> 124 keV',
    description: 'Most energetic photons in the universe, originating from nuclear decay, fusion, or extreme cosmic events like neutron star mergers.',
    applications: ['Cancer radiotherapy', 'Sterilization of medical equipment', 'Nuclear physics research', 'Detection of gamma-ray bursts (GRB)'],
    defaultFreq: 10.0,
    defaultAmp: 35,
    color: 'rose',
    hexColor: '#f43f5e'
  }
];
