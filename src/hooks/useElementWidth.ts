import { useLayoutEffect, useRef, useState } from 'react';

/**
 * The measured size of an element.
 *
 * The sheet composes itself to the width it is given, not to the width of the
 * window: the inspector is a column on a desk and a drawer on a tablet, so the
 * canvas under it is a different width in the same session. This is how the
 * drawing knows which views it can lay out side by side, and how large it can
 * draw them.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The content box, not the border box: a panel that gains a gutter is
    // narrower for what it holds, and that is the width the sheet must lay
    // itself out in.
    const measure = (entry?: ResizeObserverEntry) => {
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        return;
      }
      const cs = getComputedStyle(el);
      setSize({
        width:
          el.clientWidth -
          (parseFloat(cs.paddingLeft) || 0) -
          (parseFloat(cs.paddingRight) || 0),
        height:
          el.clientHeight -
          (parseFloat(cs.paddingTop) || 0) -
          (parseFloat(cs.paddingBottom) || 0),
      });
    };

    measure();
    const observer = new ResizeObserver((entries) => measure(entries[0]));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width: size.width, height: size.height };
}
