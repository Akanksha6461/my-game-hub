import { useState, useEffect, useRef } from "react";
function question() {
  const op = ["+", "−", "×"][Math.floor(Math.random() * 3)];
  let a = 1 + Math.floor(Math.random() * 10),
    b = 1 + Math.floor(Math.random() * 10);
  if (op === "−" && a < b) [a, b] = [b, a];
  return { a, b, op, answer: op === "+" ? a + b : op === "−" ? a - b : a * b };
}
export function MathMaster({ onBack }: { onBack: () => void }) {
  const [q, setQ] = useState(question),
    [answer, setAnswer] = useState(""),
    [score, setScore] = useState(0),
    [time, setTime] = useState(15),
    [status, setStatus] = useState<"ready" | "playing" | "paused" | "over">(
      "ready",
    ),
    [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [status]);
  useEffect(() => {
    if (time === 0 && status === "playing") setStatus("over");
  }, [time, status]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden && status === "playing") setStatus("paused");
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [status]);
  function start() {
    setQ(question());
    setScore(0);
    setAnswer("");
    setTime(15);
    setMessage("");
    setStatus("playing");
    setTimeout(() => input.current?.focus(), 0);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "playing" || !answer.trim()) return;
    if (Number(answer) === q.answer) {
      setScore((s) => s + 1);
      setQ(question());
      setAnswer("");
      setTime(15);
      setMessage("Correct! Keep going.");
    } else setMessage("Try again — you have time.");
    input.current?.focus();
  }
  return (
    <main className="classic-shell">
      <button className="back" onClick={onBack}>
        ← All games
      </button>
      <div className="classic-heading">
        <div>
          <p className="eyebrow">A LITTLE DAILY BRAIN TRAINING</p>
          <h1>Math Master</h1>
        </div>
        <strong>{score} points</strong>
      </div>
      <section className="math-card">
        {status === "playing" ? (
          <>
            <div className="timer" role="timer">
              {time}s left
            </div>
            <p className="equation">
              {q.a} {q.op} {q.b} = ?
            </p>
            <form onSubmit={submit}>
              <label htmlFor="answer">Your answer</label>
              <input
                ref={input}
                id="answer"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="Enter a number"
              />
              <button type="submit">Check answer →</button>
            </form>
            <p className="feedback" role="status">
              {message || "15 seconds per question. Take your best shot."}
            </p>
            <button className="secondary" onClick={() => setStatus("paused")}>
              Pause
            </button>
          </>
        ) : (
          <>
            <h2>
              {status === "ready"
                ? "Make every answer count."
                : status === "paused"
                  ? "Your brain break."
                  : "Time’s up!"}
            </h2>
            <p>
              {status === "ready"
                ? "Solve addition, subtraction and multiplication. Submit each answer when you are ready."
                : `You scored ${score} points.`}
            </p>
            <button
              onClick={() =>
                status === "paused" ? setStatus("playing") : start()
              }
            >
              {status === "paused"
                ? "Resume"
                : status === "ready"
                  ? "Start challenge"
                  : "Play again"}
            </button>
          </>
        )}
      </section>
      <p className="instructions">
        Type your full answer, then tap Check answer or press Enter.
      </p>
    </main>
  );
}
