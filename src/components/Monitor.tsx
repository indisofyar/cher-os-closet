import { useEffect, useState, type ReactNode } from 'react';
import { DISPLAY } from '../config';

function useClock() {
  const fmt = () =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase();
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

type Props = {
  title: string;
  tag: string;
  badge?: string;
  /** Extra room padding, used where stickers overhang the monitor. */
  roomy?: boolean;
  /** Elements positioned on the monitor shell itself (outside the screen). */
  overlay?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

export function Monitor({ title, tag, badge = 'CherOS', roomy, overlay, footer, children }: Props) {
  const time = useClock();
  return (
    <div className={`room shell-${DISPLAY.shell}${roomy ? ' roomy' : ''}`}>
      <div className="monitor">
        {overlay}
        <div className="bezel">
          <div className="screen">
            <header className="top">
              <span>{title}</span>
              <span className="tag">{tag}</span>
              <span>{time}</span>
            </header>
            <div className="body-row">{children}</div>
            {footer}
            {DISPLAY.crt && <div className="crt" aria-hidden="true" />}
          </div>
        </div>
        <div className="chin">
          <span className="grille" aria-hidden="true" />
          <span className="badge">
            <span className="led" aria-hidden="true" />
            {badge}
          </span>
          <span className="grille" aria-hidden="true" />
        </div>
      </div>
      <div className="neck" />
      <div className="foot" />
    </div>
  );
}
