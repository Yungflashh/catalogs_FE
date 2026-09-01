import { useEffect, useRef, useState } from 'react';

type Entry = { t: number; msg: string };

const NAV_START =
  typeof performance !== 'undefined' ? performance.timeOrigin || performance.now() : Date.now();
const since = () => Math.round(performance.now());

export default function ScrollDebugHUD() {
  const [log, setLog] = useState<Entry[]>([]);
  const [longTasks, setLongTasks] = useState<number[]>([]);
  const [touchMs, setTouchMs] = useState<number | null>(null);
  const [scrollMs, setScrollMs] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const startRef = useRef(NAV_START);

  const push = (msg: string) =>
    setLog((prev) => [...prev.slice(-14), { t: since(), msg }]);

  useEffect(() => {
    push('HUD mounted');

    // 1. First touch latency
    const onTouch = () => {
      if (touchMs === null) {
        setTouchMs(since());
        push('first touchstart');
      }
    };
    const onScroll = () => {
      setScrollY(window.scrollY);
      if (scrollMs === null) {
        setScrollMs(since());
        push('first scroll fired');
      }
    };
    window.addEventListener('touchstart', onTouch, { passive: true, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // 2. Long tasks — anything >50ms is a jank/hang candidate
    let obs: PerformanceObserver | null = null;
    try {
      obs = new PerformanceObserver((list) => {
        const news: number[] = [];
        list.getEntries().forEach((e) => {
          const dur = Math.round(e.duration);
          news.push(dur);
          push(`long task ${dur}ms @${Math.round(e.startTime)}`);
        });
        if (news.length) setLongTasks((p) => [...p, ...news]);
      });
      obs.observe({ entryTypes: ['longtask'] });
    } catch {
      push('longtask API unsupported');
    }

    // 3. Load milestones
    const onDCL = () => push(`DOMContentLoaded @${since()}`);
    const onLoad = () => push(`window load @${since()}`);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDCL, { once: true });
    } else {
      push(`DOM already ready @${since()}`);
    }
    window.addEventListener('load', onLoad, { once: true });

    // 4. Detect main-thread stalls: rAF gap >100ms means the thread was blocked
    let lastFrame = performance.now();
    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const gap = now - lastFrame;
      if (gap > 120) push(`frame gap ${Math.round(gap)}ms`);
      lastFrame = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('touchstart', onTouch, { capture: true } as any);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('DOMContentLoaded', onDCL);
      window.removeEventListener('load', onLoad);
      obs?.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const worst = longTasks.length ? Math.max(...longTasks) : 0;
  const total = longTasks.reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        right: 8,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.85)',
        color: '#0f0',
        font: '11px/1.35 ui-monospace, Menlo, monospace',
        padding: collapsed ? '4px 8px' : '8px 10px',
        borderRadius: 8,
        border: '1px solid #0f0',
        maxHeight: collapsed ? 24 : '55vh',
        overflow: 'auto',
        pointerEvents: 'auto',
      }}
      onClick={() => setCollapsed((c) => !c)}
    >
      <div style={{ color: '#fff', marginBottom: 4 }}>
        [tap to {collapsed ? 'expand' : 'collapse'}] since start: {since()}ms · scrollY:{' '}
        {scrollY}
      </div>
      {!collapsed && (
        <>
          <div>touchable: {touchMs === null ? 'not yet' : `${touchMs}ms`}</div>
          <div>scrolled: {scrollMs === null ? 'not yet' : `${scrollMs}ms`}</div>
          <div>
            long tasks: {longTasks.length} · worst {worst}ms · total {total}ms
          </div>
          <div style={{ color: '#ff0', marginTop: 4 }}>
            nav start ref: {Math.round(startRef.current)}
          </div>
          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          {log.map((e, i) => (
            <div key={i}>
              [{e.t}ms] {e.msg}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
