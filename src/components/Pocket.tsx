import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DISPLAY } from '../config';

/** What a hardware button does: a click handler, a route, or nothing (purely decorative). */
export type Action = { label: string; onClick?: () => void; to?: string };

type Controls = {
  up?: Action;
  down?: Action;
  left?: Action;
  right?: Action;
  a?: Action;
  b?: Action;
  select?: Action;
  start?: Action;
};

type Props = {
  title: string;
  /** Right side of the screen header (a tag or the time). */
  status: string;
  controls?: Controls;
  /** Elements positioned on the handheld body (stickers). */
  overlay?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};

function Control({ action, className, children }: { action?: Action; className: string; children?: ReactNode }) {
  if (action?.to)
    return (
      <Link className={className} to={action.to} aria-label={action.label}>
        {children}
      </Link>
    );
  if (action?.onClick)
    return (
      <button className={className} onClick={action.onClick} aria-label={action.label}>
        {children}
      </button>
    );
  return (
    <span className={className} aria-hidden="true">
      {children}
    </span>
  );
}

const Tri = ({ dir }: { dir: 'up' | 'down' | 'left' | 'right' }) => {
  const d = { up: 'M7 0 L14 12 L0 12 Z', down: 'M7 12 L14 0 L0 0 Z', left: 'M0 7 L12 0 L12 14 Z', right: 'M12 7 L0 0 L0 14 Z' }[dir];
  const vertical = dir === 'up' || dir === 'down';
  return (
    <svg width={vertical ? 14 : 12} height={vertical ? 12 : 14} viewBox={vertical ? '0 0 14 12' : '0 0 12 14'} aria-hidden="true">
      <path d={d} />
    </svg>
  );
};

export function Pocket({ title, status, controls = {}, overlay, footer, children }: Props) {
  return (
    <div className="pk-room">
      <div className={`pk-gb pk-shell-${DISPLAY.pocketShell}`}>
        {overlay}
        <div className="pk-bezel">
          <div className="pk-bez-top">
            <span className="pk-pwr" aria-hidden="true" />
            BATTERY
          </div>
          <div className="pk-screen">
            <header className="pk-top">
              <span>{title}</span>
              <span>{status}</span>
            </header>
            <div className={`pk-strip pk-${DISPLAY.print === 'leopard' ? 'leo' : DISPLAY.print === 'plaid' ? 'plaid' : 'lav'}`} aria-hidden="true" />
            {children}
            {footer}
            {DISPLAY.crt && <div className="pk-crt" aria-hidden="true" />}
          </div>
        </div>
        <div className="pk-brand">
          CherOS <em>POCKET</em>
        </div>
        <div className="pk-controls">
          <div className="pk-pad-row">
            <div className="pk-dpad" role="group" aria-label="Direction pad">
              <Control action={controls.up} className="pk-dp pk-up">
                <Tri dir="up" />
              </Control>
              <Control action={controls.left} className="pk-dp pk-left">
                <Tri dir="left" />
              </Control>
              <span className="pk-hub" aria-hidden="true" />
              <Control action={controls.right} className="pk-dp pk-right">
                <Tri dir="right" />
              </Control>
              <Control action={controls.down} className="pk-dp pk-down">
                <Tri dir="down" />
              </Control>
            </div>
            <div className="pk-ab">
              <div className="pk-abw">
                <Control action={controls.b} className="pk-abb" />
                <span aria-hidden="true">B</span>
              </div>
              <div className="pk-abw">
                <Control action={controls.a} className="pk-abb" />
                <span aria-hidden="true">A</span>
              </div>
            </div>
          </div>
          <div className="pk-ss">
            <Control action={controls.select} className="pk-ssb">
              <i />
              <span aria-hidden="true">SELECT</span>
            </Control>
            <Control action={controls.start} className="pk-ssb">
              <i />
              <span aria-hidden="true">START</span>
            </Control>
          </div>
          <div className="pk-spk" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}
