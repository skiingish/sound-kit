'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { SoundSample as SoundSampleType, TrimState } from '@/types';
import { generateWaveform, bufferToWave } from '@/utils/audio';
import { startMediaRecording } from '@/utils/recording';
import { SoundSample } from '@/components/SoundSample';
import { KeyBindingModal } from '@/components/KeyBindingModal';
import { TrimModal } from '@/components/TrimModal';
import { RecordingStatus } from '@/components/RecordingStatus';
import ButtonPad from '@/components/ButtonPad';

function App() {
  const [samples, setSamples] = useState<SoundSampleType[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newSampleName, setNewSampleName] = useState('');
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const [showKeyBindingModal, setShowKeyBindingModal] = useState(false);
  const [currentKeyBindingSampleId, setCurrentKeyBindingSampleId] = useState<
    string | null
  >(null);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [trimState, setTrimState] = useState<TrimState>({
    sampleId: null,
    startTime: 0,
    endTime: 0,
    duration: 0,
    isPlaying: false,
    currentTime: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const trimAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const trimPlaybackTimerRef = useRef<number | null>(null);

  // Load saved samples on mount
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const savedSamples = localStorage.getItem('soundSamples');
    if (savedSamples) {
      try {
        const parsedSamples = JSON.parse(savedSamples);
        Promise.all(
          parsedSamples.map(async (sample: any) => {
            // Convert base64 back to Blob
            const base64Data = sample.audioData.split(',')[1];
            const binaryData = atob(base64Data);
            const arrayBuffer = new ArrayBuffer(binaryData.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < binaryData.length; i++) {
              uint8Array[i] = binaryData.charCodeAt(i);
            }

            const blob = new Blob([arrayBuffer], { type: 'audio/wav' });

            return {
              ...sample,
              audioBlob: blob,
              waveform: sample.waveform || (await generateWaveform(blob)),
            };
          })
        ).then((loadedSamples) => {
          setSamples(loadedSamples);
        });
      } catch (error) {
        console.error('Failed to load saved samples:', error);
      }
    }

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // Save samples when they change
  useEffect(() => {
    if (samples.length > 0) {
      const saveSamples = async () => {
        const samplesToSave = await Promise.all(
          samples.map(async (sample) => {
            // Convert Blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
            });
            reader.readAsDataURL(sample.audioBlob);
            const audioData = await base64Promise;

            return {
              ...sample,
              audioData,
              audioBlob: undefined, // Don't store the Blob in localStorage
            };
          })
        );
        localStorage.setItem('soundSamples', JSON.stringify(samplesToSave));
      };

      saveSamples();
    } else {
      localStorage.removeItem('soundSamples');
    }
  }, [samples]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isRecording ||
        showKeyBindingModal ||
        showTrimModal
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const sampleWithKey = samples.find((sample) => sample.keyBinding === key);

      if (sampleWithKey) {
        playSample(sampleWithKey.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [samples, isRecording, showKeyBindingModal, showTrimModal]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 5) {
            stopRecording();
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async (id: string | null = null) => {
    try {
      const { stream, mediaRecorder } = await startMediaRecording();
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const waveform = await generateWaveform(audioBlob);

        if (id) {
          setSamples((prev) =>
            prev.map((sample) =>
              sample.id === id ? { ...sample, audioBlob, waveform } : sample
            )
          );
        } else {
          const newSample: SoundSampleType = {
            id: Date.now().toString(),
            name: `Sound ${samples.length + 1}`,
            audioBlob,
            waveform,
          };
          setSamples((prev) => [...prev, newSample]);
        }

        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setRecordingId(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingId(id);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(
        'Could not access microphone. Please check your browser permissions.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const playSample = (id: string) => {
    if (playingSampleId) {
      const currentAudio = audioRefs.current[playingSampleId];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    if (!audioRefs.current[id]) {
      const sample = samples.find((s) => s.id === id);
      if (!sample) return;

      audioRefs.current[id] = new Audio(URL.createObjectURL(sample.audioBlob));
    }

    audioRefs.current[id]?.play();
    setPlayingSampleId(id);
  };

  const pauseSample = (id: string) => {
    audioRefs.current[id]?.pause();
    setPlayingSampleId(null);
  };

  const deleteSample = (id: string) => {
    audioRefs.current[id] = null;
    setSamples((prev) => prev.filter((sample) => sample.id !== id));
  };

  const handleKeyBindingChange = (key: string) => {
    if (!currentKeyBindingSampleId) return;

    setSamples((prev) => {
      const newSamples = [...prev];

      // Remove key binding from any other sample that uses it
      const existingIndex = newSamples.findIndex((s) => s.keyBinding === key);
      if (existingIndex !== -1) {
        newSamples[existingIndex] = {
          ...newSamples[existingIndex],
          keyBinding: undefined,
        };
      }

      // Add key binding to current sample
      const currentIndex = newSamples.findIndex(
        (s) => s.id === currentKeyBindingSampleId
      );
      if (currentIndex !== -1) {
        newSamples[currentIndex] = {
          ...newSamples[currentIndex],
          keyBinding: key,
        };
      }

      return newSamples;
    });

    setShowKeyBindingModal(false);
    setCurrentKeyBindingSampleId(null);
  };

  const removeKeyBinding = (id: string) => {
    setSamples((prev) =>
      prev.map((sample) =>
        sample.id === id ? { ...sample, keyBinding: undefined } : sample
      )
    );
  };

  const openTrimModal = (id: string) => {
    const sample = samples.find((s) => s.id === id);
    if (!sample) return;

    setTrimState({
      sampleId: id,
      startTime: 0,
      endTime: 0,
      duration: 0,
      isPlaying: false,
      currentTime: 0,
    });

    setShowTrimModal(true);
  };

  const handleTrimSave = async () => {
    if (!trimState.sampleId || !trimAudioRef.current) return;

    try {
      const sample = samples.find((s) => s.id === trimState.sampleId);
      if (!sample) return;

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const arrayBuffer = await sample.audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(trimState.startTime * sampleRate);
      const endSample = Math.floor(trimState.endTime * sampleRate);
      const frameCount = endSample - startSample;

      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          trimmedData[i] = channelData[startSample + i];
        }
      }

      const trimmedBlob = await bufferToWave(trimmedBuffer, frameCount);
      const waveform = await generateWaveform(trimmedBlob);

      setSamples((prev) =>
        prev.map((s) =>
          s.id === trimState.sampleId
            ? { ...s, audioBlob: trimmedBlob, waveform }
            : s
        )
      );

      audioRefs.current[trimState.sampleId] = null;
      setShowTrimModal(false);
    } catch (error) {
      console.error('Error trimming audio:', error);
      alert('Failed to trim audio. Please try again.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-6'>
      <div className='max-w-4xl mx-auto'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-white mb-2'>Sound Board</h1>
          <p className='text-purple-200'>
            Record, play, and manage your sound samples
          </p>
        </header>

        <div className='bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl'>
          <RecordingStatus
            isRecording={isRecording}
            recordingTime={recordingTime}
            onStartRecording={() => startRecording()}
            onStopRecording={stopRecording}
          />

          <ButtonPad />

          <div className='mb-6 p-4 bg-indigo-900/40 rounded-lg text-white'>
            <div className='flex items-center'>
              <Plus className='mr-2' size={20} />
              <span>
                Press the assigned key to play a sound. Click the keyboard icon
                on a sound to assign a key.
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {samples.map((sample) => (
              <SoundSample
                key={sample.id}
                sample={sample}
                isPlaying={playingSampleId === sample.id}
                isRecording={isRecording}
                recordingId={recordingId}
                onPlay={() => playSample(sample.id)}
                onPause={() => pauseSample(sample.id)}
                onReRecord={() => startRecording(sample.id)}
                onTrim={() => openTrimModal(sample.id)}
                onDelete={() => deleteSample(sample.id)}
                onNameEdit={() => {
                  setEditingName(sample.id);
                  setNewSampleName(sample.name);
                }}
                onKeyBindingClick={() => {
                  setCurrentKeyBindingSampleId(sample.id);
                  setShowKeyBindingModal(true);
                }}
                onKeyBindingRemove={() => removeKeyBinding(sample.id)}
              />
            ))}

            {!isRecording && samples.length < 12 && (
              <button
                onClick={() => startRecording()}
                className='bg-white/10 hover:bg-white/20 rounded-lg p-4 flex flex-col items-center justify-center h-full border-2 border-dashed border-white/30 transition-colors'
              >
                <Plus size={32} className='text-white mb-2' />
                <span className='text-white'>Add Sound</span>
              </button>
            )}
          </div>

          {samples.length === 0 && !isRecording && (
            <div className='text-center py-10 text-white/70'>
              <p>
                No sounds yet. Click the microphone button to record your first
                sound!
              </p>
            </div>
          )}
        </div>

        <footer className='mt-8 text-center text-white/50 text-sm'>
          <p>
            Click on a sound name to edit it. Maximum 12 sounds can be saved.
          </p>
          <p className='mt-1'>
            Use keyboard keys to trigger sounds like a drum machine.
          </p>
          <p className='mt-1'>
            Use the scissors icon to trim and edit your sound samples.
          </p>
        </footer>
      </div>

      {showKeyBindingModal && (
        <KeyBindingModal
          onClose={() => {
            setShowKeyBindingModal(false);
            setCurrentKeyBindingSampleId(null);
          }}
          onKeySelect={handleKeyBindingChange}
        />
      )}

      {showTrimModal && (
        <TrimModal
          trimState={trimState}
          onClose={() => setShowTrimModal(false)}
          onSave={handleTrimSave}
          onPlaybackToggle={() => {
            if (trimAudioRef.current) {
              if (trimState.isPlaying) {
                trimAudioRef.current.pause();
                setTrimState((prev) => ({ ...prev, isPlaying: false }));
              } else {
                trimAudioRef.current.currentTime = trimState.currentTime;
                trimAudioRef.current.play();
                setTrimState((prev) => ({ ...prev, isPlaying: true }));
              }
            }
          }}
          onCanvasClick={(e) => {
            if (!canvasRef.current || !trimState.duration) return;

            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = canvas.width;
            const time = (x / width) * trimState.duration;

            const startPos = (trimState.startTime / trimState.duration) * width;
            const endPos = (trimState.endTime / trimState.duration) * width;
            const distToStart = Math.abs(x - startPos);
            const distToEnd = Math.abs(x - endPos);

            if (distToStart < distToEnd) {
              const newStartTime = Math.min(time, trimState.endTime - 0.1);
              setTrimState((prev) => ({
                ...prev,
                startTime: newStartTime,
                currentTime: newStartTime,
              }));

              if (trimAudioRef.current) {
                trimAudioRef.current.currentTime = newStartTime;
              }
            } else {
              const newEndTime = Math.max(time, trimState.startTime + 0.1);
              setTrimState((prev) => ({
                ...prev,
                endTime: newEndTime,
              }));
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
