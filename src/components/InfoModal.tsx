import React from 'react';
import { X, Shield, Cpu, Eye, FileCode, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-lg">AI TruthLens Architecture</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Multimodal Neural Transformer</h4>
              <p className="text-slate-400 mt-0.5">
                Employs state-of-the-art vision models (Gemini Flash multimodal vision) to scrutinize micro-patterns, facial symmetry, and lighting inconsistencies.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Sensor Noise & Grain Deconstruction</h4>
              <p className="text-slate-400 mt-0.5">
                Authentic CMOS/CCD cameras produce Poisson-distributed photon noise. Diffusion models produce smoothed or artificial noise signatures without optical diffraction.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Hardware EXIF & Container Verification</h4>
              <p className="text-slate-400 mt-0.5">
                Extracts raw camera metadata (Canon, Nikon, Apple, Sony) and flags known generative signatures (Stable Diffusion, Midjourney, Flux, ComfyUI).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Supported Media Formats
            </div>
            <p>• Images: JPEG, PNG, WEBP, AVIF, BMP, TIFF (up to 32MB)</p>
            <p>• Videos: MP4, WebM, QuickTime MOV (temporal frame inspection)</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-md"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
};
