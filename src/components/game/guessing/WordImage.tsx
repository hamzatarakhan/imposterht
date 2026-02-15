import React from 'react';
import { useWordImage } from '@/hooks/useWordImage';
import { getWordEmoji } from '@/data/wordEmojis';

interface WordImageProps {
  word: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-28 h-28',
  lg: 'w-36 h-36',
};

const WordImage: React.FC<WordImageProps> = ({ word, size = 'lg' }) => {
  const { imageUrl, loading } = useWordImage(word);

  if (loading) {
    return (
      <div className={`${sizeMap[size]} rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-2 animate-pulse`}>
        <span className="text-4xl">{getWordEmoji(word)}</span>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`${sizeMap[size]} flex items-center justify-center mx-auto mb-2`}>
        <span className={size === 'lg' ? 'text-6xl' : size === 'md' ? 'text-4xl' : 'text-2xl'}>{getWordEmoji(word)}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={word}
      className={`${sizeMap[size]} rounded-2xl object-cover mx-auto mb-2 shadow-lg border-2 border-primary/20`}
    />
  );
};

export default WordImage;
