import { useEffect, useMemo, useState } from 'react';
import { socialProofApi } from '../api/services';
import { SocialProofPublic } from '../types';
import './SocialProofToast.css';

type Entry = SocialProofPublic['entries'][number];

const TIME_LABELS = [
  'just now', '1m ago', '2m ago', '4m ago', '6m ago', '9m ago',
  '12m ago', '17m ago', '23m ago', '31m ago', '42m ago',
];

const formatAmount = (n: number): string =>
  Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SocialProofToast() {
  const [enabled, setEnabled] = useState(false);
  const [rotationMs, setRotationMs] = useState(8000);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    socialProofApi
      .public()
      .then((data) => {
        if (cancelled) return;
        setEnabled(data.enabled);
        setRotationMs(data.rotationMs);
        setEntries(shuffle(data.entries));
      })
      .catch(() => { /* silent — feature is best-effort */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!enabled || dismissed || entries.length === 0) return;

    const showDelay = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(showDelay);
  }, [enabled, dismissed, entries.length]);

  useEffect(() => {
    if (!visible || entries.length === 0) return;

    const rotate = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIdx((i) => (i + 1) % entries.length);
        setVisible(true);
      }, 500);
      return () => clearTimeout(swap);
    }, rotationMs);

    return () => clearInterval(rotate);
  }, [visible, rotationMs, entries.length]);

  const current = useMemo(() => entries[idx], [entries, idx]);
  const timeLabel = useMemo(
    () => TIME_LABELS[idx % TIME_LABELS.length],
    [idx]
  );

  if (!enabled || dismissed || !current) return null;

  return (
    <div
      className={`sp-toast ${visible ? 'sp-toast-in' : 'sp-toast-out'}`}
      role="status"
      aria-live="polite"
    >
      <div className="sp-icon" aria-hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 6h15l-1.5 9h-12L6 6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M6 6L4.5 3H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="19" r="1.5" fill="currentColor" />
          <circle cx="17" cy="19" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className="sp-body">
        <div className="sp-line1">
          <span className="sp-name">{current.name}</span>
          <span className="sp-loc"> from {current.location}</span>
        </div>
        <div className="sp-line2">bought <strong>{current.product}</strong></div>
        <div className="sp-line3">
          <span className="sp-time">{timeLabel}</span>
          <span className="sp-dot">•</span>
          <span className="sp-amt">{formatAmount(current.amount)}</span>
        </div>
      </div>
      <button
        className="sp-close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >×</button>
    </div>
  );
}
