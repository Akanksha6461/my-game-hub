// src/games/SnakeGame.tsx
import { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Upward

export function SnakeGame({ onBack }: { onBack: () => void }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Khana random jagah paida karne ke liye
  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Game Loop
  useEffect(() => {
    if (isGameOver) return;

    const moveSnake = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y,
        };

        // 1. Deewar se takrana check karo
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setIsGameOver(true);
          return prevSnake;
        }

        // 2. Khud se takrana check karo
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // 3. Khana khana check karo
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood());
        } else {
          newSnake.pop(); // Agar khana nahi khaya toh peeche se ek hissa hata do
        }

        return newSnake;
      });
    }, 150); // Speed: 150ms

    return () => clearInterval(moveSnake);
  }, [direction, food, isGameOver, generateFood]);

  return (
    <div style={{ textAlign: 'center', color: '#333' }}>
      <button onClick={onBack} style={btnStyle}>← Back to Hub</button>
      <h2>Score: {score}</h2>
      
      <div style={gridStyle}>
        {/* Snake aur Food render karna */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div key={i} style={{
              width: '20px', height: '20px',
              backgroundColor: isSnake ? '#4CAF50' : isFood ? '#ff4d4d' : '#fff',
              border: '0.5px solid #eee',
              borderRadius: isFood ? '50%' : '2px'
            }} />
          );
        })}
      </div>

      {isGameOver && (
        <div style={overlayStyle}>
          <h1>GAME OVER!</h1>
          <button onClick={() => { setSnake(INITIAL_SNAKE); setScore(0); setIsGameOver(false); }} style={btnStyle}>
            Try Again
          </button>
        </div>
      )}
      <p>Use Arrow Keys to Move</p>
    </div>
  );
}

// Simple Inline Styles
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
  border: '5px solid #333',
  backgroundColor: '#fff',
  margin: '0 auto'
};

const btnStyle = { padding: '10px 20px', cursor: 'pointer', background: '#333', color: '#white', border: 'none', borderRadius: '5px', marginBottom: '10px' };

const overlayStyle: React.CSSProperties = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.2)'
};