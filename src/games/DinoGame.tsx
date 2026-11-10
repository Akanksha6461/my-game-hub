import { useState, useEffect, useRef } from 'react';

// Humein 'onBack' prop chahiye taaki hum home screen par wapas ja sakein
export function DinoGame({ onBack }: { onBack: () => void }) {
  const [isJumping, setIsJumping] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [cactusPos, setCactusPos] = useState(600);

  const dinoRef = useRef<HTMLDivElement>(null);
  const cactusRef = useRef<HTMLDivElement>(null);

  const jump = () => {
    if (!isJumping && !isGameOver) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isJumping, isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    const gameLoop = setInterval(() => {
      setCactusPos((prev) => {
        if (prev < -50) { setScore(s => s + 1); return 600; }
        return prev - 10;
      });

      if (dinoRef.current && cactusRef.current) {
        const d = dinoRef.current.getBoundingClientRect();
        const c = cactusRef.current.getBoundingClientRect();
        if (d.right > c.left + 15 && d.left < c.right - 15 && d.bottom > c.top + 15) {
          setIsGameOver(true);
        }
      }
    }, 20);
    return () => clearInterval(gameLoop);
  }, [isGameOver]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Back Button */}
      <button 
        onClick={onBack} 
        style={{ alignSelf: 'flex-start', marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        ← Back to Hub
      </button>

      <style>{`
        .game-box { width: min(800px, calc(100vw - 28px)); height: 200px; background: white; border-bottom: 2px solid #555; position: relative; overflow: hidden; }
        .dino-container { width: 50px; height: 50px; position: absolute; bottom: 0; left: 50px; }
        .dino-img { width: 100%; height: 100%; object-fit: contain; }
        .cactus-container { width: 40px; height: 50px; position: absolute; bottom: 0; }
        .cactus-img { width: 100%; height: 100%; object-fit: contain; }
        .jump-anim { animation: jump 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        @keyframes jump { 0% { bottom: 0; } 50% { bottom: 130px; } 100% { bottom: 0; } }
      `}</style>

      <div className="game-box" onClick={jump}>
        <div style={{ position: 'absolute', right: 20, top: 10, fontSize: 24, fontWeight: 'bold', color: '#555' }}>
          HI {score.toString().padStart(5, '0')}
        </div>

        {!isGameOver ? (
          <>
            <div ref={dinoRef} className={`dino-container ${isJumping ? 'jump-anim' : ''}`}>
              <img src="/download.jfif" alt="Dino" className="dino-img" />
            </div>
            <div ref={cactusRef} className="cactus-container" style={{ left: cactusPos }}>
              <img src="/cuc.jfif" alt="Cactus" className="cactus-img" />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <h1 style={{ letterSpacing: '5px', color: '#555' }}>G A M E  O V E R</h1>
            <button onClick={() => { setIsGameOver(false); setScore(0); setCactusPos(600); }} 
              style={{ padding: '10px 25px', fontSize: 18, cursor: 'pointer', background: '#555', color: 'white', border: 'none', borderRadius: '4px' }}>
              RESTART
            </button>
          </div>
        )}
      </div>
    </div>
  );
}