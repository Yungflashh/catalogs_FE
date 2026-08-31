import { useEffect } from 'react';

// iOS-safe body scroll lock. Uses position:fixed + saved scroll offset because
// setting `body.overflow = hidden` alone doesn't reliably release on iOS Safari.
// Ref-counted so multiple concurrent locks (e.g. two drawers) don't clobber each
// other's cleanup.

let lockCount = 0;
let savedScrollY = 0;
let savedStyles: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
} | null = null;

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      const body = document.body;
      savedStyles = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        overflow: body.style.overflow,
      };
      body.style.position = 'fixed';
      body.style.top = `-${savedScrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && savedStyles) {
        const body = document.body;
        body.style.position = savedStyles.position;
        body.style.top = savedStyles.top;
        body.style.left = savedStyles.left;
        body.style.right = savedStyles.right;
        body.style.width = savedStyles.width;
        body.style.overflow = savedStyles.overflow;
        savedStyles = null;
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [active]);
}
