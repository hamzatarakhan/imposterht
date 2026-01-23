import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'imposter-saved-players';
const MAX_SAVED_PLAYERS = 30;

export interface SavedPlayer {
  name: string;
  avatar: string;
}

export const useSavedPlayers = () => {
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayer[]>([]);

  // Load saved players from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPlayers(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading saved players:', error);
    }
  }, []);

  // Save to localStorage whenever savedPlayers changes
  const saveToStorage = useCallback((players: SavedPlayer[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Error saving players:', error);
    }
  }, []);

  // Add multiple players (filters duplicates and default names)
  const addPlayers = useCallback((players: SavedPlayer[]) => {
    setSavedPlayers(current => {
      const newPlayers = [...current];
      
      players.forEach(player => {
        const trimmedName = player.name.trim();
        
        // Skip empty names and default names like \"لاعب 1\"
        if (!trimmedName || /^لاعب \d+$/.test(trimmedName)) {
          return;
        }
        
        // Check for duplicate (case-insensitive)
        const existingIndex = newPlayers.findIndex(
          p => p.name.toLowerCase() === trimmedName.toLowerCase()
        );
        
        if (existingIndex !== -1) {
          // Update existing player's avatar
          newPlayers[existingIndex] = { name: trimmedName, avatar: player.avatar };
        } else {
          // Add new player
          newPlayers.push({ name: trimmedName, avatar: player.avatar });
        }
      });
      
      // Keep only the last MAX_SAVED_PLAYERS
      const trimmed = newPlayers.slice(-MAX_SAVED_PLAYERS);
      saveToStorage(trimmed);
      return trimmed;
    });
  }, [saveToStorage]);

  // Remove a single player by name
  const removePlayer = useCallback((name: string) => {
    setSavedPlayers(current => {
      const filtered = current.filter(
        p => p.name.toLowerCase() !== name.toLowerCase()
      );
      saveToStorage(filtered);
      return filtered;
    });
  }, [saveToStorage]);

  // Clear all saved players
  const clearAllPlayers = useCallback(() => {
    setSavedPlayers([]);
    saveToStorage([]);
  }, [saveToStorage]);

  return {
    savedPlayers,
    addPlayers,
    removePlayer,
    clearAllPlayers,
  };
};

