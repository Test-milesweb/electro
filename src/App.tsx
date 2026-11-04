import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Settings, 
  Sliders, 
  Layers, 
  Rotate3d, 
  Eye, 
  ArrowRight, 
  BookOpen, 
  Check, 
  Lightbulb, 
  Cpu, 
  Info, 
  Radio, 
  Wifi, 
  Flame, 
  Sun, 
  ShieldAlert, 
  Bone, 
  Radiation,
  Sparkles
} from 'lucide-react';
import EMWaveCanvas from './components/EMWaveCanvas';
import WaveTheory from './components/WaveTheory';
import { SPECTRUM_BANDS } from './spectrumData';
import { PolarizationType, WaveParams } from './types';

// Icons mapping for the spectrum explorer
const spectrumIcons: Record<string, any> = {
  radio: Radio,
  microwave: Wifi,
  infrared: Flame,
  visible: Sun,
  ultraviolet: Sparkles,
  xray: Bone,
  gamma: Radiation
};

export default function App() {
  // Master Wave Simulation parameters
  const [params, setParams] = useState<WaveParams>({
    polarization: 'linear',
    frequency: 3.5,
    amplitudeE: 70,
    amplitudeB: 70,
    phaseDiff: 0,
    speed: 1.0,
    showE: true,
    showB: true,
    showPoynting: true,
    showGrid: true,
    showLabels: true,
    autoRotate: false,
    colorMode: 'neon'
  });

  const [activeBandId, setActiveBandId] = useState<string>('visible');
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory' | 'spectrum'>('simulation');

  // Ref scroll helpers
  const simulationRef = useRef<HTMLDivElement>(null);
  const spectrumRef = useRef<HTMLDivElement>(null);
  const theoryRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Helper to update parameter state safely
  const handleUpdateParams = (updater: (prev: WaveParams) => WaveParams) => {
    setParams(updater);
  };

  // Select a spectrum band and update simulation settings accordingly
  const selectSpectrumBand = (bandId: string) => {
    setActiveBandId(bandId);
    const band = SPECTRUM_BANDS.find(b => b.id === bandId);
    if (band) {
      setParams(prev => ({
        ...prev,
        frequency: band.defaultFreq,
        amplitudeE: band.defaultAmp,
        amplitudeB: band.defaultAmp,
        phaseDiff: 0, // Reset phase diff for standard spectrum propagation
        polarization: 'linear' // standard linear transverse wave for spectrum
      }));
    }
  };

  const activeBand = SPECTRUM_BANDS.find(b => b.id === activeBandId) || SPECTRUM_BANDS[3];

  // Live calculated physical attributes
  const speedOfLight = 299792458; // m/s
  const computedWavelength = (300 / params.frequency).toFixed(1); // Visual scale
  const computedWavelengthPhysical = activeBand.wavelengthRange;
  const computedFrequencyPhysical = activeBand.frequencyRange;
  const computedEnergy = activeBand.energyRange;

  // Poynting Vector average power formula: S = E0 * B0 * cos(phaseDiff) / 2
  const poyntingPower = (
    (params.amplitudeE * params.amplitudeB * Math.cos(params.phaseDiff)) / 100
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-[#00D4FF]/30 selection:text-white relative overflow-x-hidden">
      
      {/* Elegant Dark theme subtle background grid and cinematic radial glows */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.04),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,49,49,0.04),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00D4FF]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#FF3131]/5 blur-[120px] pointer-events-none z-0" />

      {/* Glassmorphism Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-md transition-all" id="main-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#FF3131] p-[1.5px] shadow-[0_0_15px_rgba(0,212,255,0.25)]">
              <div className="w-full h-full bg-[#050505] rounded-[10px] flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-[#00D4FF] animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-sm font-bold tracking-wider text-zinc-100">
                EM WAVE VIZ
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#00D4FF] uppercase">
                Physics Lab v2.5
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <button 
              onClick={() => scrollToSection(simulationRef)}
              className="px-3.5 py-2 rounded-lg hover:text-zinc-100 hover:bg-white/5 transition-all cursor-pointer"
              id="nav-link-visualizer"
            >
              3D Sandbox
            </button>
            <button 
              onClick={() => scrollToSection(spectrumRef)}
              className="px-3.5 py-2 rounded-lg hover:text-zinc-100 hover:bg-white/5 transition-all cursor-pointer"
              id="nav-link-spectrum"
            >
              Interactive Spectrum
            </button>
            <button 
              onClick={() => scrollToSection(theoryRef)}
              className="px-3.5 py-2 rounded-lg hover:text-zinc-100 hover:bg-white/5 transition-all cursor-pointer"
              id="nav-link-theory"
            >
              Maxwell's Equations
            </button>
          </nav>

          {/* Quick CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => scrollToSection(simulationRef)}
              className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold tracking-wider uppercase text-zinc-300 hover:bg-white hover:text-black transition-all cursor-pointer"
              id="nav-cta-sandbox"
            >
              Launch Sandbox
            </button>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">

        {/* HERO + 3D SIMULATOR VIEWPORT SECTION */}
        <section ref={simulationRef} className="scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Premium Titles, Descriptions, Live Telemetry Stats (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center h-full space-y-6">
              
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[10px] font-mono tracking-wider text-[#00D4FF] uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-ping" />
                  Self-Sustaining Radiation Field
                </span>
                
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Vectors of <br />
                  <span className="bg-gradient-to-r from-[#00D4FF] via-sky-300 to-[#FF3131] bg-clip-text text-transparent">
                    Electromagnetism
                  </span>
                </h1>
                
                <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                  An immersive, real-time 3D physics simulator. Manipulate wavelength, frequency, polarization, and phase states. Witness the self-sustaining dance of transverse electrical and magnetic fields propagating through spacetime at the absolute speed of light.
                </p>
              </div>

              {/* LIVE TELEMETRY STATS DASHBOARD */}
              <div className="grid grid-cols-2 gap-3.5 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
                
                {/* Wavelength Indicator */}
                <div className="flex flex-col p-2.5 bg-black/40 rounded-xl border border-white/5 relative group overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-[#00D4FF]/5 rounded-full blur-lg group-hover:bg-[#00D4FF]/10 transition-colors" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Wavelength (λ)</span>
                  <span className="text-xl font-display font-bold text-[#00D4FF] mt-1">
                    {computedWavelength} <span className="text-xs text-zinc-400 font-sans font-medium">m (rel)</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                    Physical: {computedWavelengthPhysical}
                  </span>
                </div>

                {/* Frequency Indicator */}
                <div className="flex flex-col p-2.5 bg-black/40 rounded-xl border border-white/5 relative group overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-[#FF3131]/5 rounded-full blur-lg group-hover:bg-[#FF3131]/10 transition-colors" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Frequency (f)</span>
                  <span className="text-xl font-display font-bold text-[#FF3131] mt-1">
                    {(params.frequency * 100).toFixed(0)} <span className="text-xs text-zinc-400 font-sans font-medium">MHz</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
                    Spectrum: {computedFrequencyPhysical}
                  </span>
                </div>

                {/* Energy Indicator */}
                <div className="flex flex-col p-2.5 bg-black/40 rounded-xl border border-white/5 relative group overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-yellow-500/5 rounded-full blur-lg group-hover:bg-yellow-500/10 transition-colors" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Photon Energy (E)</span>
                  <span className="text-lg font-display font-bold text-amber-300 mt-1.5">
                    {computedEnergy}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-1.5">
                    Formula: E = h · f
                  </span>
                </div>

                {/* Poynting Vector indicator */}
                <div className="flex flex-col p-2.5 bg-black/40 rounded-xl border border-white/5 relative group overflow-hidden">
                  <div className="absolute -right-3 -bottom-3 w-10 h-10 bg-purple-500/5 rounded-full blur-lg group-hover:bg-purple-500/10 transition-colors" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Poynting Flux (S)</span>
                  <span className="text-xl font-display font-bold text-yellow-400 mt-1">
                    {poyntingPower} <span className="text-xs text-zinc-400 font-sans font-medium">W/m²</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-1.5">
                    Direction: Along +X Vector
                  </span>
                </div>

              </div>

              {/* Action Buttons to Explore/Sandbox */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => scrollToSection(spectrumRef)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-sky-600 text-sm font-bold text-white shadow-lg shadow-[#00D4FF]/25 hover:shadow-[#00D4FF]/40 hover:scale-[1.02] transition-all cursor-pointer"
                  id="btn-cta-explore-spectrum"
                >
                  <Layers className="w-4 h-4" />
                  Explore Spectrum bands
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => scrollToSection(theoryRef)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                  id="btn-cta-read-theory"
                >
                  <BookOpen className="w-4 h-4" />
                  Maxwell's Theory
                </button>
              </div>

              {/* Wave Mathematical Expression Overlay */}
              <div className="border border-white/5 bg-black/40 p-4 rounded-xl font-mono text-[11px] text-zinc-500 space-y-1">
                <div className="text-zinc-400 font-bold border-b border-white/5 pb-1 mb-1.5 text-[10px] tracking-wider uppercase">Live Mathematical Models</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00D4FF] font-semibold">E(x,t)</span> = 
                  <span className="text-zinc-300 font-medium">
                    {params.amplitudeE.toFixed(1)} · sin({(0.04).toFixed(3)}x - {(params.frequency * 0.15).toFixed(3)}t) ŷ
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#FF3131] font-semibold">B(x,t)</span> = 
                  <span className="text-zinc-300 font-medium">
                    {params.amplitudeB.toFixed(1)} · sin({(0.04).toFixed(3)}x - {(params.frequency * 0.15).toFixed(3)}t {params.phaseDiff !== 0 ? `+ ${params.phaseDiff.toFixed(2)}` : ''}) ẑ
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Visualizer Box (7 Cols) */}
            <div className="lg:col-span-7 h-[450px] sm:h-[520px] lg:h-[580px] w-full flex flex-col gap-4">
              <EMWaveCanvas params={params} onChangeParams={handleUpdateParams} />
            </div>

          </div>
        </section>

        {/* INTERACTIVE PHYSICS SANDBOX STUDIO (SLIDERS + WAVE TUNERS) */}
        <section className="bg-white/5 border border-white/5 p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-md">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#00D4FF] mb-1">
                <Settings className="w-4.5 h-4.5" />
                <span className="font-mono text-xs uppercase tracking-wider font-semibold">Wave Laboratory</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">Dynamic Parameters Sandbox</h2>
            </div>
            
            {/* Quick Presets for Polarization */}
            <div className="flex items-center bg-black/45 p-1 rounded-xl border border-white/5">
              {(['linear', 'circular', 'elliptical'] as PolarizationType[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setParams(prev => ({ ...prev, polarization: mode, phaseDiff: mode === 'circular' ? Math.PI / 2 : prev.phaseDiff }))}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    params.polarization === mode 
                      ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  id={`btn-pol-${mode}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            
            {/* Sliders Grid (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Frequency slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                    Oscillation Frequency (f)
                  </span>
                  <span className="font-mono text-[#00D4FF] font-bold bg-[#00D4FF]/10 border border-[#00D4FF]/20 px-2 py-0.5 rounded text-[11px]">
                    {(params.frequency * 100).toFixed(0)} MHz
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.1"
                  value={params.frequency}
                  onChange={(e) => setParams(prev => ({ ...prev, frequency: parseFloat(e.target.value) }))}
                  className="w-full accent-[#00D4FF] bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  id="slider-frequency"
                />
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Modulates the wavelength. Higher frequencies produce shorter wavelengths with more wave cycles in the viewport.
                </p>
              </div>

              {/* Electric amplitude */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
                    Electric Field Amplitude (E₀)
                  </span>
                  <span className="font-mono text-[#00D4FF] font-bold bg-[#00D4FF]/10 border border-[#00D4FF]/20 px-2 py-0.5 rounded text-[11px]">
                    {params.amplitudeE.toFixed(0)} V/m
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="1"
                  value={params.amplitudeE}
                  onChange={(e) => setParams(prev => ({ ...prev, amplitudeE: parseFloat(e.target.value) }))}
                  className="w-full accent-[#00D4FF] bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  id="slider-amplitude-e"
                />
              </div>

              {/* Magnetic amplitude */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF3131]" />
                    Magnetic Field Amplitude (B₀)
                  </span>
                  <span className="font-mono text-[#FF3131] font-bold bg-[#FF3131]/10 border border-[#FF3131]/20 px-2 py-0.5 rounded text-[11px]">
                    {params.amplitudeB.toFixed(0)} T
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="1"
                  value={params.amplitudeB}
                  onChange={(e) => setParams(prev => ({ ...prev, amplitudeB: parseFloat(e.target.value) }))}
                  className="w-full accent-[#FF3131] bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  id="slider-amplitude-b"
                />
              </div>

              {/* Phase Difference slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Rotate3d className="w-3.5 h-3.5 text-zinc-500" />
                    Phase Difference (δ)
                  </span>
                  <span className="font-mono text-purple-400 font-bold bg-purple-950/40 border border-purple-900/30 px-2 py-0.5 rounded text-[11px]">
                    {((params.phaseDiff / Math.PI) * 180).toFixed(0)}° ({(params.phaseDiff / Math.PI).toFixed(2)}π)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step="0.05"
                  value={params.phaseDiff}
                  onChange={(e) => setParams(prev => ({ ...prev, phaseDiff: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-500 bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  disabled={params.polarization === 'circular'}
                  id="slider-phase-diff"
                />
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Adjusts spatial lag between E and B curves. In vacuum, light propagation requires E and B to be perfectly in-phase (0°).
                </p>
              </div>

              {/* Propagation speed */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-zinc-500" />
                    Propagation Velocity (c)
                  </span>
                  <span className="font-mono text-yellow-400 font-bold bg-yellow-950/40 border border-yellow-900/30 px-2 py-0.5 rounded text-[11px]">
                    {params.speed.toFixed(1)}x speed of light
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.05"
                  value={params.speed}
                  onChange={(e) => setParams(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  className="w-full accent-yellow-500 bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                  id="slider-speed"
                />
              </div>

            </div>

            {/* Visibility & Aesthetics Toggles (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white/5 p-5 rounded-2xl border border-white/5 gap-6">
              
              <div className="space-y-4">
                <div className="font-mono text-[10px] uppercase text-zinc-500 tracking-wider font-bold">Visualization Switches</div>
                
                <div className="space-y-3">
                  
                  {/* Show Electric Field */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer text-xs font-semibold text-zinc-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                      Render Electric Field (E)
                    </span>
                    <input
                      type="checkbox"
                      checked={params.showE}
                      onChange={(e) => setParams(prev => ({ ...prev, showE: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#00D4FF] bg-zinc-900 border-zinc-800 focus:ring-[#00D4FF] focus:ring-offset-0 cursor-pointer"
                    />
                  </label>

                  {/* Show Magnetic Field */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer text-xs font-semibold text-zinc-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF3131]" />
                      Render Magnetic Field (B)
                    </span>
                    <input
                      type="checkbox"
                      checked={params.showB}
                      onChange={(e) => setParams(prev => ({ ...prev, showB: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#FF3131] bg-zinc-900 border-zinc-800 focus:ring-[#FF3131] focus:ring-offset-0 cursor-pointer"
                    />
                  </label>

                  {/* Show Poynting Flow */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer text-xs font-semibold text-zinc-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Poynting Energy Vector (S)
                    </span>
                    <input
                      type="checkbox"
                      checked={params.showPoynting}
                      onChange={(e) => setParams(prev => ({ ...prev, showPoynting: e.target.checked }))}
                      className="w-4 h-4 rounded text-yellow-500 bg-zinc-900 border-zinc-800 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </label>

                  {/* Show 3D Grid */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer text-xs font-semibold text-zinc-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-500" />
                      Perspective Floor Grid
                    </span>
                    <input
                      type="checkbox"
                      checked={params.showGrid}
                      onChange={(e) => setParams(prev => ({ ...prev, showGrid: e.target.checked }))}
                      className="w-4 h-4 rounded text-zinc-500 bg-zinc-900 border-zinc-800 focus:ring-zinc-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </label>

                </div>
              </div>

              {/* Color Scheme selector */}
              <div className="space-y-2.5">
                <div className="font-mono text-[10px] uppercase text-zinc-500 tracking-wider font-bold">Render Theme</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['neon', 'spectrum', 'monochrome'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setParams(prev => ({ ...prev, colorMode: mode }))}
                      className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        params.colorMode === mode 
                          ? 'bg-white/10 border-white/20 text-zinc-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                          : 'bg-black/35 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                      id={`btn-theme-${mode}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* COSMIC SPECTRUM EXPLORER (BENTO GRID WITH 7 BANDS) */}
        <section ref={spectrumRef} className="scroll-mt-20 space-y-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <span className="px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[10px] font-mono tracking-wider text-[#00D4FF] uppercase font-semibold">
              The Light Continuous
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Electromagnetic Spectrum Explorer
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Electromagnetic waves range from low-frequency radio waves to incredibly energetic gamma rays. Select any region below to witness its physical properties and live-update the 3D wave visualization.
            </p>
          </div>

          {/* Spectrum Ribbon Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {SPECTRUM_BANDS.map((band) => {
              const IconComp = spectrumIcons[band.id] || Radio;
              const isSelected = activeBandId === band.id;
              
              return (
                <button
                  key={band.id}
                  onClick={() => selectSpectrumBand(band.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all duration-300 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-white/20 shadow-lg text-white'
                      : 'bg-black/40 border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                  id={`spectrum-tab-${band.id}`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 transition-all"
                    style={{ 
                      backgroundColor: isSelected ? `${band.hexColor}20` : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? band.hexColor : '#a1a1aa',
                      boxShadow: isSelected ? `0 0 15px ${band.hexColor}30` : 'none'
                    }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="font-display text-[11px] font-bold tracking-wide">{band.name}</span>
                  <span className="text-[9px] font-mono text-zinc-500 mt-1">{band.wavelengthRange}</span>

                  {/* Active bottom pointer indicator */}
                  {isSelected && (
                    <div 
                      className="absolute bottom-0 left-4 right-4 h-[2px] rounded-t-full"
                      style={{ backgroundColor: band.hexColor, boxShadow: `0 0 8px ${band.hexColor}` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Band Detail Bento Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBandId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/5 border border-white/5 p-6 sm:p-8 rounded-3xl backdrop-blur-md relative overflow-hidden"
            >
              
              {/* Colored side bar accent indicator */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-[5px] rounded-r-lg"
                style={{ backgroundColor: activeBand.hexColor, boxShadow: `0 0 15px ${activeBand.hexColor}` }}
              />

              {/* Big Left column: descriptive info (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-1.5">
                  <span 
                    className="text-[10px] font-mono uppercase tracking-wider font-bold"
                    style={{ color: activeBand.hexColor }}
                  >
                    SPECTRUM REGION PROFILE
                  </span>
                  <h3 className="font-display text-2xl font-black text-white flex items-center gap-2">
                    {activeBand.name}
                  </h3>
                </div>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  {activeBand.description}
                </p>

                {/* Applications list Grid */}
                <div className="space-y-2.5">
                  <div className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wide">Real-World Scientific Applications</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeBand.applications.map((app, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 border border-white/5 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
                        <span className="font-medium">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Key Physics metrics box (5 Cols) */}
              <div className="lg:col-span-5 bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6">
                
                <div className="space-y-4">
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold pb-2 border-b border-white/5">PHYSICAL PROPERTIES</div>
                  
                  <div className="space-y-3">
                    
                    {/* Wavelength */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Wavelength Band</span>
                      <span className="font-mono text-zinc-100 font-bold bg-black/60 px-2.5 py-1 rounded-md border border-white/5">
                        {activeBand.wavelengthRange}
                      </span>
                    </div>

                    {/* Frequency */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Frequency Range</span>
                      <span className="font-mono text-zinc-100 font-bold bg-black/60 px-2.5 py-1 rounded-md border border-white/5">
                        {activeBand.frequencyRange}
                      </span>
                    </div>

                    {/* Energy */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Photon Energy (eV)</span>
                      <span className="font-mono text-zinc-100 font-bold bg-black/60 px-2.5 py-1 rounded-md border border-white/5">
                        {activeBand.energyRange}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="bg-black/50 p-3.5 rounded-xl border border-white/5 text-[11px] text-zinc-400 flex gap-2.5">
                  <Info className="w-4 h-4 shrink-0 text-amber-500" />
                  <p className="leading-relaxed">
                    <strong>Wavelength Tip:</strong> Waves in this band have default parameters automatically loaded in the 3D sandbox above. Use the sandbox sliders to fine-tune.
                  </p>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

        </section>

        {/* MAXWELL FIELD THEORY EXPOSITORY COMPONENT */}
        <section ref={theoryRef} className="scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[10px] font-mono tracking-wider text-[#00D4FF] uppercase font-semibold">
              Foundational Physics
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              The Maxwellian Field Mechanics
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Explore the four partial differential equations formulated by James Clerk Maxwell that mathematically describe classical electromagnetic behavior in vacuums and mediums.
            </p>
          </div>

          <WaveTheory />
        </section>

      </main>

      {/* MINIMALIST SCIENTIFIC SPEC FOOTER */}
      <footer className="border-t border-white/5 bg-[#050505] py-12 relative z-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-white/5 pb-10 mb-8">
            
            {/* Left */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-[#00D4FF]" />
                <span className="font-display font-bold text-sm tracking-wider text-zinc-100">ELECTROMAGNETIC WAVE VISUALIZER</span>
              </div>
              <p className="text-zinc-500 leading-relaxed max-w-md text-[11px]">
                A real-time educational application built to visualize classical transverse electromagnetic radiation, enabling intuitive exploration of wave-propagation physics, polarization states, and spectral mechanics.
              </p>
            </div>

            {/* Middle (Physical Constants list) */}
            <div className="md:col-span-4 space-y-2">
              <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Fundamental Constants</span>
              <div className="font-mono text-[10px] text-zinc-500 space-y-1">
                <div>• Speed of light: <strong className="text-zinc-400">c = 299,792,458 m/s</strong></div>
                <div>• Vacuum Permeability: <strong className="text-zinc-400">μ₀ = 4π × 10⁻⁷ H/m</strong></div>
                <div>• Vacuum Permittivity: <strong className="text-zinc-400">ε₀ = 8.854 × 10⁻¹² F/m</strong></div>
                <div>• Planck Constant: <strong className="text-zinc-400">h = 6.626 × 10⁻³⁴ J·s</strong></div>
              </div>
            </div>

            {/* Right */}
            <div className="md:col-span-3 space-y-2 text-left md:text-right">
              <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Project Metadata</span>
              <div className="text-[10px] space-y-1 text-zinc-500 font-mono">
                <div>Environment: <span className="text-zinc-400">Cloud Run Sandboxed Node container</span></div>
                <div>Target Framework: <span className="text-zinc-400">React 19, Tailwind v4, Motion</span></div>
                <div>Status: <span className="text-emerald-500 font-semibold">• High-Fidelity Simulation Live</span></div>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px]">
            <span>© 2026 Electromagnetic Wave Visualizer. Designed for science and discovery.</span>
            <span className="flex items-center gap-1 text-zinc-600 hover:text-zinc-400 cursor-pointer">
              <Cpu className="w-3.5 h-3.5" />
              Physical Engine Running
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
