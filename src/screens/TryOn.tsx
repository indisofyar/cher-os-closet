import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Monitor } from '../components/Monitor';
import { Pocket } from '../components/Pocket';
import { MonitorNav, PocketNavLinks } from '../components/NavBar';
import { useIsPocket } from '../hooks/useIsPocket';
import { DISPLAY, printClass } from '../config';
import { WARDROBE } from '../data/garments';
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
      <svg className="paste pasted sticker-star" style={{ ...v('-12deg', '2.05s'), position: 'absolute', zIndex: 4, left: 26, bottom: 330 }} width="92" height="92" viewBox="0 0 100 100" aria-hidden="true">
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

function isInWardrobe(o: TryOnOutfit) {
  const w = WARDROBE[o.gender];
  return w.tops.some((g) => g.name === o.top) && w.bottoms.some((g) => g.name === o.bottom);
}

/**
 * Reads the colour along the photo's left and right edges so the stage can be painted
 * the same colour, and the photo's background runs on to the panel's edges.
 */
function edgeColour(img: HTMLImageElement): string | null {
  try {
    const w = 24;
    const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    let r = 0, g = 0, b = 0, n = 0;
    for (const x of [0, 1, w - 2, w - 1]) {
      // Top two-thirds only: feet and floor shadows sit at the bottom.
      const px = ctx.getImageData(x, 0, 1, Math.ceil(h * 0.66)).data;
      for (let i = 0; i < px.length; i += 4) {
        r += px[i];
        g += px[i + 1];
        b += px[i + 2];
        n++;
      }
    }
    return n ? `rgb(${Math.round(r / n)}, ${Math.round(g / n)}, ${Math.round(b / n)})` : null;
  } catch {
    return null;
  }
}

/** Saves the generated photo: the share sheet on phones (so it can go to Photos), a download elsewhere. */
async function saveImage(dataUrl: string, name: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
  const file = new File([blob], `${name}.${ext}`, { type: blob.type });
  const touch = window.matchMedia('(pointer: coarse)').matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false;
      // Share failed for another reason: fall back to a download.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}

/** The stage: no outfit, no photo, dressing, the generated photo, or an error. */
function Stage({
  state,
  outfit,
  bodyPhoto,
  retry,
  onBackdrop,
}: {
  state: TryOnState;
  outfit: TryOnOutfit | null;
  bodyPhoto: string | null;
  retry: () => void;
  onBackdrop: (colour: string | null) => void;
}) {
  if (!outfit) {
    return (
      <div className="stage-msg">
        <p>Pick an outfit in the wardrobe first, then hit “Try it on on you”.</p>
        <Link className="tr stage-msg-btn" to="/wardrobe">
          Wardrobe
        </Link>
      </div>
    );
  }
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
    return (
      <img
        className="stage-photo fresh"
        src={state.image}
        alt={`You wearing the ${outfit.top} and ${outfit.bottom}`}
        onLoad={(e: SyntheticEvent<HTMLImageElement>) => onBackdrop(edgeColour(e.currentTarget))}
      />
    );
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
  const { bodyPhoto } = useAppState();

  const picked = readOutfit(location.state);
  const outfit = picked && isInWardrobe(picked) ? picked : null;
  const { state: ai, retry } = useTryOn(bodyPhoto, outfit);
  const ready = ai.status === 'done';

  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Bumped when the photo arrives so the stickers pop on.
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    setSaved(false);
    if (ready) setReplay((r) => r + 1);
    else setBackdrop(null);
  }, [ready]);

  const save = async () => {
    if (ai.status !== 'done' || !outfit) return;
    const name = `cheros-${outfit.top}-${outfit.bottom}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (await saveImage(ai.image, name)) setSaved(true);
  };

  const status = saved ? 'SAVED' : outfit && bodyPhoto && ai.status === 'loading' ? 'DRESSING…' : 'ON YOU';
  // Paint the stage with the photo's own background so it doesn't stop short inside the frame.
  const stageStyle: CSSProperties | undefined = ready ? { background: backdrop ?? '#FFFFFF' } : undefined;
  const stage = <Stage state={ai} outfit={outfit} bodyPhoto={bodyPhoto} retry={retry} onBackdrop={setBackdrop} />;

  const side = `side ${printClass(DISPLAY.print)}`;

  if (pocket) {
    return (
      <Pocket
        title="WARDROBE"
        status={status}
        overlay={ready ? <PocketStickers key={replay} /> : undefined}
        controls={{
          b: { label: 'B: back to dressing room', to: '/wardrobe' },
          a: { label: 'A: save photo', onClick: save },
        }}
        footer={
          <div className="pk-bar">
            <PocketNavLinks current="/try-on" />
            <button className="pk-sb hot" onClick={save} disabled={!ready}>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        }
      >
        <main className="pk-panel tryon">
          <div className="pk-stage" style={stageStyle}>
            {stage}
            {saved && <div className="pk-saved">SAVED!</div>}
          </div>
        </main>
      </Pocket>
    );
  }

  return (
    <Monitor
      title="CherOS · WARDROBE"
      tag={status}
      overlay={ready ? <Stickers key={replay} /> : undefined}
      footer={
        <MonitorNav current="/try-on" />
      }
    >
      <div className={side}>
        <Link className="big grey try-else" to="/wardrobe">
          Back to wardrobe
        </Link>
      </div>

      <main className="panel tryon">
        <div className="stage" style={stageStyle}>
          {stage}
          {saved && <div className="saved-stamp">SAVED!</div>}
        </div>
      </main>

      <div className={side}>
        <button className="big hot" onClick={save} disabled={!ready}>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </Monitor>
  );
}
