import type { CSSProperties, ReactNode } from 'react';
import { Monitor } from '../components/Monitor';
import { Pocket } from '../components/Pocket';
import { MonitorNav, PocketNavLinks } from '../components/NavBar';
import { useIsPocket } from '../hooks/useIsPocket';
import { DISPLAY, printClass } from '../config';

/** Placeholder figures from the design: the app doesn't track purchases yet. */
const AVOIDED: { value: string; label: string; colour: string; icon: ReactNode }[] = [
  {
    value: '11',
    label: 'unnecessary purchases',
    colour: '#FF8FC7',
    icon: (
      <>
        <path d="M5 8 H19 L18 21 H6 Z" fill="#FFFFFF" />
        <path d="M9 8 V6 A3 3 0 0 1 15 6 V8" />
      </>
    ),
  },
  {
    value: '£482',
    label: 'spent on items you didn’t need',
    colour: '#FFE27A',
    icon: (
      <>
        <rect x="2.5" y="6" width="19" height="12" fill="#FFFFFF" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    value: '18kg',
    label: 'of clothing waste',
    colour: '#9EE6C1',
    icon: (
      <>
        <path d="M20 12 A8 8 0 1 1 16.5 5.4" />
        <path d="M17 1.5 V6 H12.5" />
      </>
    ),
  },
];

const VERDICT = 'You’re totally fabulous. And surprisingly responsible.';

/** The till receipt that prints out of the screen. */
function Receipt({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rcpt${compact ? ' compact' : ''}`}>
      <div className="rcpt-head">
        <span>YOU’VE AVOIDED:</span>
        <span className="rcpt-demo">DEMO DATA</span>
      </div>
      <ul className="rcpt-rows">
        {AVOIDED.map((row, i) => (
          <li className="rrow" key={row.label} style={{ '--d': `${1.1 + i * 0.25}s` } as CSSProperties}>
            <span className="rcpt-ico" style={{ background: row.colour }} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#15143F" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="square" aria-hidden="true">
                {row.icon}
              </svg>
            </span>
            <span className="rcpt-label">{row.label}</span>
            <span className="rcpt-dots" aria-hidden="true" />
            <b>{row.value}</b>
          </li>
        ))}
      </ul>
      <p className="rcpt-verdict">
        <span className="vstk">VERDICT:</span> {VERDICT}
      </p>
    </div>
  );
}

export function Stats() {
  const pocket = useIsPocket();

  if (pocket) {
    return (
      <Pocket title="STATS" status="AUTUMN 2026" footer={<div className="pk-bar"><PocketNavLinks current="/stats" /></div>}>
        <main className="pk-panel stats">
          <div className="stats-kicker">SUSTAINABILITY STATS</div>
          <h1 className="stats-title hIn">
            Looking good.
            <br />
            <span>Doing good.</span>
          </h1>
          <Receipt compact />
        </main>
      </Pocket>
    );
  }

  const side = `side ${printClass(DISPLAY.print)}`;
  return (
    <Monitor title="CherOS · SUSTAINABILITY STATS" tag="AUTUMN 2026" footer={<MonitorNav current="/stats" />}>
      <div className={side} aria-hidden="true" />
      <main className="panel stats">
        <div className="stats-kicker">SUSTAINABILITY STATS</div>
        <h1 className="stats-title hIn">
          Looking good.
          <br />
          <span>Doing good.</span>
        </h1>
        <p className="stats-intro">Check out your stylish saving stats</p>
        <Receipt />
      </main>
      <div className={side} aria-hidden="true" />
    </Monitor>
  );
}
