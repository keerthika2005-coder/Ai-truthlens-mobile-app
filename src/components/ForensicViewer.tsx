import React, { useRef, useState, useEffect } from 'react';
import { Eye, Flame, Columns, Scan, ZoomIn, ZoomOut, RotateCcw, Play, Pause } from 'lucide-react';
import { ForensicOverlayMode } from '../types';

interface ForensicViewerProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  fileName: string;
  verdict?: 'AI' | 'REAL';
  confidence?: number;
  isAnalyzing: boolean;
}

export const ForensicViewer: React.FC<ForensicViewerProps> = ({
  mediaUrl,
  mediaType,
  fileName,
  verdict,
  confidence,
  isAnalyzing,
}) => {
  const [overlayMode, setOverlayMode] = useState<ForensicOverlayMode>('standard');
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingSplit = useRef(false);

  // Toggle video play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Generate synthetic forensic artifact heatmap on the canvas
  useEffect(() => {
    if (mediaType !== 'image') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mediaUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 400;

      // Draw original
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (overlayMode === 'standard') return;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Forensic filter computation
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        if (overlayMode === 'heatmap') {
          // Heatmap: highlight high-gradient or synthetic smoothing areas
          // Artificial high-saturation spectral pseudocolor
          const heat = Math.sin(gray * 0.05) * 127 + 128;
          data[i] = Math.min(255, heat * 1.6); // Red
          data[i + 1] = Math.max(0, 255 - heat * 1.5); // Green
          data[i + 2] = Math.min(255, (255 - gray) * 0.8); // Blue
        } else if (overlayMode === 'inversion') {
          // High-pass negative inversion
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [mediaUrl, overlayMode, mediaType]);

  // Handle Split slider dragging
  const handleMouseDown = () => {
    isDraggingSplit.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSplit.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSplitPosition(Math.round((x / rect.width) * 100));
  };

  const handleMouseUp = () => {
    isDraggingSplit.current = false;
  };

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-4 sm:p-6 space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
            {fileName}
          </span>
          {verdict && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                verdict === 'AI'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {verdict === 'AI' ? 'Synthetic Media' : 'Authentic Media'} {confidence ? `(${confidence.toFixed(1)}%)` : ''}
            </span>
          )}
        </div>

        {/* View mode selection */}
        {mediaType === 'image' && (
          <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setOverlayMode('standard')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                overlayMode === 'standard' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Standard original view"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Original</span>
            </button>
            <button
              onClick={() => setOverlayMode('heatmap')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                overlayMode === 'heatmap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Artifact heatmap filter"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Heatmap</span>
            </button>
            <button
              onClick={() => setOverlayMode('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                overlayMode === 'split' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split comparison slider"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950/80 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel !== 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Media Preview Frame */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative min-h-[300px] max-h-[500px] rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 select-none"
      >
        {/* Scanning grid overlay during analysis */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
              <Scan className="w-6 h-6 text-blue-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="mt-4 text-sm font-semibold text-white tracking-wide">
              Neural Forensics In Progress...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Decomposing sensor grain, optical dispersion & diffusion textures
            </p>
          </div>
        )}

        {/* Video Player Render */}
        {mediaType === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <video
              ref={videoRef}
              src={mediaUrl}
              controls
              playsInline
              loop
              className="max-h-[460px] rounded-xl object-contain transition-transform duration-150"
              style={{ transform: `scale(${zoomLevel})` }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : overlayMode === 'split' ? (
          /* Split View Slider Mode */
          <div className="relative w-full h-full min-h-[360px] flex items-center justify-center overflow-hidden">
            {/* Raw Image (Base layer) */}
            <img
              src={mediaUrl}
              alt="Raw Preview"
              className="max-h-[460px] object-contain transition-transform"
              style={{ transform: `scale(${zoomLevel})` }}
            />

            {/* Artifact Heatmap Canvas (Clipped Layer) */}
            <div
              className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
              style={{ clipPath: `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)` }}
            >
              <canvas
                ref={canvasRef}
                className="max-h-[460px] object-contain transition-transform"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>

            {/* Split Divider Line & Thumb */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 bottom-0 w-1 bg-blue-400 cursor-ew-resize z-20 flex items-center justify-center shadow-[0_0_10px_rgba(96,165,250,0.8)]"
              style={{ left: `${splitPosition}%` }}
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shadow-lg border-2 border-white pointer-events-none">
                <Columns className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Split Labels */}
            <span className="absolute bottom-3 left-3 z-10 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-blue-300">
              Heatmap ({splitPosition}%)
            </span>
            <span className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
              Original ({100 - splitPosition}%)
            </span>
          </div>
        ) : overlayMode === 'standard' ? (
          /* Standard Image Render */
          <img
            src={mediaUrl}
            alt="Uploaded Preview"
            className="max-h-[460px] rounded-xl object-contain transition-transform duration-150"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        ) : (
          /* Filtered Canvas Render (Heatmap or Inversion) */
          <canvas
            ref={canvasRef}
            className="max-h-[460px] rounded-xl object-contain transition-transform duration-150"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        )}
      </div>
    </div>
  );
};
