import { Link } from 'react-router-dom';
import { Monitor } from '../components/Monitor';
import { DISPLAY, printClass } from '../config';
import { WARDROBE_ITEM_COUNT } from '../data/garments';

export function Welcome() {
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
          <p style={{ margin: 0, fontSize: 30, lineHeight: 1.05, color: '#FFD1EA' }}>
            Clueless about what to wear to prom... or even just Tesco? We’ve got you.
          </p>
          <p style={{ margin: 0, fontSize: 22, lineHeight: 1.1, color: '#ECEBFF' }}>
            Upload your wardrobe and Cher will mix, match and style your pieces into totally wearable outfits. Spotted
            something online? Try before you buy and see if it actually works with what you already own. Your closet
            stays fabulous. Landfill stays hungry.
          </p>
        </div>
        <Link className="big hot welcome-cta" to="/setup">
          I’m clueless<span className="cursor" aria-hidden="true">_</span>
        </Link>
      </main>
      <div className={side} aria-hidden="true" />
    </Monitor>
  );
}
