'use client';
import React from 'react';
import { Play, Pause, Mic, Scissors, Trash2, Keyboard } from 'lucide-react';
import { SoundSample as SoundSampleType } from '../types';
import { WaveformDisplay } from './WaveformDisplay';

interface SoundSampleProps {
  sample: SoundSampleType;
  isPlaying: boolean;
  isRecording: boolean;
  recordingId: string | null;
  onPlay: () => void;
  onPause: () => void;
  onReRecord: () => void;
  onTrim: () => void;
  onDelete: () => void;
  onNameEdit: () => void;
  onKeyBindingClick: () => void;
  onKeyBindingRemove: () => void;
}

export const SoundSample: React.FC<SoundSampleProps> = ({
  sample,
  isPlaying,
  isRecording,
  recordingId,
  onPlay,
  onPause,
  onReRecord,
  onTrim,
  onDelete,
  onNameEdit,
  onKeyBindingClick,
  onKeyBindingRemove,
}) => {
  return (
    <div
      className={`relative bg-white/20 rounded-lg p-4 flex flex-col items-center justify-between transition-all ${
        recordingId === sample.id
          ? 'ring-2 ring-red-500 animate-pulse'
          : isPlaying
          ? 'ring-2 ring-green-500'
          : ''
      }`}
    >
      <div className='w-full flex justify-between items-center mb-2'>
        <div
          className='text-white font-medium text-center truncate w-full cursor-pointer flex-1'
          onClick={onNameEdit}
        >
          {sample.name}
        </div>

        {sample.keyBinding ? (
          <div className='flex items-center ml-2'>
            <div
              className='bg-indigo-700 text-white text-xs font-bold px-2 py-1 rounded cursor-pointer flex items-center'
              onClick={onKeyBindingClick}
              title='Click to change key binding'
            >
              {sample.keyBinding.toUpperCase()}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onKeyBindingRemove();
                }}
                className='ml-1 text-white/70 hover:text-white'
                title='Remove key binding'
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onKeyBindingClick}
            className='text-white/70 hover:text-white ml-2'
            title='Assign keyboard key'
          >
            <Keyboard size={16} />
          </button>
        )}
      </div>

      <div className='w-full mb-3 px-2'>
        <WaveformDisplay waveform={sample.waveform} />
      </div>

      <button
        onClick={isPlaying ? onPause : onPlay}
        className={`${
          isPlaying
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } p-3 rounded-full transition-colors mb-2`}
        disabled={isRecording}
      >
        {isPlaying ? (
          <Pause size={24} className='text-white' />
        ) : (
          <Play size={24} className='text-white' />
        )}
      </button>

      <div className='flex space-x-2 mt-2'>
        <button
          onClick={onReRecord}
          className='bg-amber-600 hover:bg-amber-700 p-1.5 rounded-full transition-colors'
          disabled={isRecording}
          title='Re-record'
        >
          <Mic size={16} className='text-white' />
        </button>
        <button
          onClick={onTrim}
          className='bg-blue-600 hover:bg-blue-700 p-1.5 rounded-full transition-colors'
          disabled={isRecording}
          title='Edit & Trim'
        >
          <Scissors size={16} className='text-white' />
        </button>
        <button
          onClick={onDelete}
          className='bg-red-600 hover:bg-red-700 p-1.5 rounded-full transition-colors'
          disabled={isRecording}
          title='Delete'
        >
          <Trash2 size={16} className='text-white' />
        </button>
      </div>
    </div>
  );
};
