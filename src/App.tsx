// src/App.tsx (Update this part)
import { useState } from 'react';
import { GameHub } from './components/GameHub';
import { DinoGame } from './games/DinoGame';
import { SnakeGame } from './games/SnakeGame';
import { MathMaster } from './games/MathMaster'; // 1. Import MathMaster
 // 1. Import karein

function App() {
  const [activeGame, setActiveGame] = useState<string | null>(() => { const game = new URLSearchParams(window.location.search).get('game'); return game && ['dino','snake','math'].includes(game) ? game : null; });

  return (
    <div>
      {!activeGame && (
        <GameHub onSelectGame={(id) => setActiveGame(id)} />
      )}

      {activeGame === 'dino' && (
        <div style={centerStyle}>
          <DinoGame onBack={() => { window.top!.location.href = "/"; }} />
        </div>
      )}

      {/* 2. Snake Game ki condition add karein */}
      {activeGame === 'snake' && (
        <div style={centerStyle}>
          <SnakeGame onBack={() => { window.top!.location.href = "/"; }} />
        </div>
      )}

      {activeGame === 'math' && (
        <div style={centerStyle}>
          <MathMaster onBack={() => { window.top!.location.href = "/"; }} />
        </div>
      )}
    </div>
  );
}

const centerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '12px', width: '100%', background: '#f7f7f7'
};

export default App;