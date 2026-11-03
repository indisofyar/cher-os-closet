import { useEffect, useState } from 'react';

/** Phones get the handheld "CherOS Pocket" layout instead of the iMac. */
export const POCKET_QUERY = '(max-width: 760px)';

export function useIsPocket() {
  const get = () => typeof window !== 'undefined' && window.matchMedia(POCKET_QUERY).matches;
  const [pocket, setPocket] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(POCKET_QUERY);
    const on = () => setPocket(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return pocket;
}
