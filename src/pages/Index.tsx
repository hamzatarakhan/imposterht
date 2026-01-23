import { GameProvider } from '@/context/GameContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Game from '@/components/game/Game';

const Index = () => {
  return (
    <SettingsProvider>
      <GameProvider>
        <Game />
      </GameProvider>
    </SettingsProvider>
  );
};

export default Index;
