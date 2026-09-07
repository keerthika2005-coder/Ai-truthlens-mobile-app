export interface ForensicsData {
  authenticity_score: number;
  calibrated_neural_score: number;
  compression_status: string;
  metadata_status: string;
  noise_status: string;
  camera_make?: string;
  camera_details?: string;
  noise_std?: number;
  artifacts?: string[];
  frequency_analysis?: string;
  symmetry_score?: number;
}

export interface AnalysisResult {
  result: 'AI' | 'REAL';
  confidence: number;
  reason: string;
  explanation: string;
  forensics: ForensicsData;
  media_type: 'image' | 'video';
  model?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  fileSize: number;
  mediaType: 'image' | 'video';
  previewUrl: string;
  result: AnalysisResult;
}

export interface SampleMedia {
  id: string;
  title: string;
  type: 'image' | 'video';
  description: string;
  badge: 'Synthetic' | 'Authentic';
  url: string;
  fileName: string;
}

export type ForensicOverlayMode = 'standard' | 'heatmap' | 'split' | 'inversion';
export type ActiveTab = 'analyze' | 'history' | 'about';
