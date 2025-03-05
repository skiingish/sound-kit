'use client';
import React from 'react';
import { Mic, Square } from 'lucide-react';

interface RecordingStatusProps {
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const RecordingStatus: React.FC<RecordingStatusProps> = ({
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
}) => {
  return (
    <div className='mb-6 p-4 bg-black/20 rounded-lg text-white'>
      {isRecording ? (
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3'></div>
            <span>Recording... {recordingTime.toFixed(1)}s / 5.0s</span>
          </div>
          <button
            onClick={onStopRecording}
            className='bg-red-600 hover:bg-red-700 p-2 rounded-full transition-colors'
          >
            <Square size={20} />
          </button>
        </div>
      ) : (
        <div className='flex items-center justify-between'>
          <span>Ready to record (max 5 seconds)</span>
          <button
            onClick={onStartRecording}
            className='bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full transition-colors'
          >
            <Mic size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
