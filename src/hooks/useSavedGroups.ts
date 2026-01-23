import { useState, useEffect, useCallback } from 'react';
import { SavedPlayer } from './useSavedPlayers';

const STORAGE_KEY = 'imposter-saved-groups';
const MAX_GROUPS = 20;

export interface PlayerGroup {
  id: string;
  name: string;
  members: SavedPlayer[];
  createdAt: number;
}

export const useSavedGroups = () => {
  const [groups, setGroups] = useState<PlayerGroup[]>([]);

  // Load groups from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setGroups(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading saved groups:', error);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((groupsList: PlayerGroup[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groupsList));
    } catch (error) {
      console.error('Error saving groups:', error);
    }
  }, []);

  // Generate unique ID
  const generateId = () => `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a new group
  const addGroup = useCallback((name: string, members: SavedPlayer[]) => {
    const trimmedName = name.trim();
    if (!trimmedName || members.length < 3) return false;

    setGroups(current => {
      // Check for duplicate name
      if (current.some(g => g.name.toLowerCase() === trimmedName.toLowerCase())) {
        return current;
      }

      const newGroup: PlayerGroup = {
        id: generateId(),
        name: trimmedName,
        members,
        createdAt: Date.now(),
      };

      const newGroups = [...current, newGroup].slice(-MAX_GROUPS);
      saveToStorage(newGroups);
      return newGroups;
    });
    return true;
  }, [saveToStorage]);

  // Update an existing group
  const updateGroup = useCallback((id: string, name: string, members: SavedPlayer[]) => {
    setGroups(current => {
      const updated = current.map(g => 
        g.id === id ? { ...g, name: name.trim(), members } : g
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Remove a group
  const removeGroup = useCallback((id: string) => {
    setGroups(current => {
      const filtered = current.filter(g => g.id !== id);
      saveToStorage(filtered);
      return filtered;
    });
  }, [saveToStorage]);

  // Clear all groups
  const clearAllGroups = useCallback(() => {
    setGroups([]);
    saveToStorage([]);
  }, [saveToStorage]);

  // Get a group by ID
  const getGroupById = useCallback((id: string) => {
    return groups.find(g => g.id === id);
  }, [groups]);

  return {
    groups,
    addGroup,
    updateGroup,
    removeGroup,
    clearAllGroups,
    getGroupById,
  };
};
