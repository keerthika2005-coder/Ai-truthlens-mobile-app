import React from 'react';
import { X, History, Trash2, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Analysis History</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <History className="w-10 h-10 mb-3 stroke-1 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No Scans Recorded Yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Upload an image or video to run a deep forensic detection scan.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isAI = item.result.result === 'AI';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="group p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all duration-150 flex items-center gap-3"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-800">
                    {item.mediaType === 'image' ? (
                      <img
                        src={item.previewUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-purple-400 font-bold bg-purple-950/30">
                        VIDEO
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1 ${
                          isAI
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isAI ? (
                          <ShieldAlert className="w-2.5 h-2.5" />
                        ) : (
                          <ShieldCheck className="w-2.5 h-2.5" />
                        )}
                        {isAI ? 'AI' : 'Real'} ({item.result.confidence?.toFixed(0)}%)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-blue-300">
                      {item.fileName}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.result.reason}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <span className="text-[11px] text-slate-500">Stored locally in app</span>
          </div>
        )}
      </div>
    </div>
  );
};
