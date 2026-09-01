import { useEffect, useRef, useState } from 'react';

type Entry = { t: number; msg: string };

const now = () => Math.round(performance.now());

export default function ScrollDebugHUD() {
  const [log, setLog] = useState<Entry[]>([]);
  const [touchMs, setTouchMs] = useState<number | null>(null);
  const [scrollMs, setScrollMs] = useState<number | null>(null);
  const [userScrollMs, setUserScrollMs] = useState<number | null>(null);
  const [touchmoveCount, setTouchmoveCount] = useState(0);
  const [firstMoveMs, setFirstMoveMs] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [nav, setNav] = useState<PerformanceNavigationTiming | null>(null);
  const [res, setRes] = useState({ count: 0, bytes: 0, slowest: 0 });
  const [imgs, setImgs] = useState({ total: 0, loaded: 0 });
  const [worstGap, setWorstGap] = useState(0);
  const [gapCount, setGapCount] = useState(0);
  const [heartbeats, setHeartbeats] = useState(0);
  const [bodyStyle, setBodyStyle] = useState({ pos: '', ovf: '', top: '' });
  const [computed, setComputed] = useState({ htmlOvf: '', bodyOvf: '', touchAction: '' });
  const [blurCount, setBlurCount] = useState(0);
  const [fixedCount, setFixedCount] = useState(0);
  const [stripped, setStripped] = useState(false);

  // refs — event listeners must not close over stale React state
  const touchedRef = useRef(false);
  const scrolledRef = useRef(false);
  const userScrolledRef = useRef(false);
  const firstMoveRef = useRef(false);

  const push = (msg: string) =>
    setLog((prev) => {
      const next = [...prev, { t: now(), msg }];
      return next.slice(-30);
    });

  useEffect(() => {
    push('HUD mounted');
    push(`readyState=${document.readyState}`);
    push(`body@mount pos=${document.body.style.position || '_'} ovf=${document.body.style.overflow || '_'}`);

    // Watch body/html style attribute for any mutation. This will catch
    // whoever is scroll-locking the page and when.
    const mo = new MutationObserver((records) => {
      records.forEach((r) => {
        const el = r.target as HTMLElement;
        const which = el === document.body ? 'BODY' : 'HTML';
        push(`${which}.style CHANGED: pos=${el.style.position || '_'} ovf=${el.style.overflow || '_'} top=${el.style.top || '_'}`);
      });
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    const onTouch = () => {
      if (!touchedRef.current) {
        touchedRef.current = true;
        setTouchMs(now());
        push(`FIRST touchstart @${now()}ms`);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      setTouchmoveCount((c) => c + 1);
      if (!firstMoveRef.current) {
        firstMoveRef.current = true;
        setFirstMoveMs(now());
        push(`FIRST touchmove @${now()}ms cancelable=${e.cancelable}`);
      }
    };
    const onScroll = () => {
      setScrollY(window.scrollY);
      if (!scrolledRef.current) {
        scrolledRef.current = true;
        setScrollMs(now());
        push(`FIRST scroll @${now()}ms`);
      }
      if (touchedRef.current && !userScrolledRef.current) {
        userScrolledRef.current = true;
        setUserScrollMs(now());
        push(`FIRST scroll-after-touch @${now()}ms`);
      }
    };
    window.addEventListener('touchstart', onTouch, { passive: true, capture: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const onReady = () => push(`readyState -> ${document.readyState} @${now()}ms`);
    document.addEventListener('readystatechange', onReady);
    window.addEventListener('load', () => {
      push(`window LOAD @${now()}ms`);
      const n = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (n) setNav(n);
      const list = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let bytes = 0;
      let slowest = 0;
      list.forEach((r) => {
        bytes += r.transferSize || 0;
        if (r.duration > slowest) slowest = r.duration;
      });
      setRes({ count: list.length, bytes, slowest: Math.round(slowest) });
    }, { once: true });

    let lastFrame = performance.now();
    let raf = 0;
    const tick = () => {
      const t = performance.now();
      const gap = t - lastFrame;
      if (gap > 120) {
        setGapCount((c) => c + 1);
        setWorstGap((w) => (gap > w ? Math.round(gap) : w));
        push(`frame gap ${Math.round(gap)}ms`);
      }
      lastFrame = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const hb = setInterval(() => setHeartbeats((h) => h + 1), 500);

    // Poll body/html state — is something locking scroll?
    const spy = setInterval(() => {
      const b = document.body;
      setBodyStyle({
        pos: b.style.position || '(unset)',
        ovf: b.style.overflow || '(unset)',
        top: b.style.top || '(unset)',
      });
      const cs = getComputedStyle(b);
      const cshtml = getComputedStyle(document.documentElement);
      setComputed({
        htmlOvf: `${cshtml.overflowX}/${cshtml.overflowY}`,
        bodyOvf: `${cs.overflowX}/${cs.overflowY}`,
        touchAction: `${cshtml.touchAction}/${cs.touchAction}`,
      });
      // Count elements using backdrop-filter (iOS compositor killer)
      const all = document.querySelectorAll('*');
      let blurs = 0;
      let fixed = 0;
      all.forEach((el) => {
        const s = getComputedStyle(el);
        const bf = s.backdropFilter || (s as any).webkitBackdropFilter;
        if (bf && bf !== 'none') blurs++;
        if (s.position === 'fixed') fixed++;
      });
      setBlurCount(blurs);
      setFixedCount(fixed);
      // images
      const imgAll = document.querySelectorAll('img');
      let loaded = 0;
      imgAll.forEach((i) => { if ((i as HTMLImageElement).complete) loaded++; });
      setImgs({ total: imgAll.length, loaded });
    }, 500);

    return () => {
      window.removeEventListener('touchstart', onTouch, { capture: true } as any);
      window.removeEventListener('touchmove', onTouchMove, { capture: true } as any);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('readystatechange', onReady);
      cancelAnimationFrame(raf);
      clearInterval(hb);
      clearInterval(spy);
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stripLocks = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const b = document.body;
    const h = document.documentElement;
    b.style.position = '';
    b.style.top = '';
    b.style.overflow = '';
    b.style.overflowX = '';
    b.style.overflowY = 'auto';
    h.style.overflow = '';
    h.style.overflowX = '';
    h.style.overflowY = 'auto';
    b.style.touchAction = 'auto';
    h.style.touchAction = 'auto';
    setStripped(true);
    push(`STRIPPED locks @${now()}ms`);
  };

  const kb = (b: number) => `${(b / 1024).toFixed(0)}KB`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        right: 8,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.92)',
        color: '#0f0',
        font: '11px/1.4 ui-monospace, Menlo, monospace',
        padding: collapsed ? '4px 8px' : '8px 10px',
        borderRadius: 8,
        border: '1px solid #0f0',
        maxHeight: collapsed ? 24 : '65vh',
        overflow: 'auto',
        pointerEvents: 'auto',
      }}
      onClick={() => setCollapsed((c) => !c)}
    >
      <div style={{ color: '#fff', marginBottom: 4 }}>
        [tap {collapsed ? 'expand' : 'collapse'}] t={now()}ms hb={heartbeats} y={scrollY}
      </div>
      {!collapsed && (
        <>
          <button
            onClick={stripLocks}
            onTouchStart={stripLocks}
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              background: stripped ? '#440' : '#a00',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {stripped ? '✓ STRIPPED — try scroll now' : 'TAP: STRIP body/html locks'}
          </button>
          <div style={{ color: '#ff0' }}>first touch: {touchMs === null ? 'NEVER' : `${touchMs}ms`}</div>
          <div style={{ color: '#ff0' }}>first touchmove: {firstMoveMs === null ? 'NEVER' : `${firstMoveMs}ms`}</div>
          <div style={{ color: '#ff0' }}>touchmoves total: {touchmoveCount}</div>
          <div style={{ color: '#ff0' }}>first scroll: {scrollMs === null ? 'NEVER' : `${scrollMs}ms`}</div>
          <div style={{ color: '#ff0' }}>scroll after touch: {userScrollMs === null ? 'NEVER' : `${userScrollMs}ms`}</div>
          <div>frame gaps: {gapCount} · worst {worstGap}ms</div>
          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          <div style={{ color: '#0ff' }}>BODY STYLE (inline):</div>
          <div>pos={bodyStyle.pos} · ovf={bodyStyle.ovf} · top={bodyStyle.top}</div>
          <div style={{ color: '#0ff' }}>COMPUTED:</div>
          <div>html ovf: {computed.htmlOvf}</div>
          <div>body ovf: {computed.bodyOvf}</div>
          <div>touch-action: {computed.touchAction}</div>
          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          <div style={{ color: '#0ff' }}>DOM COMPOSITOR LOAD:</div>
          <div>backdrop-filter els: {blurCount}</div>
          <div>position:fixed els: {fixedCount}</div>
          {nav && (
            <>
              <hr style={{ borderColor: '#333', margin: '6px 0' }} />
              <div>domInteractive: {Math.round(nav.domInteractive)}ms</div>
              <div>domComplete: {Math.round(nav.domComplete)}ms</div>
              <div>loadEventEnd: {Math.round(nav.loadEventEnd)}ms</div>
              <div>transferSize: {kb(nav.transferSize || 0)}</div>
            </>
          )}
          {res.count > 0 && (
            <div>resources: {res.count} · {kb(res.bytes)} · slowest {res.slowest}ms</div>
          )}
          <div>IMAGES: {imgs.loaded}/{imgs.total}</div>
          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          <div style={{ color: '#0ff' }}>LOG:</div>
          {log.map((e, i) => (
            <div key={i}>[{e.t}ms] {e.msg}</div>
          ))}
        </>
      )}
    </div>
  );
}
