import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * The height left over for the drawing.
 *
 * The sheet is height-bound: the drawing scales with the height it is given,
 * not with the width of the window. So the height has to be right, and it
 * changes whenever the title wraps, the order wraps or the validation band
 * appears. Measuring is the only way to keep it honest.
 *
 * `chromeRefs` are the blocks that stand above and below the drawing; their
 * heights are subtracted from the container's and watched for change.
 */
export function useFreeHeight(
  containerRef: RefObject<HTMLElement | null>,
  chromeRefs: RefObject<HTMLElement | null>[],
  min = 340,
  deps: unknown[] = [],
  extra = 0
) {
  const [height, setHeight] = useState(min);
  const refs = useRef(chromeRefs);
  refs.current = chromeRefs;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const chrome = refs.current.reduce(
        (sum, r) => sum + (r.current?.offsetHeight ?? 0),
        0
      );
      setHeight(Math.max(min, Math.round(container.clientHeight - chrome - extra)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    refs.current.forEach((r) => {
      if (r.current) observer.observe(r.current);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, min, extra, ...deps]);

  return height;
}
