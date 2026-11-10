// src/games/MathMaster.tsx
import { useState, useEffect, useCallback } from 'react';

export function MathMaster({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', ans: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);

  // Naya sawal generate karne ke liye
  const nextQuestion = useCallback(() => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;
    
    // Subtraction mein answer negative na aaye isliye
    if (op === '-' && a < b) [a, b] = [b, a];

    let ans = 0;
    if (op === '+') ans = a + b;
    if (op === '-') ans = a - b;
    if (op === '*') ans = a * b;

    setQuestion({ a, b, op, ans });
    setUserAnswer('');
    setTimeLeft(10); // Har sawal par 10 second milenge
  }, []);

  // Game start par sawal dikhao
  useEffect(() => {
    nextQuestion();
  }, [nextQuestion]);

  // Timer logic
  useEffect(() => {
    if (isGameOver) return;
    if (timeLeft === 0) {
      setIsGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver]);

  // Answer check karne ke liye
  const checkAnswer = (val: string) => {
    setUserAnswer(val);
    if (parseInt(val) === question.ans) {
      setScore(s => s + 1);
      nextQuestion();
    }
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={btnStyle}>← Back to Hub</button>

      {!isGameOver ? (
        <div style={cardStyle}>
          <div style={timerBox(timeLeft)}>{timeLeft}s</div>
          <h1 style={{ fontSize: '4rem', margin: '20px 0' }}>
            {question.a} {question.op} {question.b} = ?
          </h1>
          <input 
            type="number" 
            autoFocus 
            value={userAnswer}
            onChange={(e) => checkAnswer(e.target.value)}
            placeholder="Type answer..."
            style={inputStyle}
          />
          <h2 style={{ color: '#666' }}>Score: {score}</h2>
        </div>
      ) : (
        <div style={cardStyle}>
          <h1 style={{ color: 'red', fontSize: '3rem' }}>Time's Up! ⏰</h1>
          <h2>Your Final Score: {score}</h2>
          <button onClick={() => { setIsGameOver(false); setScore(0); nextQuestion(); }} style={btnStyle}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

// STYLES
const containerStyle: React.CSSProperties = {
  textAlign: 'center',
  fontFamily: 'Arial, sans-serif'
};

const cardStyle: React.CSSProperties = {
  background: 'white',
  padding: '24px',
  borderRadius: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  width: 'min(400px, calc(100vw - 36px))',
  margin: '0 auto'
};

const inputStyle: React.CSSProperties = {
  fontSize: '2rem',
  width: '150px',
  textAlign: 'center',
  padding: '10px',
  borderRadius: '10px',
  border: '2px solid #ddd'
};

const btnStyle = {
  padding: '10px 20px',
  cursor: 'pointer',
  background: '#333',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  marginBottom: '20px'
};

const timerBox = (time: number): React.CSSProperties => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: time < 4 ? 'red' : '#333',
  background: '#eee',
  display: 'inline-block',
  padding: '5px 15px',
  borderRadius: '20px'
});