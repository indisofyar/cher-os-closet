import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Monitor } from '../components/Monitor';
import { Pocket } from '../components/Pocket';
import { useIsPocket } from '../hooks/useIsPocket';
import { PlaidDefs } from '../components/PlaidDefs';
import { DISPLAY, printClass } from '../config';
import { LOOKS, VERDICT_STYLE, WARDROBE, outfitCheck } from '../data/garments';
import type { TryOnOutfit } from '../ai/tryOnPrompt';
import { readOutfit, useTryOn, type TryOnState } from '../ai/useTryOn';
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

const HEART = 'M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z';
const STAR = 'M50 4 L62 36 L96 38 L69 59 L79 94 L50 74 L21 94 L31 59 L4 38 L38 36 Z';

/** Same stickers, sized and placed for the handheld. */
function PocketStickers() {
  return (
    <>
      <div className="stk pk-stk paste pasted" style={{ ...v('-9deg', '1.2s'), top: 2, left: -10, background: '#FF8FC7', color: '#15143F', fontSize: 22 }}>
        OH MY GOD,
      </div>
      <div className="stk pk-stk holo paste pasted" style={{ ...v('6deg', '1.5s'), top: 440, right: -12, color: '#15143F', fontSize: 16 }}>
        i’m totally buggin’
      </div>
      <svg className="paste pasted" style={{ ...v('14deg', '1.8s'), position: 'absolute', zIndex: 4, right: 14, top: -10, pointerEvents: 'none' }} width="50" height="48" viewBox="0 0 100 96" aria-hidden="true">
        <path d={HEART} fill="#E0245E" stroke="#FFFFFF" strokeWidth="10" strokeLinejoin="round" />
        <path d={HEART} fill="none" stroke="#15143F" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <svg className="paste pasted" style={{ ...v('-12deg', '2.05s'), position: 'absolute', zIndex: 4, right: 16, top: 482, pointerEvents: 'none' }} width="52" height="52" viewBox="0 0 100 100" aria-hidden="true">
        <path d={STAR} fill="#F2C230" stroke="#FFFFFF" strokeWidth="10" strokeLinejoin="round" />
        <path d={STAR} fill="none" stroke="#15143F" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </>
  );
}

/** The body figure wearing a look, with the shimmer and sparkles. */
function Figure({ look, className, stroke }: { look: (typeof LOOKS)[number]; className: string; stroke: number }) {
  const clipId = `outfitClip-${className}`;
  return (
    <svg className={className} role="img" aria-label={`You wearing ${look.name}`} viewBox="0 0 120 240">
      <ellipse cx="60" cy="232" rx="34" ry="5" fill="#15143F" opacity=".12" />
      <circle cx="60" cy="22" r="13" fill="#FFB3D4" stroke="#15143F" strokeWidth={stroke} />
      <path
        d="M54 32 L66 32 L66 40 Q84 42 88 50 L96 118 L89 120 L80 62 L78 120 L76 228 L66 228 L61 140 L59 140 L54 228 L44 228 L42 120 L40 62 L31 120 L24 118 L32 50 Q36 42 54 40 Z"
        fill="#FFB3D4"
        stroke="#15143F"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
      {look.parts.map((p, n) => (
        <g key={n}>
          <path d={p.d} fill={p.fill} stroke="#15143F" strokeWidth={stroke} strokeLinejoin="round" />
          {p.d2 && <path d={p.d2} fill="none" stroke="#15143F" strokeWidth="1.1" strokeLinecap="round" />}
        </g>
      ))}
      <clipPath id={clipId}>
        {look.parts.map((p, n) => (
          <path key={n} d={p.d} />
        ))}
      </clipPath>
      <g clipPath={`url(#${clipId})`} aria-hidden="true">
        <path className="shine" d="M-110 0 L-80 0 L-130 240 L-160 240 Z M-70 0 L-62 0 L-112 240 L-120 240 Z" fill="#FFFFFF" opacity=".8" />
      </g>
      <g aria-hidden="true" fill="#FFFFFF" stroke="#E0245E" strokeWidth=".8">
        <path className="spark" style={v('0', '.3s')} d="M44 58 L46 64 L52 66 L46 68 L44 74 L42 68 L36 66 L42 64 Z" />
        <path className="spark" style={v('0', '.55s')} d="M78 90 L79.5 94.5 L84 96 L79.5 97.5 L78 102 L76.5 97.5 L72 96 L76.5 94.5 Z" />
        <path className="spark" style={v('0', '.8s')} d="M50 132 L52 138 L58 140 L52 142 L50 148 L48 142 L42 140 L48 138 Z" />
        <path className="spark" style={v('0', '1s')} d="M72 150 L73.5 154.5 L78 156 L73.5 157.5 L72 162 L70.5 157.5 L66 156 L70.5 154.5 Z" />
      </g>
    </svg>
  );
}

