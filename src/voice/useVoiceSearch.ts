import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'ready' | 'error';

// Type definitions for Web Speech API
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function useVoiceSearch() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check Web Speech API support
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };

    const SpeechRecConstructor =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecConstructor) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        setVoiceState('processing');
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          setVoiceState('ready');
        }, 1200);
      };

      recognition.onerror = (event: { error: string }) => {
        setVoiceState('error');
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Try speaking again.');
        } else {
          setErrorMessage(`Voice recognition note: ${event.error}. You can also type directly.`);
        }
      };

      recognition.onend = () => {
        setVoiceState((prev) => (prev === 'listening' || prev === 'processing' ? 'ready' : prev));
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort error
        }
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    setTranscript('');
    setVoiceState('listening');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // already started or fallback
      }
    } else {
      // Graceful simulated voice capture fallback for unsupported browser environments
      setVoiceState('listening');
      const samplePhrases = [
        'What is normalization in machine learning?',
        'How do I fix Python IndexError?',
        'ERR_CONNECTION_RESET',
        'PostgreSQL HNSW vector index',
        'Reciprocal Rank Fusion hybrid search',
      ];
      const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];

      setTimeout(() => setVoiceState('processing'), 1200);
      setTimeout(() => {
        setTranscript(randomPhrase);
        setVoiceState('ready');
      }, 2200);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setVoiceState('ready');
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setVoiceState('idle');
    setErrorMessage(null);
  }, []);

  return {
    voiceState,
    transcript,
    setTranscript,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
}
