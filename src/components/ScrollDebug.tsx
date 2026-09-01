import { useEffect, useState, useRef } from 'react';

// Temporary on-screen scroll debugger. Shows live state on the page so we can
// diagnose iOS Safari scroll lockup without needing a USB-tethered Mac.
// Remove this component and its <ScrollDebug /> mount in App.tsx once fixed.

interface State {
  scrollY: number;
  scrollHeight: number;
  innerHeight: number;
  visualViewportH: number;
  canScroll: boolean;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTouchAction: string;
  htmlOverflow: string;
  fixedCount: number;
  fixedBlockers: string[];
  touchCount: number;
  lastEvent: string;
  msSinceLoad: number;
}

const loadT0 = performance.now();

function readState(): State {
  const body = document.body;
  const html = document.documentElement;
  const bodyStyle = getComputedStyle(body);
  const htmlStyle = getComputedStyle(html);

  const all = Array.from(document.querySelectorAll<HTMLElement>('*'));
  let fixedCount = 0;
  const blockers: string[] = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky') {
      fixedCount++;
      const r = el.getBoundingClientRect();
      const coversViewport = r.width >= vw * 0.9 && r.height >= vh * 0.5;
      const pe = cs.pointerEvents;
      if (coversViewport && pe !== 'none' && blockers.length < 5) {
        const tag = el.tagName.toLowerCase();
        const cls = el.className && typeof el.className === 'string'
          ? '.' + el.className.split(/\s+/).slice(0, 2).join('.')
          : '';
        blockers.push(`${tag}${cls} z=${cs.zIndex} pe=${pe}`);
      }
    }
  }

  return {
    scrollY: window.scrollY,
    scrollHeight: html.scrollHeight,
    innerHeight: window.innerHeight,
    visualViewportH: window.visualViewport?.height ?? 0,
    canScroll: html.scrollHeight > window.innerHeight + 1,
    bodyOverflow: bodyStyle.overflow,
    bodyPosition: bodyStyle.position,
    bodyTouchAction: bodyStyle.touchAction,
    htmlOverflow: htmlStyle.overflow,
    fixedCount,
    fixedBlockers: blockers,
    touchCount: 0,
    lastEvent: '—',
    msSinceLoad: Math.round(performance.now() - loadT0),
  };
}

export default function ScrollDebug() {
  const [state, setState] = useState<State>(() => readState());
  const touchesRef = useRef({ count: 0, last: '—' });

  useEffect(() => {
    const tick = () => {
      const s = readState();
      s.touchCount = touchesRef.current.count;
      s.lastEvent = touchesRef.current.last;
      setState(s);
    };
    tick();
    const id = window.setInterval(tick, 500);

    const log = (name: string) => (e: Event) => {
      touchesRef.current.count += 1;
      const te = e as TouchEvent;
      const t = te.touches?.[0];
      touchesRef.current.last = t
        ? `${name} @ (${Math.round(t.clientX)}, ${Math.round(t.clientY)}) sy=${Math.round(window.scrollY)}`
        : `${name} sy=${Math.round(window.scrollY)}`;
    };
    const onScroll = () => {
      touchesRef.current.count += 1;
      touchesRef.current.last = `scroll → ${Math.round(window.scrollY)}`;
    };

    window.addEventListener('touchstart', log('touchstart'), { passive: true });
    window.addEventListener('touchmove', log('touchmove'), { passive: true });
    window.addEventListener('touchend', log('touchend'), { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearInterval(id);
      window.removeEventListener('touchstart', log('touchstart'));
      window.removeEventListener('touchmove', log('touchmove'));
      window.removeEventListener('touchend', log('touchend'));
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        right: 8,
        zIndex: 2147483647,
        background: 'rgba(0, 0, 0, 0.88)',
        color: '#c6f7d0',
        fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
        fontSize: 10,
        lineHeight: 1.35,
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid #22c55e',
        pointerEvents: 'none',
        maxHeight: '45vh',
        overflow: 'hidden',
      }}
    >
      <div style={{ color: '#22c55e', fontWeight: 700, marginBottom: 4 }}>
        SCROLL DEBUG · {state.msSinceLoad}ms
      </div>
      <div>
        canScroll: <b style={{ color: state.canScroll ? '#4ade80' : '#ff6b6b' }}>{String(state.canScroll)}</b>
        {'  '}scrollY: {state.scrollY}
        {'  '}docH: {state.scrollHeight}
        {'  '}winH: {state.innerHeight}
        {state.visualViewportH ? `  vvH: ${Math.round(state.visualViewportH)}` : ''}
      </div>
      <div>
        html.overflow: <b>{state.htmlOverflow}</b>
        {'  '}body.overflow: <b>{state.bodyOverflow}</b>
      </div>
      <div>
        body.position: <b>{state.bodyPosition}</b>
        {'  '}touch-action: <b>{state.bodyTouchAction}</b>
      </div>
      <div>fixed/sticky els: {state.fixedCount}</div>
      {state.fixedBlockers.length > 0 && (
        <div style={{ color: '#ffcc55', marginTop: 3 }}>
          ⚠ covering viewport w/ pe!=none:
          {state.fixedBlockers.map((b, i) => (
            <div key={i} style={{ paddingLeft: 8 }}>· {b}</div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 3 }}>
        touches: {state.touchCount}
        {'  '}last: {state.lastEvent}
      </div>
    </div>
  );
}
