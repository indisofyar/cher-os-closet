import { Link } from 'react-router-dom';
import { Monitor, useClock } from '../components/Monitor';
import { Pocket } from '../components/Pocket';
import { useIsPocket } from '../hooks/useIsPocket';
import { DISPLAY, printClass } from '../config';
import { WARDROBE_ITEM_COUNT } from '../data/garments';

const LEDE = 'Clueless about what to wear to prom... or even just Tesco? We’ve got you.';
const BODY =
  'Upload your wardrobe and Cher will mix, match and style your pieces into totally wearable outfits. Spotted something online? Try before you buy and see if it actually works with what you already own. Your closet stays fabulous. Landfill stays hungry.';

function PocketWelcome() {
  const time = useClock();
  const go = { label: 'I’m clueless', to: '/setup' };
  return (
    <Pocket title="CHER’S CLOSET" status={time} controls={{ a: go, start: go }}>
      <main className="pk-welcome">
        <h1>
          CHER’S
          <br />
          <span style={{ color: '#FF8FC7' }}>closet</span>
          <sup>™</sup>
        </h1>
        <p style={{ margin: 0, fontSize: 21, lineHeight: 1, color: '#FFD1EA' }}>{LEDE}</p>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.05, color: '#ECEBFF' }}>{BODY}</p>
        <Link className="pk-sb hot" to="/setup" style={{ width: '100%', minHeight: 48, fontSize: 17, marginTop: 4 }}>
          I’m clueless<span className="cursor" aria-hidden="true">_</span>
        </Link>
      </main>
    </Pocket>
  );
}

export function Welcome() {
  if (useIsPocket()) return <PocketWelcome />;
  return <DesktopWelcome />;
}

function DesktopWelcome() {
  const side = `side narrow ${printClass(DISPLAY.print)}`;
  return (
    <Monitor
      title="CHER'S CLOSET"
      tag="AUTUMN EDIT"
      badge="CHER'S CLOSET"
      footer={
        <div className="bar">
          <span className="bar-label">(C) 1996–2026 TOTALLY BUGGIN' SOFTWARE</span>
          <span className="bar-label">{WARDROBE_ITEM_COUNT} ITEMS LOADED</span>
        </div>
      }
    >
      <div className={side} aria-hidden="true" />
      <main className="welcome-main">
        <h1 className="welcome-title">
          CHER’S <span style={{ color: '#FF8FC7' }}>closet</span>
          <sup>™</sup>
        </h1>
        <div className="welcome-copy">
          <p className="welcome-lede">{LEDE}</p>
          <p className="welcome-body">{BODY}</p>
        </div>
        <Link className="big hot welcome-cta" to="/setup">
          I’m clueless<span className="cursor" aria-hidden="true">_</span>
        </Link>
      </main>
      <div className={side} aria-hidden="true" />
    </Monitor>
  );
}
