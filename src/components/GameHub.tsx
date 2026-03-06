// src/GameHub.tsx
import React from 'react';

// Game ki details ke liye interface
interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface GameHubProps {
  onSelectGame: (id: string) => void;
}

const games: Game[] = [
  {
    id: 'dino',
    title: 'T-Rex Run',
    description: 'Classic offline dino jumping game.',
    icon: '🦖',
    color: '#535353'
  },
  {
    id: 'snake',
    title: 'Retro Snake',
    description: 'Eat the apples and grow longer.',
    icon: '🐍',
    color: '#4CAF50'
  },
  {
    id: 'math',
    title: 'Math Master',
    description: 'Solve fast math problems.',
    icon: '🔢',
    color: '#2196F3'
  }
];

export const GameHub: React.FC<GameHubProps> = ({ onSelectGame }) => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🕹️ MY GAME CENTER</h1>
        <p style={styles.subtitle}>Choose your favorite game and start playing!</p>
      </header>

      <div style={styles.grid}>
        {games.map((game) => (
          <div 
            key={game.id} 
            style={{...styles.card, borderTop: `5px solid ${game.color}`}}
            onClick={() => onSelectGame(game.id)}
            className="game-card"
          >
            <div style={styles.icon}>{game.icon}</div>
            <h2 style={styles.gameTitle}>{game.title}</h2>
            <p style={styles.gameDesc}>{game.description}</p>
            <button style={{...styles.playBtn, backgroundColor: game.color}}>
              PLAY NOW
            </button>
          </div>
        ))}
      </div>

      {/* Hover animations ke liye CSS */}
      <style>{`
        .game-card {
          transition: all 0.3s ease;
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .game-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '50px 20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px'
  },
  title: {
    fontSize: '3rem',
    color: '#1a1a1a',
    margin: 0
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  icon: {
    fontSize: '60px',
    marginBottom: '15px'
  },
  gameTitle: {
    margin: '10px 0',
    color: '#333'
  },
  gameDesc: {
    color: '#777',
    fontSize: '0.9rem',
    marginBottom: '20px',
    lineHeight: '1.4'
  },
  playBtn: {
    marginTop: 'auto',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '25px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};