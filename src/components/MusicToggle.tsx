import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TRACK = '/music/vogue-instrumental.mp3';
/** The iMac layout that fits the viewport (see the matching query in styles.css). */
const DESKTOP_QUERY = '(min-width: 900px) and (min-height: 560px)';

function useIsDesktop() {
  const get = () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches;
  const [desktop, setDesktop] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desktop;
}

const overlaps = (a: DOMRect, b: DOMRect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/**
 * Background music for the desktop layout only. Off by default; a pill in the
 * bottom-right corner of the room, outside the monitor, turns it on and off.
 * Mounted once above the routes so the track keeps playing between screens.
 */
export function MusicToggle() {
  const desktop = useIsDesktop();
  const { pathname } = useLocation();
  const audio = useRef<HTMLAudioElement | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  // Shrinks to a round button when the full pill would cover the monitor.
  const [compact, setCompact] = useState(false);

  // Stop the music if the window shrinks out of the desktop layout.
  useEffect(() => {
    if (!desktop) audio.current?.pause();
  }, [desktop]);

  useEffect(() => () => audio.current?.pause(), []);

  useLayoutEffect(() => {
    if (!desktop) return;
    const fit = () => {
      const btn = button.current;
      const monitor = document.querySelector('.monitor');
      if (!btn || !monitor) return;
      btn.classList.remove('compact');
      const tooWide = overlaps(btn.getBoundingClientRect(), monitor.getBoundingClientRect());
      btn.classList.toggle('compact', tooWide);
      setCompact(tooWide);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [desktop, pathname]);

  if (!desktop) return null;

  const toggle = () => {
    if (!audio.current) {
      const a = new Audio(TRACK);
      a.loop = true;
      a.volume = 0.5;
      a.addEventListener('play', () => setPlaying(true));
      a.addEventListener('pause', () => setPlaying(false));
      audio.current = a;
    }
    const a = audio.current;
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  const label = playing ? 'Turn music off' : 'Turn music on';
  return (
    <button
      ref={button}
      type="button"
      className={`music-toggle${playing ? ' on' : ''}${compact ? ' compact' : ''}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={label}
      title={label}
    >
      <span className="music-led" aria-hidden="true" />
      <span className="music-eq" aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      <span className="music-text">MUSIC</span>
    </button>
  );
}
