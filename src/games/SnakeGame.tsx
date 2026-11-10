import { useEffect, useReducer, useRef } from "react";
type Point = { x: number; y: number };
type State = {
  snake: Point[];
  food: Point | null;
  dir: Point;
  next: Point;
  score: number;
  status: "ready" | "playing" | "paused" | "over" | "won";
};
const N = 20;
function foodFor(snake: Point[]) {
  const free: Point[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      if (!snake.some((p) => p.x === x && p.y === y)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? null;
}
function fresh(): State {
  const snake = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ];
  return {
    snake,
    food: foodFor(snake),
    dir: { x: 0, y: -1 },
    next: { x: 0, y: -1 },
    score: 0,
    status: "ready",
  };
}
type Action =
  | { type: "tick" }
  | { type: "turn"; dir: Point }
  | { type: "start" }
  | { type: "pause" };
function reducer(s: State, a: Action): State {
  if (a.type === "start") return { ...fresh(), status: "playing" };
  if (a.type === "pause")
    return {
      ...s,
      status:
        s.status === "playing"
          ? "paused"
          : s.status === "paused"
            ? "playing"
            : s.status,
    };
  if (a.type === "turn") {
    if (
      s.status !== "playing" ||
      (a.dir.x === -s.dir.x && a.dir.y === -s.dir.y)
    )
      return s;
    return { ...s, next: a.dir };
  }
  if (s.status !== "playing") return s;
  const head = { x: s.snake[0].x + s.next.x, y: s.snake[0].y + s.next.y };
  const eat = head.x === s.food?.x && head.y === s.food?.y;
  const body = eat ? s.snake : s.snake.slice(0, -1);
  if (
    head.x < 0 ||
    head.x >= N ||
    head.y < 0 ||
    head.y >= N ||
    body.some((p) => p.x === head.x && p.y === head.y)
  )
    return { ...s, status: "over" };
  const snake = [head, ...s.snake];
  if (!eat) snake.pop();
  const food = eat ? foodFor(snake) : s.food;
  return {
    ...s,
    snake,
    food,
    dir: s.next,
    score: s.score + (eat ? 10 : 0),
    status: food ? "playing" : "won",
  };
}
export function SnakeGame({ onBack }: { onBack: () => void }) {
  const [s, dispatch] = useReducer(reducer, undefined, fresh);
  const board = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: "tick" }), 150);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const directions: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const key = (e: KeyboardEvent) => {
      if (directions[e.key]) {
        e.preventDefault();
        dispatch({ type: "turn", dir: directions[e.key] });
      }
      if (e.code === "KeyP") dispatch({ type: "pause" });
    };
    const hide = () => {
      if (document.hidden && s.status === "playing")
        dispatch({ type: "pause" });
    };
    window.addEventListener("keydown", key);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [s.status]);
  return (
    <main className="classic-shell">
      <button className="back" onClick={onBack}>
        ← All games
      </button>
      <div className="classic-heading">
        <div>
          <p className="eyebrow">THE ORIGINAL ARCADE BREAK</p>
          <h1>Retro Snake</h1>
        </div>
        <strong aria-live="polite">{s.score} points</strong>
      </div>
      <div
        className="snake-board"
        ref={board}
        role="img"
        aria-label={`Snake board. Score ${s.score}. ${s.status}`}
      >
        <div className="snake-grid">
          {Array.from({ length: N * N }, (_, i) => {
            const x = i % N,
              y = Math.floor(i / N);
            return (
              <i
                key={i}
                className={
                  s.snake.some((p) => p.x === x && p.y === y)
                    ? "segment"
                    : s.food?.x === x && s.food?.y === y
                      ? "food"
                      : ""
                }
              />
            );
          })}
        </div>
        {s.status !== "playing" && (
          <div className="classic-overlay">
            <h2>
              {s.status === "ready"
                ? "Ready to roll?"
                : s.status === "paused"
                  ? "Take a breather."
                  : s.status === "won"
                    ? "You filled the board!"
                    : "One more round?"}
            </h2>
            <p>
              {s.status === "ready"
                ? "Collect apples. Avoid the walls and your tail."
                : `Your score: ${s.score}`}
            </p>
            <button
              onClick={() =>
                dispatch({ type: s.status === "paused" ? "pause" : "start" })
              }
            >
              {s.status === "paused" ? "Resume" : "Start game"}
            </button>
          </div>
        )}
      </div>
      <div className="classic-actions">
        <button onClick={() => dispatch({ type: "pause" })}>
          Pause / Resume
        </button>
        <button onClick={() => dispatch({ type: "start" })}>New game</button>
      </div>
      <div className="direction-pad" aria-label="Snake controls">
        {[
          { label: "↑", name: "Up", x: 0, y: -1 },
          { label: "←", name: "Left", x: -1, y: 0 },
          { label: "↓", name: "Down", x: 0, y: 1 },
          { label: "→", name: "Right", x: 1, y: 0 },
        ].map((d) => (
          <button
            key={d.name}
            aria-label={`Move ${d.name}`}
            onClick={() => dispatch({ type: "turn", dir: { x: d.x, y: d.y } })}
          >
            {d.label}
          </button>
        ))}
      </div>
      <p className="instructions">
        Use the arrow buttons or your keyboard. P pauses the game.
      </p>
    </main>
  );
}
