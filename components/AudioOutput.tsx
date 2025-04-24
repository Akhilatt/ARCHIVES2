'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

interface AudioOutputProps {
  text: string;
}

const AudioOutput: React.FC<AudioOutputProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  
  // Check browser support on component mount with useEffect
  useEffect(() => {
    try {
      const supported = 'speechSynthesis' in window && typeof window.speechSynthesis.speak === 'function';
      setIsSupported(supported);
    } catch (err) {
      setIsSupported(false);
    }
    
    // Cancel any ongoing speech when component unmounts
    return () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (err) {
        // Ignore any errors on cleanup
      }
    };
  }, []);
  
  // Define stop function first
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } catch (err) {
      console.error('Error stopping speech:', err);
      setError('Error stopping speech');
    }
  }, [isSupported]);
  
  // Define speak function using stop
  const speak = useCallback(() => {
    if (!isSupported || !text.trim()) return;
    
    try {
      // First stop any ongoing speech
      stop();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set event handlers
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError('Failed to play audio');
      };
      
      // Set speaking state and clear any previous errors
      setIsSpeaking(true);
      setError('');
      
      // Actually speak
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
      setError('Unable to use text-to-speech');
    }
  }, [isSupported, text, stop]);

  // Early return if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={isSpeaking ? stop : speak}
          className={`flex items-center justify-center p-2 ${
            isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white rounded-full transition-colors`}
          title={isSpeaking ? "Stop speaking" : "Read email aloud"}
          disabled={!text.trim()}
        >
          {isSpeaking ? (
            <SpeakerXMarkIcon className="h-5 w-5" />
          ) : (
            <SpeakerWaveIcon className="h-5 w-5" />
          )}
        </button>
        <span className="text-sm text-gray-500">
          {isSpeaking ? 'Stop' : 'Read aloud'}
        </span>
      </div>
      
      {error && (
        <div className="mt-1 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioOutput; 