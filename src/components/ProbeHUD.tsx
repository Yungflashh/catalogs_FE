import { useEffect, useState } from 'react';

// Perf probe overlay. Mount at App level so it works on any route (/hello,
// /?level=N, etc). Enable with ?probe=1.
//
// Key metric: `blockedMs` = total time the main thread was blocked in tasks
// >= 50ms (via PerformanceObserver longtask). If blockedMs during the first
// 3 seconds is high, that's the actual hang. worstTask = longest single task.
//
// firstFrameMs = when first rAF fired after mount. If this is much later
// than the JS mount, the compositor was choked at start.
export default function ProbeHUD() {
  const [s, setS] = useState({
    mountMs: Math.round(performance.now()),
    firstFrameMs: 0,
    firstTouchMs: 0,
    firstScrollMs: 0,
    blockedMs: 0,
    longTaskCount: 0,
    worstTask: 0,
    imgLoaded: 0,
    imgTotal: 0,
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      setS((p) => ({ ...p, firstFrameMs: Math.round(performance.now()) }));
    });

    const onTouch = () => setS((p) => (p.firstTouchMs ? p : { ...p, firstTouchMs: Math.round(performance.now()) }));
    const onScroll = () => setS((p) => (p.firstScrollMs ? p : { ...p, firstScrollMs: Math.round(performance.now()) }));
    window.addEventListener('touchstart', onTouch, { passive: true, once: true });
    window.addEventListener('scroll', onScroll, { passive: true, once: true });

    // Long-task observer: any task >= 50ms on the main thread. This is the
    // TRUE measure of "the page can't respond right now."
    let obs: PerformanceObserver | null = null;
    try {
      obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          const dur = Math.round(e.duration);
          setS((p) => ({
            ...p,
            blockedMs: p.blockedMs + dur,
            longTaskCount: p.longTaskCount + 1,
            worstTask: Math.max(p.worstTask, dur),
          }));
        }
      });
      obs.observe({ type: 'longtask', buffered: true });
    } catch {
      // Not all browsers support longtask (Safari didn't for a long time).
    }

    const imgInt = window.setInterval(() => {
      const imgs = Array.from(document.images);
      const loaded = imgs.filter((i) => i.complete).length;
      setS((p) => ({ ...p, imgTotal: imgs.length, imgLoaded: loaded }));
    }, 300);

    return () => {
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('scroll', onScroll);
      obs?.disconnect();
      clearInterval(imgInt);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 74, right: 6, zIndex: 99999,
      background: 'rgba(0,0,0,0.88)', color: '#4ADE80',
      padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace',
      fontSize: 11, lineHeight: 1.35, pointerEvents: 'none',
      border: '1px solid #22C55E', maxWidth: 180,
    }}>
      <div style={{ color: '#F0FDF4', fontWeight: 700 }}>PROBE v9</div>
      <div>mount: {s.mountMs}</div>
      <div>frame1: {s.firstFrameMs}</div>
      <div>touch: {s.firstTouchMs || '—'}</div>
      <div>scroll: {s.firstScrollMs || '—'}</div>
      <div style={{ color: s.blockedMs > 500 ? '#FCA5A5' : '#4ADE80' }}>
        BLOCKED: {s.blockedMs}ms
      </div>
      <div>tasks: {s.longTaskCount} worst: {s.worstTask}</div>
      <div>imgs: {s.imgLoaded}/{s.imgTotal}</div>
    </div>
  );
}
