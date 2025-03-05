export interface SoundSample {
    id: string;
    name: string;
    audioBlob: Blob;
    waveform?: number[];
    keyBinding?: string;
  }
  
  export interface TrimState {
    sampleId: string | null;
    startTime: number;
    endTime: number;
    duration: number;
    isPlaying: boolean;
    currentTime: number;
  }