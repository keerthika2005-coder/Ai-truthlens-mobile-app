import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video, AlertCircle, Sparkles, Camera } from 'lucide-react';
import { SAMPLE_MEDIA } from '../data/samples';
import { SampleMedia } from '../types';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onSelectPreset: (preset: SampleMedia) => void;
  isAnalyzing: boolean;
  selectedFilter: 'all' | 'image' | 'video';
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  onSelectPreset,
  isAnalyzing,
  selectedFilter,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = selectedFilter === 'image'
    ? 'image/jpeg,image/png,image/webp,image/avif,image/bmp,image/tiff'
    : selectedFilter === 'video'
    ? 'video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/webp,image/avif,image/bmp,image/tiff,video/mp4,video/webm,video/quicktime';

  const validateAndPassFile = (file: File) => {
    setErrorMessage(null);
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|bmp|tiff)$/i.test(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);

    if (!isImage && !isVideo) {
      setErrorMessage('Unsupported file format. Please upload a standard image (JPG, PNG, WEBP) or video (MP4, WEBM).');
      return;
    }

    if (selectedFilter === 'image' && !isImage) {
      setErrorMessage('Image mode active: Please select an image file or switch filter to All/Video.');
      return;
    }

    if (selectedFilter === 'video' && !isVideo) {
      setErrorMessage('Video mode active: Please select a video file or switch filter to All/Image.');
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      setErrorMessage('File exceeds the 32MB maximum size limit. Please upload a compressed or shorter clip.');
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Zone */}
      <div
        id="drop-zone-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-950/20 shadow-xl shadow-blue-900/20 scale-[1.005]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        } ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndPassFile(e.target.files[0]);
            }
          }}
          className="hidden"
          id="media-file-input"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200 text-blue-400">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
            Drop image or video here to analyze
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Drag & drop or <span className="text-blue-400 font-semibold underline underline-offset-2">browse your device</span>. Analyzes sensor noise, diffusion artifacts, facial geometry, and EXIF camera signatures.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              JPG, PNG, WEBP, AVIF
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/50">
              <Video className="w-3.5 h-3.5 text-purple-400" />
              MP4, WEBM, MOV
            </span>
            <span className="px-2 py-1 text-slate-500">
              Up to 32MB
            </span>
          </div>
        </div>
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Test Presets (Instant 1-click test without user having to look for files) */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Try Sample Test Media
            </span>
          </div>
          <span className="text-[11px] text-slate-500">1-click instant load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_MEDIA.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectPreset(sample)}
              disabled={isAnalyzing}
              className="group text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      sample.badge === 'Synthetic'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {sample.badge}
                  </span>
                  {sample.badge === 'Synthetic' ? (
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-1">
                  {sample.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {sample.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-blue-400">
                <span>Load sample</span>
                <span>→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
