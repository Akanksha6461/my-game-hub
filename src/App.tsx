// src/App.tsx (Update this part)
import { useState } from 'react';
import { GameHub } from './components/GameHub';
import { DinoGame } from './games/DinoGame';
import { SnakeGame } from './games/SnakeGame';
import { MathMaster } from './games/MathMaster'; // 1. Import MathMaster
 // 1. Import karein

function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div>
      {!activeGame && (
        <GameHub onSelectGame={(id) => setActiveGame(id)} />
      )}

      {activeGame === 'dino' && (
        <div style={centerStyle}>
          <DinoGame onBack={() => setActiveGame(null)} />
        </div>
      )}

      {/* 2. Snake Game ki condition add karein */}
      {activeGame === 'snake' && (
        <div style={centerStyle}>
          <SnakeGame onBack={() => setActiveGame(null)} />
        </div>
      )}

      {activeGame === 'math' && (
        <div style={centerStyle}>
          <MathMaster onBack={() => setActiveGame(null)} />
        </div>
      )}
    </div>
  );
}

const centerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f7f7f7'
};

export default App;