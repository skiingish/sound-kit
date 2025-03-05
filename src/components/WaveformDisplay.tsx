import React from 'react';

interface WaveformDisplayProps {
  waveform?: number[];
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  waveform = [],
}) => {
  if (!waveform || waveform.length === 0) {
    return <div className='h-8 bg-white/10 rounded'></div>;
  }

  return (
    <div className='flex items-end h-8 space-x-0.5 w-full'>
      {waveform.map((amplitude, index) => (
        <div
          key={index}
          className='w-1 bg-indigo-400'
          style={{
            height: `${Math.max(4, amplitude * 32)}px`,
          }}
        ></div>
      ))}
    </div>
  );
};
