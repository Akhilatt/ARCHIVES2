declare module 'react-speech-recognition' {
  interface UseSpeechRecognitionResponse {
    transcript: string;
    listening: boolean;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
    resetTranscript: () => void;
    startListening: (options?: SpeechRecognitionOptions) => Promise<void>;
    stopListening: () => void;
  }

  interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
    interimResults?: boolean;
  }

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => Promise<void>;
    stopListening: () => void;
    abortListening: () => void;
  };

  function useSpeechRecognition(options?: {
    transcribing?: boolean;
    clearTranscriptOnListen?: boolean;
    commands?: any[];
  }): UseSpeechRecognitionResponse;

  export { SpeechRecognition };
  export default useSpeechRecognition;
} 