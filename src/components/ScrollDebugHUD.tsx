import { useEffect, useRef, useState } from 'react';

type Entry = { t: number; msg: string };

const now = () => Math.round(performance.now());

export default function ScrollDebugHUD() {
  const [log, setLog] = useState<Entry[]>([]);
  const [touchMs, setTouchMs] = useState<number | null>(null);
  const [scrollMs, setScrollMs] = useState<number | null>(null);
  const [userScrollMs, setUserScrollMs] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [nav, setNav] = useState<PerformanceNavigationTiming | null>(null);
  const [res, setRes] = useState({ count: 0, bytes: 0, slowest: 0 });
  const [imgs, setImgs] = useState({ total: 0, loaded: 0 });
  const [worstGap, setWorstGap] = useState(0);
  const [gapCount, setGapCount] = useState(0);
  const [heartbeats, setHeartbeats] = useState(0);

  // refs — event listeners must not close over stale React state
  const touchedRef = useRef(false);
  const scrolledRef = useRef(false);
  const userTouchedRef = useRef(false);

  const push = (msg: string) =>
    setLog((prev) => {
      const next = [...prev, { t: now(), msg }];
      return next.slice(-40);
    });

  useEffect(() => {
    push('HUD mounted');
    push(`readyState=${document.readyState}`);

    // Touch — log ONLY the very first one, via ref
    const onTouch = () => {
      if (!touchedRef.current) {
        touchedRef.current = true;
        setTouchMs(now());
        push(`FIRST touchstart @${now()}ms`);
      }
      if (!userTouchedRef.current) {
        userTouchedRef.current = true;
      }
    };
    // Scroll — separate "any scroll" vs "user-driven scroll after first touch"
    const onScroll = () => {
      setScrollY(window.scrollY);
      if (!scrolledRef.current) {
        scrolledRef.current = true;
        setScrollMs(now());
        push(`FIRST scroll @${now()}ms (may be programmatic)`);
      }
      if (userTouchedRef.current && userScrollMs === null) {
        setUserScrollMs(now());
        push(`FIRST user-scroll @${now()}ms`);
      }
    };
    window.addEventListener('touchstart', onTouch, { passive: true, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // readyState transitions — critical to know when the browser calls the page "done"
    const onReady = () => push(`readyState -> ${document.readyState} @${now()}ms`);
    document.addEventListener('readystatechange', onReady);
    window.addEventListener('DOMContentLoaded', () => push(`DOMContentLoaded @${now()}ms`), { once: true });
    window.addEventListener('load', () => {
      push(`window LOAD @${now()}ms`);
      const n = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (n) setNav(n);
      // resources: how many, total bytes, slowest
      const list = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let bytes = 0;
      let slowest = 0;
      list.forEach((r) => {
        bytes += r.transferSize || 0;
        if (r.duration > slowest) slowest = r.duration;
      });
      setRes({ count: list.length, bytes, slowest: Math.round(slowest) });
      // count images
      const all = document.querySelectorAll('img');
      let loaded = 0;
      all.forEach((i) => { if ((i as HTMLImageElement).complete) loaded++; });
      setImgs({ total: all.length, loaded });
    }, { once: true });

    // Main-thread stall detector — rAF gap > 120ms
    let lastFrame = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now();
      const gap = t - lastFrame;
      if (gap > 120) {
        setGapCount((c) => c + 1);
        setWorstGap((w) => (gap > w ? Math.round(gap) : w));
        push(`frame gap ${Math.round(gap)}ms @${Math.round(t)}`);
      }
      lastFrame = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Heartbeat — confirms JS is running even when no other events fire
    const hb = setInterval(() => setHeartbeats((h) => h + 1), 500);

    // Track image loading progress
    const imgInt = setInterval(() => {
      const all = document.querySelectorAll('img');
      let loaded = 0;
      all.forEach((i) => { if ((i as HTMLImageElement).complete) loaded++; });
      setImgs({ total: all.length, loaded });
    }, 500);

    return () => {
      window.removeEventListener('touchstart', onTouch, { capture: true } as any);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('readystatechange', onReady);
      cancelAnimationFrame(raf);
      clearInterval(hb);
      clearInterval(imgInt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kb = (b: number) => `${(b / 1024).toFixed(0)}KB`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        right: 8,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.9)',
        color: '#0f0',
        font: '11px/1.4 ui-monospace, Menlo, monospace',
        padding: collapsed ? '4px 8px' : '8px 10px',
        borderRadius: 8,
        border: '1px solid #0f0',
        maxHeight: collapsed ? 24 : '60vh',
        overflow: 'auto',
        pointerEvents: 'auto',
      }}
      onClick={() => setCollapsed((c) => !c)}
    >
      <div style={{ color: '#fff', marginBottom: 4 }}>
        [tap {collapsed ? 'to expand' : 'to collapse'}] t={now()}ms hb={heartbeats} scrollY={scrollY}
      </div>
      {!collapsed && (
        <>
          <div style={{ color: '#ff0' }}>
            first touch: {touchMs === null ? 'NEVER' : `${touchMs}ms`}
          </div>
          <div style={{ color: '#ff0' }}>
            first scroll (any): {scrollMs === null ? 'NEVER' : `${scrollMs}ms`}
          </div>
          <div style={{ color: '#ff0' }}>
            first USER scroll: {userScrollMs === null ? 'NEVER' : `${userScrollMs}ms`}
          </div>
          <div>
            frame gaps: {gapCount} · worst {worstGap}ms (iOS: longtask API not supported)
          </div>
          {nav && (
            <>
              <hr style={{ borderColor: '#333', margin: '6px 0' }} />
              <div style={{ color: '#0ff' }}>NAVIGATION TIMING:</div>
              <div>domInteractive: {Math.round(nav.domInteractive)}ms</div>
              <div>domContentLoadedEventEnd: {Math.round(nav.domContentLoadedEventEnd)}ms</div>
              <div>domComplete: {Math.round(nav.domComplete)}ms</div>
              <div>loadEventEnd: {Math.round(nav.loadEventEnd)}ms</div>
              <div>transferSize: {kb(nav.transferSize || 0)} encoded: {kb(nav.encodedBodySize || 0)}</div>
            </>
          )}
          {res.count > 0 && (
            <>
              <hr style={{ borderColor: '#333', margin: '6px 0' }} />
              <div style={{ color: '#0ff' }}>RESOURCES:</div>
              <div>
                {res.count} loaded · total {kb(res.bytes)} · slowest {res.slowest}ms
              </div>
            </>
          )}
          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          <div style={{ color: '#0ff' }}>
            IMAGES: {imgs.loaded}/{imgs.total} complete
          </div>
          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          <div style={{ color: '#0ff' }}>LOG:</div>
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
