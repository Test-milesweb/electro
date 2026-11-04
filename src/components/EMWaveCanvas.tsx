import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Camera3D, Particle3D, WaveParams } from '../types';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Compass, Info, Cpu, Eye } from 'lucide-react';

interface EMWaveCanvasProps {
  params: WaveParams;
  onChangeParams: (updater: (prev: WaveParams) => WaveParams) => void;
}

export default function EMWaveCanvas({ params, onChangeParams }: EMWaveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Camera State
  const [camera, setCamera] = useState<Camera3D>({
    yaw: -0.45,  // Slight angle to show 3D depth
    pitch: 0.25, // Slight elevation to show the 3D grid
    zoom: 1.1
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const cameraStart = useRef({ yaw: 0, pitch: 0 });

  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationFrameId = useRef<number | null>(null);

  // Generate stable 3D particles
  const particles = useMemo<Particle3D[]>(() => {
    const list: Particle3D[] = [];
    for (let i = 0; i < 60; i++) {
      list.push({
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 400,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.5 ? '#00d4ff' : '#ff3131',
        speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1)
      });
    }
    return list;
  }, []);

  // Set up resize observer for container
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !canvasRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const canvas = canvasRef.current;
        if (canvas) {
          // Support high DPI retina displays for razor-sharp lines
          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const tick = (now: number) => {
      const delta = (now - lastTime) * 0.001; // in seconds
      lastTime = now;

      // Update time based on propagation speed
      setTime((prev) => prev + delta * params.speed * 8);

      // Auto rotation of camera
      if (params.autoRotate) {
        setCamera((prev) => ({
          ...prev,
          yaw: (prev.yaw + 0.15 * delta) % (Math.PI * 2)
        }));
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPlaying, params.speed, params.autoRotate]);

  // Main Render Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and scale
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Camera parameters
    const { yaw, pitch, zoom } = camera;

    // 3D Projection Helper
    const project = (x: number, y: number, z: number) => {
      // 1. Rotate around Y axis (Yaw / horizontal orbit)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // 2. Rotate around X axis (Pitch / vertical orbit)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y1 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      // 3. Perspective calculation
      const cameraDist = 550;
      const depthFactor = cameraDist + z2;
      const scale = (450 / Math.max(1, depthFactor)) * zoom;

      const screenX = cx + x1 * scale;
      const screenY = cy - y1 * scale;

      return {
        x: screenX,
        y: screenY,
        z: z2, // Projected depth (used for depth-cueing opacity)
        scale
      };
    };

    // Draw Arrow Helper
    const drawArrow = (
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      color: string,
      lineWidth: number = 1.5,
      arrowHeadSize: number = 5
    ) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(
        p2.x - arrowHeadSize * Math.cos(angle - Math.PI / 6),
        p2.y - arrowHeadSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        p2.x - arrowHeadSize * Math.cos(angle + Math.PI / 6),
        p2.y - arrowHeadSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    // 1. Draw 3D Grid Plane (at the bottom, e.g. y = -120)
    if (params.showGrid) {
      ctx.save();
      const gridY = -140;
      const gridSize = 300;
      const gridSpacing = 30;

      // Draw parallel grid lines
      for (let i = -gridSize; i <= gridSize; i += gridSpacing) {
        // Lines parallel to Z axis (along X)
        const pStart = project(-gridSize, gridY, i);
        const pEnd = project(gridSize, gridY, i);

        // Lines parallel to X axis (along Z)
        const pStart2 = project(i, gridY, -gridSize);
        const pEnd2 = project(i, gridY, gridSize);

        // Opacity based on depth factor for DOF simulation
        const depthAvg = (pStart.z + pEnd.z) / 2;
        const opacity = Math.max(0.02, Math.min(0.12, 1 - (depthAvg + 150) / 400));

        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pStart2.x, pStart2.y);
        ctx.lineTo(pEnd2.x, pEnd2.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Draw Floating 3D Ambient Particles (Background section)
    ctx.save();
    particles.forEach((p) => {
      // Gentle floating animation
      if (isPlaying) {
        p.x += p.speed;
        if (p.x > 320) p.x = -320;
        if (p.x < -320) p.x = 320;
      }

      const pProj = project(p.x, p.y, p.z);

      // Only draw if within bounds
      if (pProj.x >= 0 && pProj.x <= width && pProj.y >= 0 && pProj.y <= height) {
        // Depth-cueing sizing and opacity
        const distRatio = (pProj.z + 300) / 600; // 0 (near) to 1 (far)
        const opacity = Math.max(0.08, Math.min(0.6, 1 - distRatio));
        const finalSize = p.size * pProj.scale * 0.9;

        ctx.beginPath();
        ctx.arc(pProj.x, pProj.y, finalSize, 0, Math.PI * 2);
        
        if (params.colorMode === 'neon') {
          ctx.fillStyle = p.color === '#00d4ff' ? `rgba(0, 212, 255, ${opacity})` : `rgba(255, 49, 49, ${opacity})`;
        } else if (params.colorMode === 'spectrum') {
          // Golden amber particles
          ctx.fillStyle = `rgba(245, 158, 11, ${opacity})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
        }
        ctx.fill();
      }
    });
    ctx.restore();

    // 3. Draw Axis (Propagation vector along X axis)
    const axisStartVal = -230;
    const axisEndVal = 230;
    const axisStartProj = project(axisStartVal, 0, 0);
    const axisEndProj = project(axisEndVal, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(axisStartProj.x, axisStartProj.y);
    ctx.lineTo(axisEndProj.x, axisEndProj.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Small ticks along axis to represent scientific ruler
    for (let ax = axisStartVal + 20; ax < axisEndVal; ax += 20) {
      const t1 = project(ax, -5, 0);
      const t2 = project(ax, 5, 0);
      ctx.beginPath();
      ctx.moveTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Set colors based on chosen mode
    const colorE = params.colorMode === 'monochrome' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 212, 255, 0.9)'; // Electric Cyan
    const colorB = params.colorMode === 'monochrome' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 49, 49, 0.9)';  // Hot Red
    const colorEGlow = params.colorMode === 'monochrome' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 212, 255, 0.8)';
    const colorBGlow = params.colorMode === 'monochrome' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 49, 49, 0.8)';

    // Math calculation params
    const k = 0.04; // wavenumber
    const omega = params.frequency * 0.15; // angular frequency

    // 4. Draw Electric (E) & Magnetic (B) Vectors (The arrow filaments)
    const arrowInterval = 12; // Draw vectors at clean spacing intervals

    ctx.save();
    for (let x = axisStartVal; x <= axisEndVal; x += arrowInterval) {
      let Ey = 0;
      let Ez = 0;
      let By = 0;
      let Bz = 0;

      // Calculate Wave Vectors depending on polarization mode
      if (params.polarization === 'linear') {
        // E oscillates purely along Y, B purely along Z
        Ey = params.amplitudeE * Math.sin(k * x - time * omega);
        Ez = 0;
        By = 0;
        Bz = params.amplitudeB * Math.sin(k * x - time * omega + params.phaseDiff);
      } else if (params.polarization === 'circular') {
        // Helical path: E rotates in Y-Z circle, B is orthogonal to E
        Ey = params.amplitudeE * Math.sin(k * x - time * omega);
        Ez = params.amplitudeE * Math.cos(k * x - time * omega);
        By = -params.amplitudeB * Math.cos(k * x - time * omega);
        Bz = params.amplitudeB * Math.sin(k * x - time * omega);
      } else if (params.polarization === 'elliptical') {
        // Helical with phase difference and separate amplitudes
        Ey = params.amplitudeE * Math.sin(k * x - time * omega);
        Ez = params.amplitudeB * Math.cos(k * x - time * omega + params.phaseDiff);
        By = -params.amplitudeE * Math.cos(k * x - time * omega + params.phaseDiff);
        Bz = params.amplitudeB * Math.sin(k * x - time * omega);
      }

      const pBase = project(x, 0, 0);

      // Draw E Vector (Vertical-ish Blue arrows)
      if (params.showE && Math.abs(Ey) > 0.5 || Math.abs(Ez) > 0.5) {
        const pEEnd = project(x, Ey, Ez);
        ctx.shadowBlur = 0; // disable shadow for vector lines to stay clean
        // Depth cueing
        const distRatio = (pEEnd.z + 300) / 600;
        const opacity = Math.max(0.2, Math.min(0.7, 0.95 - distRatio));
        const vectorColor = params.colorMode === 'monochrome' 
          ? `rgba(255, 255, 255, ${opacity * 0.8})` 
          : `rgba(0, 212, 255, ${opacity})`;

        drawArrow(pBase, pEEnd, vectorColor, 1.2, 4);
      }

      // Draw B Vector (Horizontal-ish Red arrows)
      if (params.showB && Math.abs(By) > 0.5 || Math.abs(Bz) > 0.5) {
        const pBEnd = project(x, By, Bz);
        ctx.shadowBlur = 0;
        // Depth cueing
        const distRatio = (pBEnd.z + 300) / 600;
        const opacity = Math.max(0.15, Math.min(0.65, 0.9 - distRatio));
        const vectorColor = params.colorMode === 'monochrome' 
          ? `rgba(255, 255, 255, ${opacity * 0.4})` 
          : `rgba(255, 49, 49, ${opacity})`;

        drawArrow(pBase, pBEnd, vectorColor, 1.2, 4);
      }
    }
    ctx.restore();

    // 5. Draw Continuous Sine Wave Curves with intense Neon glow effect
    const waveResolution = 1.5; // High resolution points for a silky smooth curve

    // Draw E-Field Curve
    if (params.showE) {
      ctx.save();
      // Neon glow properties
      ctx.shadowBlur = 12;
      ctx.shadowColor = colorEGlow;
      ctx.strokeStyle = colorE;
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      let first = true;

      for (let x = axisStartVal; x <= axisEndVal; x += waveResolution) {
        let Ey = 0;
        let Ez = 0;

        if (params.polarization === 'linear') {
          Ey = params.amplitudeE * Math.sin(k * x - time * omega);
          Ez = 0;
        } else if (params.polarization === 'circular') {
          Ey = params.amplitudeE * Math.sin(k * x - time * omega);
          Ez = params.amplitudeE * Math.cos(k * x - time * omega);
        } else if (params.polarization === 'elliptical') {
          Ey = params.amplitudeE * Math.sin(k * x - time * omega);
          Ez = params.amplitudeB * Math.cos(k * x - time * omega + params.phaseDiff);
        }

        const pProj = project(x, Ey, Ez);
        if (first) {
          ctx.moveTo(pProj.x, pProj.y);
          first = false;
        } else {
          ctx.lineTo(pProj.x, pProj.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw B-Field Curve
    if (params.showB) {
      ctx.save();
      // Neon glow properties
      ctx.shadowBlur = 12;
      ctx.shadowColor = colorBGlow;
      ctx.strokeStyle = colorB;
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      let first = true;

      for (let x = axisStartVal; x <= axisEndVal; x += waveResolution) {
        let By = 0;
        let Bz = 0;

        if (params.polarization === 'linear') {
          By = 0;
          Bz = params.amplitudeB * Math.sin(k * x - time * omega + params.phaseDiff);
        } else if (params.polarization === 'circular') {
          By = -params.amplitudeB * Math.cos(k * x - time * omega);
          Bz = params.amplitudeB * Math.sin(k * x - time * omega);
        } else if (params.polarization === 'elliptical') {
          By = -params.amplitudeE * Math.cos(k * x - time * omega + params.phaseDiff);
          Bz = params.amplitudeB * Math.sin(k * x - time * omega);
        }

        const pProj = project(x, By, Bz);
        if (first) {
          ctx.moveTo(pProj.x, pProj.y);
          first = false;
        } else {
          ctx.lineTo(pProj.x, pProj.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw Propagation Vector (k) & Poynting Vector (S)
    if (params.showPoynting) {
      ctx.save();
      // Wave propagation is always along X-axis
      // We draw an energetic gold vector at the front of the wave
      const pSStart = project(axisEndVal, 0, 0);
      const pSEnd = project(axisEndVal + 40, 0, 0);

      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
      const goldColor = '#eab308';

      // Animated thickness/glow pulsating effect
      const pulseWidth = 3 + Math.sin(time * 0.3) * 1;
      drawArrow(pSStart, pSEnd, goldColor, pulseWidth, 8);

      // Label floating above Poynting vector
      const labelProj = project(axisEndVal + 45, 10, 0);
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillStyle = goldColor;
      ctx.fillText('S = E × B', labelProj.x, labelProj.y - 10);
      
      // Floating small dots emitting from Poynting vector
      const dotCount = 3;
      for (let d = 0; d < dotCount; d++) {
        const progress = ((time * 0.8 + d * 0.33) % 1.0);
        const dotX = axisEndVal + 40 + progress * 30;
        const dotProj = project(dotX, 0, 0);
        ctx.beginPath();
        ctx.arc(dotProj.x, dotProj.y, 2 * (1 - progress), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234, 179, 8, ${1 - progress})`;
        ctx.fill();
      }
      ctx.restore();
    }

    // 7. Render Text/Equations Labels (floating dynamically in 3D scene)
    if (params.showLabels) {
      ctx.save();
      ctx.font = '500 11px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';

      // Propagation direction label
      const kLabelProj = project(axisEndVal - 30, -15, 0);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText('k (propagation axis)', kLabelProj.x, kLabelProj.y);

      // Draw E label floating near a peak
      // Let's find an elegant coordinate around x = -100
      let xPeak = -100;
      let EyPeak = params.amplitudeE * Math.sin(k * xPeak - time * omega);
      let EzPeak = params.polarization === 'linear' ? 0 : params.amplitudeE * Math.cos(k * xPeak - time * omega);
      const eLabelProj = project(xPeak, EyPeak + (EyPeak >= 0 ? 15 : -15), EzPeak);
      ctx.fillStyle = colorE;
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillText('E (Electric Field)', eLabelProj.x, eLabelProj.y);

      // Draw B label
      let ByPeak = params.polarization === 'linear' ? 0 : -params.amplitudeB * Math.cos(k * xPeak - time * omega);
      let BzPeak = params.polarization === 'linear' 
        ? params.amplitudeB * Math.sin(k * xPeak - time * omega + params.phaseDiff)
        : params.amplitudeB * Math.sin(k * xPeak - time * omega);
      
      // Project offset to make B label clear
      const bLabelProj = project(xPeak, ByPeak, BzPeak + (BzPeak >= 0 ? 20 : -20));
      ctx.fillStyle = colorB;
      ctx.fillText('B (Magnetic Field)', bLabelProj.x, bLabelProj.y);

      ctx.restore();
    }

  }, [camera, time, isPlaying, params, particles]);

  // Mouse drag handlers to rotate 3D camera
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    cameraStart.current = { yaw: camera.yaw, pitch: camera.pitch };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Sensible rotation speeds
    const rotSpeedX = 0.007;
    const rotSpeedY = 0.007;

    setCamera((prev) => {
      let nextPitch = cameraStart.current.pitch + dy * rotSpeedY;
      // Clamp pitch to avoid getting fully upside down
      nextPitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, nextPitch));

      return {
        ...prev,
        yaw: cameraStart.current.yaw + dx * rotSpeedX,
        pitch: nextPitch
      };
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Wheel to zoom in/out
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.001;
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.4, Math.min(2.5, prev.zoom + zoomFactor))
    }));
  };

  // Zoom buttons
  const adjustZoom = (amount: number) => {
    setCamera((prev) => ({
      ...prev,
      zoom: Math.max(0.4, Math.min(2.5, prev.zoom + amount))
    }));
  };

  // Reset Camera View
  const resetCamera = () => {
    setCamera({
      yaw: -0.45,
      pitch: 0.25,
      zoom: 1.1
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full rounded-2xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden group shadow-2xl backdrop-blur-md">
      
      {/* 3D Drag Overlay Info */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5 bg-black/65 backdrop-blur-sm px-3.5 py-2.5 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-400 select-none">
        <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <Compass className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          Interactive 3D Engine
        </span>
        <span>• Left-Click + Drag to rotate Camera</span>
        <span>• Scroll mouse wheel to zoom</span>
        <span>• Yaw: {(camera.yaw * (180 / Math.PI)).toFixed(0)}° | Pitch: {(camera.pitch * (180 / Math.PI)).toFixed(0)}°</span>
      </div>

      {/* Primary HTML Render Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        className="w-full h-full block cursor-grab active:cursor-grabbing transition-shadow"
      />

      {/* Floating 3D Canvas Actions overlay (Bottom-Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 bg-black/75 border border-zinc-800/80 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md">
        
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
            isPlaying 
              ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' 
              : 'bg-emerald-600/90 text-white hover:bg-emerald-500 hover:scale-105'
          }`}
          title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          id="btn-play-pause"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Speed Controls display indicator */}
        <div className="h-4 w-[1px] bg-zinc-800" />

        {/* Zoom In */}
        <button
          onClick={() => adjustZoom(0.15)}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Zoom In"
          id="btn-zoom-in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => adjustZoom(-0.15)}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Zoom Out"
          id="btn-zoom-out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset View */}
        <button
          onClick={resetCamera}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Reset Camera Angle"
          id="btn-reset-cam"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => onChangeParams((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))}
          className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
            params.autoRotate 
              ? 'bg-sky-950/60 border-sky-500/50 text-sky-400' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
          }`}
          title="Toggle Camera Auto-Orbit"
          id="btn-auto-rotate"
        >
          <Cpu className={`w-4 h-4 ${params.autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
        </button>
      </div>

      {/* Vector Color Legends overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 bg-black/65 border border-zinc-800/80 px-3.5 py-2.5 rounded-lg font-mono text-[11px] select-none text-zinc-300">
        <span className="text-zinc-500 border-b border-zinc-800 pb-1 mb-0.5 font-bold">LEGEND</span>
        {params.showE && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-sm bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span>Electric Field <span className="text-[#00D4FF] font-bold">(E)</span></span>
          </div>
        )}
        {params.showB && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-sm bg-[#FF3131] shadow-[0_0_8px_rgba(255,49,49,0.8)]" />
            <span>Magnetic Field <span className="text-[#FF3131] font-bold">(B)</span></span>
          </div>
        )}
        {params.showPoynting && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-sm bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
            <span>Poynting Energy Flux <span className="text-yellow-400 font-bold">(S)</span></span>
          </div>
        )}
      </div>

      {/* Floating Status / Phase indicators (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/60 px-3 py-2 rounded-lg border border-zinc-800/50 text-[10px] font-mono text-zinc-500 pointer-events-none flex flex-col gap-0.5">
        <div>Polarization: <span className="text-zinc-300 capitalize">{params.polarization}</span></div>
        <div>Frequency: <span className="text-zinc-300">{(params.frequency * 100).toFixed(0)} MHz</span></div>
        <div>Wavelength: <span className="text-zinc-300">{(3 / params.frequency).toFixed(2)} m</span></div>
      </div>
    </div>
  );
}
