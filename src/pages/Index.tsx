import { GameProvider } from '@/context/GameContext';
import Game from '@/components/game/Game';

const Index = () => {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
};

export default Index;
