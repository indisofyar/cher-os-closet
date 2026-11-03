import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Monitor } from '../components/Monitor';
import { PlaidDefs } from '../components/PlaidDefs';
import { DISPLAY, printClass } from '../config';
import { LOOKS, VERDICT_STYLE } from '../data/garments';
import { useAppState } from '../state/AppState';

const v = (r: string, d: string) => ({ '--r': r, '--d': d }) as CSSProperties;

function Stickers() {
  return (
    <>
      <div className="stk paste pasted" style={{ ...v('-9deg', '1.2s'), top: -22, left: -34, background: '#FF8FC7', color: '#15143F', fontSize: 42 }}>
        OH MY GOD,
      </div>
      <div className="stk holo paste pasted" style={{ ...v('7deg', '1.5s'), right: -46, top: '54%', color: '#15143F', fontSize: 32 }}>
        i’m totally buggin’
      </div>
      <svg className="paste pasted" style={{ ...v('14deg', '1.8s'), position: 'absolute', zIndex: 4, right: 70, top: -30 }} width="84" height="80" viewBox="0 0 100 96" aria-hidden="true">
        <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z" fill="#E0245E" stroke="#FFFFFF" strokeWidth="9" strokeLinejoin="round" />
        <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z" fill="none" stroke="#15143F" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <svg className="paste pasted sticker-star" style={{ ...v('-12deg', '2.05s'), position: 'absolute', zIndex: 4, left: 26, bottom: 200 }} width="92" height="92" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 4 L62 36 L96 38 L69 59 L79 94 L50 74 L21 94 L31 59 L4 38 L38 36 Z" fill="#F2C230" stroke="#FFFFFF" strokeWidth="9" strokeLinejoin="round" />
        <path d="M50 4 L62 36 L96 38 L69 59 L79 94 L50 74 L21 94 L31 59 L4 38 L38 36 Z" fill="none" stroke="#15143F" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    </>
  );
}

