'use client';

import React, { useRef, useEffect } from 'react';

interface KeyBindingModalProps {
  onClose: () => void;
  onKeySelect: (key: string) => void;
}

export const KeyBindingModal: React.FC<KeyBindingModalProps> = ({
  onClose,
  onKeySelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const availableKeys = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'q',
    'w',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    'a',
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
  ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
      <div className='bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full'>
        <h3 className='text-xl font-bold text-white mb-4'>
          Assign Keyboard Key
        </h3>
        <p className='text-gray-300 mb-4'>
          Click a key below to assign it to this sound, or press any key on your
          keyboard.
        </p>

        <input
          ref={inputRef}
          type='text'
          className='opacity-0 absolute'
          onKeyDown={(e) => {
            e.preventDefault();
            const key = e.key.toLowerCase();
            if (availableKeys.includes(key)) {
              onKeySelect(key);
            }
          }}
        />

        <div className='grid grid-cols-10 gap-2 mb-4'>
          {availableKeys.slice(0, 10).map((key) => (
            <button
              key={key}
              className='bg-indigo-700 hover:bg-indigo-600 text-white py-2 rounded'
              onClick={() => onKeySelect(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
        <div className='grid grid-cols-10 gap-2 mb-4'>
          {availableKeys.slice(10, 20).map((key) => (
            <button
              key={key}
              className='bg-indigo-700 hover:bg-indigo-600 text-white py-2 rounded'
              onClick={() => onKeySelect(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
        <div className='grid grid-cols-9 gap-2 mb-4'>
          {availableKeys.slice(20, 29).map((key) => (
            <button
              key={key}
              className='bg-indigo-700 hover:bg-indigo-600 text-white py-2 rounded'
              onClick={() => onKeySelect(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-2 mb-4'>
          {availableKeys.slice(29).map((key) => (
            <button
              key={key}
              className='bg-indigo-700 hover:bg-indigo-600 text-white py-2 rounded'
              onClick={() => onKeySelect(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>

        <div className='flex justify-end'>
          <button
            onClick={onClose}
            className='bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
