import React from 'react';
import { Shield, Sparkles, ExternalLink, History, Info } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onOpenInfo: () => void;
  detectorReady: boolean;
  selectedFilter: 'all' | 'image' | 'video';
  onSelectFilter: (filter: 'all' | 'image' | 'video') => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onOpenInfo,
  detectorReady,
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-lg shadow-blue-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                AI TruthLens
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold tracking-wide uppercase">
                <Sparkles className="w-2.5 h-2.5" />
                App
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${detectorReady ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`}></span>
                {detectorReady ? 'Neural Engine Active' : 'Connecting Core...'}
              </span>
            </div>
          </div>
        </div>

        {/* Media Filter Tabs */}
        <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            id="filter-all-btn"
            onClick={() => onSelectFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Media
          </button>
          <button
            id="filter-image-btn"
            onClick={() => onSelectFilter('image')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'image'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Images (JPG/PNG/WEBP)
          </button>
          <button
            id="filter-video-btn"
            onClick={() => onSelectFilter('video')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedFilter === 'video'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Videos (MP4/WEBM)
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Open in New Tab Button */}
          <a
            id="open-new-tab-link"
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
            title="Open in a standalone browser window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Open Window</span>
          </a>

          {/* History Drawer Trigger */}
          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
            title="View Scan History"
          >
            <History className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Scans</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-[10px] font-bold text-white leading-tight">
                {historyCount}
              </span>
            )}
          </button>

          {/* Info Modal Trigger */}
          <button
            id="open-info-btn"
            onClick={onOpenInfo}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs transition"
            title="How TruthLens Works"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