/** One entry in the try-on carousel: the user's own outfit (AI photo) or a preset look (SVG figure). */
type Slide = {
  id: string;
  name: string;
  verdict: keyof typeof VERDICT_STYLE;
  line: string;
  short: string;
  look: (typeof LOOKS)[number] | null;
};

function outfitSlide(o: TryOnOutfit): Slide | null {
  const w = WARDROBE[o.gender];
  const top = w.tops.find((g) => g.name === o.top);
  const bottom = w.bottoms.find((g) => g.name === o.bottom);
  if (!top || !bottom) return null;
  const check = outfitCheck(o.gender, top, bottom);
  return {
    id: `outfit:${o.gender}:${o.top}+${o.bottom}`,
    name: `${o.top} + ${o.bottom}`,
    verdict: check.label,
    line: check.line,
    short: check.short,
    look: null,
  };
}

/** What the stage shows for the user's own outfit while it's being generated, once it's back, or when it fails. */
function AiStage({ state, bodyPhoto, retry, pocket }: { state: TryOnState; bodyPhoto: string | null; retry: () => void; pocket: boolean }) {
  if (!bodyPhoto) {
    return (
      <div className="stage-msg">
        <p>No body photo yet. Take one and I’ll dress you.</p>
        <Link className="tr stage-msg-btn" to="/setup">
          Take my photo
        </Link>
      </div>
    );
  }
  if (state.status === 'done') {
    return <img className={`stage-photo fresh${pocket ? ' pk' : ''}`} src={state.image} alt="You wearing this outfit" />;
  }
  if (state.status === 'error') {
    return (
      <div className="stage-msg" role="alert">
        <span className="stage-msg-head">AS IF!</span>
        <p>{state.message}</p>
        <button className="tr stage-msg-btn" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="dressing" role="status">
      <img className="stage-photo pending" src={bodyPhoto} alt="" />
      <div className="scanbar" aria-hidden="true" />
      <span className="dressing-text blinky">DRESSING YOU…</span>
    </div>
  );
}

export function TryOn() {
  const pocket = useIsPocket();
  const location = useLocation();
  const { bodyPhoto, isSaved, toggleSaved, savedOutfits } = useAppState();

  // The outfit picked in the dressing room ("Try it on on you") comes first, followed by the preset looks.
  const outfit = readOutfit(location.state);
  const mine = outfit ? outfitSlide(outfit) : null;
  const slides: Slide[] = [...(mine ? [mine] : []), ...LOOKS.map((l) => ({ ...l, look: l }))];

  const [i, setI] = useState(0);
  // Bumped on each outfit change so the sticker/sparkle animations replay.
  const [replay, setReplay] = useState(0);
  const { state: ai, retry } = useTryOn(bodyPhoto, mine ? outfit : null);

  const slide = slides[i] ?? slides[0];
  const onMine = slide.look === null;
  const aiReady = ai.status === 'done';
  const style = VERDICT_STYLE[slide.verdict];
  const saved = isSaved(slide.id);
  // Stickers celebrate a finished look, so hold them back until the AI photo arrives.
  const showStickers = !onMine || aiReady;
  const canWear = !onMine || aiReady;

  // Replay the stickers when the generated photo lands.
  useEffect(() => {
    if (aiReady) setReplay((r) => r + 1);
  }, [aiReady]);

  const go = (n: number) => {
    setI((n + slides.length) % slides.length);
    setReplay((r) => r + 1);
  };
  const auto = () => go(i + 1 + Math.floor(Math.random() * (slides.length - 1)));
  const wearIt = () => canWear && toggleSaved(slide.id, slide.name);

  const label = onMine
    ? ai.status === 'done'
      ? 'YOU · IN THIS OUTFIT'
      : ai.status === 'error'
        ? 'YOU · TRY AGAIN'
        : bodyPhoto
          ? 'YOU · DRESSING…'
          : 'YOU · NO PHOTO YET'
    : bodyPhoto
      ? 'YOU · FROM YOUR PHOTO'
      : 'YOU · NO PHOTO YET';
  const status = saved ? 'SAVED' : onMine && ai.status === 'loading' ? 'DRESSING…' : 'ON YOU';

  const side = `side ${printClass(DISPLAY.print)}`;

  if (pocket) {
    const wear = { label: saved ? 'A: unsave outfit' : 'A: wear it', onClick: wearIt };
    return (
      <Pocket
        title="WARDROBE"
        status={status}
        overlay={showStickers ? <PocketStickers key={replay} /> : undefined}
        controls={{
          left: { label: 'Left: previous outfit', onClick: () => go(i - 1) },
          right: { label: 'Right: next outfit', onClick: () => go(i + 1) },
          b: { label: 'B: back to dressing room', to: '/wardrobe' },
          a: wear,
          start: { label: 'Start: auto style', onClick: auto },
        }}
        footer={
          <div className="pk-bar">
            <div className="pk-bar-links">
              <Link className="pk-menu" to="/">
                MENU
              </Link>
              <Link className="pk-menu" to="/wardrobe">
                WARDROBE
              </Link>
            </div>
            <button className="pk-sb hot" onClick={wear.onClick} aria-pressed={saved} disabled={!canWear}>
              {saved ? 'Saved' : 'Wear it'}
            </button>
          </div>
        }
      >
        <PlaidDefs id="plaidT" size={10} />
        <main className="pk-panel tryon">
          <div className="pk-stage">
            <span className="pk-stage-label">{label}</span>
            <span className="pk-stage-pos">
              {i + 1}/{slides.length}
            </span>
            <button className="pk-sb pk-arrow" style={{ left: 4 }} aria-label="Previous outfit" onClick={() => go(i - 1)}>
              <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
                <path d="M0 7 L12 0 L12 14 Z" fill="#1E1C7A" />
              </svg>
            </button>
            <button className="pk-sb pk-arrow" style={{ right: 4 }} aria-label="Next outfit" onClick={() => go(i + 1)}>
              <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
                <path d="M12 7 L0 0 L0 14 Z" fill="#1E1C7A" />
              </svg>
            </button>
            {slide.look ? (
              <Figure key={replay} look={slide.look} className="pk-figure" stroke={1.8} />
            ) : (
              <AiStage state={ai} bodyPhoto={bodyPhoto} retry={retry} pocket />
            )}
            {bodyPhoto && (!onMine || aiReady) && (
              <figure className="pk-polaroid">
                <img src={bodyPhoto} alt="Your body photo" />
              </figure>
            )}
            {saved && <div className="pk-saved">SAVED!</div>}
          </div>
          <div className="pk-verdict-row" aria-live="polite">
            <span className="pk-verdict" style={{ background: style.bg, color: style.fg, fontSize: 14 }}>
              {slide.verdict}
            </span>
            <p className="pk-verdict-line">{slide.short}</p>
          </div>
        </main>
      </Pocket>
    );
  }

  return (
    <Monitor
      title="CherOS · WARDROBE"
      tag={saved ? 'OUTFIT SAVED' : status}
      overlay={showStickers ? <Stickers key={replay} /> : undefined}
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
          <span className="stage-label">{label}</span>
          <span className="stage-pos">
            {i + 1}/{slides.length}
          </span>
          {slide.look ? (
            <Figure key={replay} look={slide.look} className="stage-figure" stroke={1.6} />
          ) : (
            <AiStage state={ai} bodyPhoto={bodyPhoto} retry={retry} pocket={false} />
          )}
          {bodyPhoto && (!onMine || aiReady) && (
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
            {slide.verdict}
          </span>
          <p className="verdict-line">
            <span style={{ fontFamily: "'Silkscreen', monospace", fontSize: 15 }}>{slide.name.toUpperCase()}:</span> {slide.line}
          </p>
        </div>
      </main>

      <div className={side}>
        <button className="big hot" onClick={wearIt} aria-pressed={saved} disabled={!canWear}>
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
