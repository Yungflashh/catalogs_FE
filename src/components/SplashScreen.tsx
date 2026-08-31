import { useEffect, useState } from 'react';
import './SplashScreen.css';

const LETTERS = ['C', 'A', 'T', 'A', 'L', 'O', 'G'];

// Skip splash on small screens — on iOS Safari/WebKit, a full-viewport fixed
// overlay for ~2.4s can leave the touch scroll handler stuck for several more
// seconds after unmount. Mobile users get straight to content.
const isSmallScreen = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches;

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (isSmallScreen()) {
      onDone();
      return;
    }
    const t1 = setTimeout(() => setExit(true), 1700);
    const t2 = setTimeout(() => onDone(), 2450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  if (isSmallScreen()) return null;

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
