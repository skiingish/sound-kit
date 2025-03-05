'use client';

import React, { useRef, useEffect } from 'react';
import { Play, Pause, Save, X } from 'lucide-react';
import { TrimState } from '../types';

interface TrimModalProps {
  trimState: TrimState;
  onClose: () => void;
  onSave: () => void;
  onPlaybackToggle: () => void;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const TrimModal: React.FC<TrimModalProps> = ({
  trimState,
  onClose,
  onSave,
  onPlaybackToggle,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Canvas setup would be handled by the parent component
  }, []);

  return (
    <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50'>
      <div className='bg-gray-800 p-6 rounded-lg shadow-xl max-w-3xl w-full'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold text-white'>Edit & Trim Sound</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={24} />
          </button>
        </div>

        <p className='text-gray-300 mb-4'>
          Click and drag on the waveform to set start and end points. Click near
          a marker to adjust it.
        </p>

        <div className='mb-6 bg-slate-800 rounded-lg overflow-hidden'>
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className='w-full cursor-pointer'
            onClick={onCanvasClick}
          />
        </div>

        <div className='flex justify-between items-center mb-6'>
          <div className='text-white'>
            <div className='text-sm text-gray-400'>
              Start: {trimState.startTime.toFixed(2)}s
            </div>
            <div className='text-sm text-gray-400'>
              End: {trimState.endTime.toFixed(2)}s
            </div>
            <div className='text-sm text-gray-400'>
              Duration: {(trimState.endTime - trimState.startTime).toFixed(2)}s
            </div>
          </div>

          <div className='flex space-x-3'>
            <button
              onClick={onPlaybackToggle}
              className={`${
                trimState.isPlaying
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } px-4 py-2 rounded text-white flex items-center`}
            >
              {trimState.isPlaying ? (
                <>
                  <Pause size={18} className='mr-2' />
                  Pause
                </>
              ) : (
                <>
                  <Play size={18} className='mr-2' />
                  Preview
                </>
              )}
            </button>

            <button
              onClick={onSave}
              className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white flex items-center'
            >
              <Save size={18} className='mr-2' />
              Save
            </button>

            <button
              onClick={onClose}
              className='bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white'
            >
              Cancel
            </button>
          </div>
        </div>

        <div className='text-gray-400 text-sm'>
          <p>
            Tip: For precise trimming, click near the start or end marker to
            adjust that specific point.
          </p>
        </div>
      </div>
    </div>
  );
};