export function TryOn() {
  const { bodyPhoto, isSaved, toggleSaved, savedOutfits } = useAppState();
  const [i, setI] = useState(0);
  // Bumped on each outfit change so the sticker/sparkle animations replay.
  const [replay, setReplay] = useState(0);

  const look = LOOKS[i];
  const style = VERDICT_STYLE[look.verdict];
  const saved = isSaved(look.id);

  const go = (n: number) => {
    setI((n + LOOKS.length) % LOOKS.length);
    setReplay((r) => r + 1);
  };
  const auto = () => go(i + 1 + Math.floor(Math.random() * (LOOKS.length - 1)));

  const side = `side ${printClass(DISPLAY.print)}`;

  return (
    <Monitor
      title="CherOS · WARDROBE"
      tag={saved ? 'OUTFIT SAVED' : 'ON YOU'}
      overlay={<Stickers key={replay} />}
      footer={
        <nav className="cats" aria-label="Navigation">
          <Link to="/wardrobe">WARDROBE</Link>
          <Link to="/try-on" className="on" aria-current="page">
            ON YOU
          </Link>
          <span className="spacer" />
          {savedOutfits.length > 0 && <span style={{ padding: '0 10px' }}>{savedOutfits.length} SAVED</span>}
          <Link to="/" className="more">
            MENU
          </Link>
        </nav>
      }
    >
      <PlaidDefs id="plaidT" size={10} />
      <div className={side}>
        <button className="big" onClick={auto}>
          Auto
          <br />
          Style
        </button>
      </div>

      <main className="panel tryon">
        <div className="stage">
          <span className="stage-label">{bodyPhoto ? 'YOU · FROM YOUR BODY PHOTO' : 'YOU · NO BODY PHOTO YET'}</span>
          <span className="stage-pos">
            {i + 1}/{LOOKS.length}
          </span>
          <svg className="stage-figure" role="img" aria-label={`You wearing ${look.name}`} viewBox="0 0 120 240" key={replay}>
            <ellipse cx="60" cy="232" rx="34" ry="5" fill="#15143F" opacity=".12" />
            <circle cx="60" cy="22" r="13" fill="#FFB3D4" stroke="#15143F" strokeWidth="1.6" />
            <path
              d="M54 32 L66 32 L66 40 Q84 42 88 50 L96 118 L89 120 L80 62 L78 120 L76 228 L66 228 L61 140 L59 140 L54 228 L44 228 L42 120 L40 62 L31 120 L24 118 L32 50 Q36 42 54 40 Z"
              fill="#FFB3D4"
              stroke="#15143F"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {look.parts.map((p, n) => (
              <g key={n}>
                <path d={p.d} fill={p.fill} stroke="#15143F" strokeWidth="1.6" strokeLinejoin="round" />
                {p.d2 && <path d={p.d2} fill="none" stroke="#15143F" strokeWidth="1.1" strokeLinecap="round" />}
              </g>
            ))}
            <clipPath id="outfitClip">
              {look.parts.map((p, n) => (
                <path key={n} d={p.d} />
              ))}
            </clipPath>
            <g clipPath="url(#outfitClip)" aria-hidden="true">
              <path className="shine" d="M-110 0 L-80 0 L-130 240 L-160 240 Z M-70 0 L-62 0 L-112 240 L-120 240 Z" fill="#FFFFFF" opacity=".8" />
            </g>
            <g aria-hidden="true" fill="#FFFFFF" stroke="#E0245E" strokeWidth=".8">
              <path className="spark" style={v('0', '.3s')} d="M44 58 L46 64 L52 66 L46 68 L44 74 L42 68 L36 66 L42 64 Z" />
              <path className="spark" style={v('0', '.55s')} d="M78 90 L79.5 94.5 L84 96 L79.5 97.5 L78 102 L76.5 97.5 L72 96 L76.5 94.5 Z" />
              <path className="spark" style={v('0', '.8s')} d="M50 132 L52 138 L58 140 L52 142 L50 148 L48 142 L42 140 L48 138 Z" />
              <path className="spark" style={v('0', '1s')} d="M72 150 L73.5 154.5 L78 156 L73.5 157.5 L72 162 L70.5 157.5 L66 156 L70.5 154.5 Z" />
            </g>
          </svg>
          {bodyPhoto && (
            <figure className="polaroid" style={{ margin: 0 }}>
              <img src={bodyPhoto} alt="Your body photo" />
            </figure>
          )}
          {saved && <div className="saved-stamp">SAVED!</div>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="tr" aria-label="Previous outfit" onClick={() => go(i - 1)}>
            <svg width="30" height="16" viewBox="0 0 30 16" aria-hidden="true">
              <path d="M14 0v16L0 8zM30 0v16L16 8z" fill="#1E1C7A" />
            </svg>
          </button>
          <button className="tr" aria-label="Next outfit" onClick={() => go(i + 1)}>
            <svg width="30" height="16" viewBox="0 0 30 16" aria-hidden="true">
              <path d="M0 0v16l14-8zM16 0v16l14-8z" fill="#1E1C7A" />
            </svg>
          </button>
        </div>
        <div className="verdict-row" aria-live="polite">
          <span className="verdict" style={{ background: style.bg, color: style.fg }}>
            {look.verdict}
          </span>
          <p className="verdict-line">
            <span style={{ fontFamily: "'Silkscreen', monospace", fontSize: 15 }}>{look.name.toUpperCase()}:</span> {look.line}
          </p>
        </div>
      </main>

      <div className={side}>
        <button className="big hot" onClick={() => toggleSaved(look.id, look.name)} aria-pressed={saved}>
          {saved ? (
            'Saved'
          ) : (
            <>
              Wear
              <br />
              It
            </>
          )}
        </button>
      </div>
    </Monitor>
  );
}
