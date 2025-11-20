export interface SongMetadata {
  artistName: string;
  songTitle: string;
  genre: string;
  era: string;
  mood: string;
  targetAudience: string;
  stylePreference: string;
  constraints: string;
  lyrics: string;
}

export interface TreatmentResponse {
  content: string; // The full markdown text
}

export interface VideoGenerationState {
  isGenerating: boolean;
  videoUrl: string | null;
  error: string | null;
  statusMessage: string;
}
