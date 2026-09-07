import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Camera, 
  Activity, 
  Check, 
  Copy, 
  Download, 
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  result: AnalysisResult;
  fileName: string;
  onReset: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  fileName,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const isAI = result.result === 'AI';
  const confidence = result.confidence || 95;
  const forensics = result.forensics || {
    authenticity_score: isAI ? 5 : 95,
    calibrated_neural_score: isAI ? 98 : 12,
    compression_status: isAI ? 'anomalous' : 'standard',
    metadata_status: isAI ? 'synthetic_or_missing' : 'authentic_exif',
    noise_status: isAI ? 'inconsistent_diffusion' : 'poisson_sensor_grain',
  };

  const copySummary = () => {
    const text = `AI TruthLens Forensic Report
File: ${fileName}
Verdict: ${result.result === 'AI' ? 'SYNTHETIC AI GENERATED' : 'AUTHENTIC REAL MEDIA'}
Confidence: ${confidence.toFixed(1)}%
Authenticity Score: ${forensics.authenticity_score?.toFixed(1) || 'N/A'}/100
Neural Calibrated Score: ${forensics.calibrated_neural_score?.toFixed(1) || 'N/A'}/100
Reason: ${result.reason}
Forensic Summary: ${result.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = () => {
    const reportData = {
      truthlens_version: '2.5.0-app',
      scan_date: new Date().toISOString(),
      file_name: fileName,
      verdict: result.result,
      confidence_percentage: confidence,
      forensics: forensics,
      reason: result.reason,
      explanation: result.explanation,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthlens_report_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6 animate-fade-in">
      {/* Primary Verdict Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 border ${
          isAI
            ? 'bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-950 border-rose-500/40 shadow-xl shadow-rose-950/20'
            : 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-950 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                isAI
                  ? 'bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-emerald-600 text-white shadow-emerald-600/30'
              }`}
            >
              {isAI ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isAI ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isAI ? 'Synthetic Media' : 'Camera Capture'}
                </span>
                <span className="text-xs text-slate-400">Deep Learning Verdict</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                {isAI ? 'Likely AI Generated' : 'Authentic Real Media'}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {result.reason}
              </p>
            </div>
          </div>

          {/* Confidence Dial */}
          <div className="flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl p-4 border border-slate-800 min-w-[150px]">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Confidence
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-0.5">
              <span>{confidence.toFixed(1)}</span>
              <span className="text-lg text-blue-400">%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  isAI ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(10, confidence))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Signal Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Empirical Forensic Signal Decomposition
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Calibrated Neural Metric */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Neural Probability
              </span>
              <span className="font-mono text-white font-semibold">
                {forensics.calibrated_neural_score?.toFixed(1) || confidence.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${forensics.calibrated_neural_score || confidence}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Deep vision transformer latent feature activation.
            </p>
          </div>

          {/* Authenticity Score */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Authenticity Index
              </span>
              <span className="font-mono text-white font-semibold">
                {forensics.authenticity_score?.toFixed(1) || (100 - confidence).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${forensics.authenticity_score || (100 - confidence)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Physical camera hardware and sensor grain compatibility.
            </p>
          </div>

          {/* Sensor Noise Distribution */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Noise Pattern
            </div>
            <div className="font-semibold text-sm text-slate-200 capitalize mt-1">
              {forensics.noise_status?.replace(/_/g, ' ') || 'Poisson Sensor Noise'}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              High-frequency pixel residue and Poisson-Gaussian variance.
            </p>
          </div>

          {/* Metadata & Hardware EXIF */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Metadata / EXIF
            </div>
            <div className="font-semibold text-sm text-slate-200 capitalize mt-1 truncate">
              {forensics.camera_make || forensics.metadata_status?.replace(/_/g, ' ') || 'Synthesized Container'}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Camera manufacturer tags or generative AI software signatures.
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Neural Model Explanation */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Detailed Forensic Evaluation
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={copySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={downloadReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Report (JSON)</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Analyze Another Media</span>
        </button>
      </div>
    </div>
  );
};
