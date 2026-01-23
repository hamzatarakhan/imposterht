import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface SettingsState {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
}

interface SettingsContextType extends SettingsState {
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  playSound: (type: 'click' | 'reveal' | 'win' | 'lose' | 'tick' | 'alarm' | 'intro') => void;
  vibrate: (pattern?: number | number[]) => void;
  unlockAudio: () => void;
}

const STORAGE_KEY = 'imposter-settings';

const defaultSettings: SettingsState = {
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Sound frequencies for different events
const soundFrequencies = {
  click: { frequency: 600, duration: 50 },
  reveal: { frequency: 800, duration: 150 },
  win: { frequency: 523, duration: 200 }, // C5
  lose: { frequency: 220, duration: 300 }, // A3
  tick: { frequency: 440, duration: 30 }, // Short tick
  alarm: { frequency: 880, duration: 400 }, // Alarm sound
  intro: { frequency: 330, duration: 600 }, // E4 - mysterious intro
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return defaultSettings;
  });

  // Singleton AudioContext for mobile compatibility
  const audioContextRef = useRef<AudioContext | null>(null);
  const isAudioUnlockedRef = useRef(false);

  // Get or create AudioContext
  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return audioContextRef.current;
    } catch (e) {
      console.error('Error creating AudioContext:', e);
      return null;
    }
  };

  // Unlock audio for mobile browsers (must be called from user gesture)
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        isAudioUnlockedRef.current = true;
        console.log('Audio unlocked successfully');
      }).catch(e => {
        console.error('Failed to unlock audio:', e);
      });
    } else if (ctx) {
      isAudioUnlockedRef.current = true;
    }
  };

  // Auto-unlock audio on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      unlockAudio();
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('touchend', handleUserInteraction, { passive: true });
    document.addEventListener('click', handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [settings]);

  const setSoundEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const setVibrationEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, vibrationEnabled: enabled }));
  };

  const setDarkMode = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, darkMode: enabled }));
  };

  // Play sound using Web Audio API
  const playSound = (type: 'click' | 'reveal' | 'win' | 'lose' | 'tick' | 'alarm' | 'intro') => {
    if (!settings.soundEnabled) return;

    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;

      // Resume context if suspended (mobile browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      const { frequency, duration } = soundFrequencies[type];

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);

      // For win sound, add a second note
      if (type === 'win') {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 659; // E5
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime + 0.1);
        osc2.stop(audioContext.currentTime + 0.3);

        const osc3 = audioContext.createOscillator();
        const gain3 = audioContext.createGain();
        osc3.connect(gain3);
        gain3.connect(audioContext.destination);
        osc3.frequency.value = 784; // G5
        osc3.type = 'sine';
        gain3.gain.setValueAtTime(0.3, audioContext.currentTime + 0.2);
        gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        osc3.start(audioContext.currentTime + 0.2);
        osc3.stop(audioContext.currentTime + 0.4);
      }

      // For alarm sound, make it more noticeable
      if (type === 'alarm') {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1200;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        osc2.start(audioContext.currentTime + 0.15);
        osc2.stop(audioContext.currentTime + 0.4);
      }

      // For intro sound, create a mysterious ascending melody
      if (type === 'intro') {
        // Note 2 - E4 higher
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 392; // G4
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.25, audioContext.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime + 0.15);
        osc2.stop(audioContext.currentTime + 0.5);

        // Note 3 - B4
        const osc3 = audioContext.createOscillator();
        const gain3 = audioContext.createGain();
        osc3.connect(gain3);
        gain3.connect(audioContext.destination);
        osc3.frequency.value = 494; // B4
        osc3.type = 'sine';
        gain3.gain.setValueAtTime(0.25, audioContext.currentTime + 0.3);
        gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
        osc3.start(audioContext.currentTime + 0.3);
        osc3.stop(audioContext.currentTime + 0.7);

        // Note 4 - E5 (mysterious end)
        const osc4 = audioContext.createOscillator();
        const gain4 = audioContext.createGain();
        osc4.connect(gain4);
        gain4.connect(audioContext.destination);
        osc4.frequency.value = 659; // E5
        osc4.type = 'sine';
        gain4.gain.setValueAtTime(0.2, audioContext.currentTime + 0.5);
        gain4.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
        osc4.start(audioContext.currentTime + 0.5);
        osc4.stop(audioContext.currentTime + 1.0);
      }
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  };

  // Vibrate device
  const vibrate = (pattern: number | number[] = 50) => {
    if (!settings.vibrationEnabled) return;

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.error('Error vibrating:', e);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setSoundEnabled,
        setVibrationEnabled,
        setDarkMode,
        playSound,
        vibrate,
        unlockAudio,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
