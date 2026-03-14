import React from 'react';
import { usePresence } from '@/context/PresenceContext';

interface PresenceDotProps {
  playerId: string;
  size?: 'sm' | 'md';
}

/**
 * A small colored dot indicating online/away presence status.
 * Place inside a `relative` container next to the avatar.
 */
const PresenceDot: React.FC<PresenceDotProps> = ({ playerId, size = 'md' }) => {
  const { awayPlayers } = usePresence();
  const isAway = awayPlayers.includes(playerId);
  
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  
  return (
    <div
      className={`absolute -bottom-0.5 -right-0.5 ${sizeClass} rounded-full border-2 border-background ${
        isAway ? 'bg-destructive' : 'bg-accent'
      }`}
    />
  );
};

export const AwayLabel: React.FC<{ playerId: string }> = ({ playerId }) => {
  const { awayPlayers } = usePresence();
  if (!awayPlayers.includes(playerId)) return null;
  return <p className="text-xs text-destructive">خارج التطبيق 🚫</p>;
};

export const useIsAway = (playerId: string) => {
  const { awayPlayers } = usePresence();
  return awayPlayers.includes(playerId);
};

export default PresenceDot;
