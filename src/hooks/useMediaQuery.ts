import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  // Read the query on the first render, not in an effect: the workbench picks
  // its composition from this, and a phone that painted the desk for one frame
  // would jump when the effect ran.
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}
