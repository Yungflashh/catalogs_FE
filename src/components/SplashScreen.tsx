import { useEffect, useState } from 'react';
import './SplashScreen.css';

const LETTERS = ['C', 'A', 'T', 'A', 'L', 'O', 'G'];

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExit(true), 1700);
    const t2 = setTimeout(() => onDone(), 2450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`splash-root${exit ? ' splash-exit' : ''}`}>
      <div className="splash-word">
        {LETTERS.map((l, i) => (
          <span
            key={i}
            className="splash-letter"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {l}
          </span>
        ))}
      </div>
      <span className="splash-sub">access the catalog</span>
    </div>
  );
}
