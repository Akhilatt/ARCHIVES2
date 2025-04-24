'use client';

import React, { useEffect, useState } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicrophoneIcon, StopIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pulseAnimation, setPulseAnimation] = useState(false);
  
  // Check if speech recognition is supported by the browser
  const [isBrowserSupported, setIsBrowserSupported] = useState(false);
  
  useEffect(() => {
    // Check browser support on mount
    try {
      setIsBrowserSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    } catch (error) {
      setIsBrowserSupported(false);
    }
  }, []);
  
  // Use speech recognition hook with error handling
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    clearTranscriptOnListen: true
  });

  // Animations when listening
  useEffect(() => {
    if (listening) {
      setPulseAnimation(true);
    } else {
      setPulseAnimation(false);
    }
  }, [listening]);

  // Forward transcript to parent component
  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  // Start or stop listening based on button click
  const toggleListening = () => {
    try {
      if (listening) {
        SpeechRecognition.abortListening();
        setIsListening(false);
      } else {
        // Reset any previous errors
        setErrorMsg('');
        
        // Start listening in continuous mode
        SpeechRecognition.startListening({ 
          continuous: true,
          language: 'en-US'
        }).catch((error: Error) => {
          console.error('Speech recognition error:', error);
          setErrorMsg('Could not access microphone');
        });
        
        setIsListening(true);
      }
    } catch (error: unknown) {
      console.error('Speech recognition error:', error);
      setErrorMsg('Speech recognition failed');
      setIsListening(false);
    }
  };

  // If browser doesn't support speech recognition
  if (!isBrowserSupported || !browserSupportsSpeechRecognition) {
    return (
      <div className="p-2 bg-yellow-50 text-yellow-700 rounded-md text-sm flex items-center">
        <ExclamationCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
        <span>Browser doesn't support speech recognition</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center justify-center p-2 rounded-full transition-all duration-200
          ${listening 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }
          ${pulseAnimation ? 'scale-105' : 'scale-100'}
        `}
        title={listening ? 'Stop listening' : 'Start listening'}
      >
        <div className="relative">
          {listening && (
            <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></div>
          )}
          {listening ? (
            <StopIcon className="h-5 w-5" />
          ) : (
            <MicrophoneIcon className="h-5 w-5" />
          )}
        </div>
      </button>
      
      <div className="absolute top-full right-0 mt-1 whitespace-nowrap">
        <span className={`text-xs text-gray-500 ${listening ? 'font-medium text-red-500' : ''}`}>
          {listening ? 'Listening...' : ''}
        </span>
        
        {errorMsg && (
          <div className="mt-1 text-xs text-red-500 flex items-center slide-up">
            <ExclamationCircleIcon className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput; 