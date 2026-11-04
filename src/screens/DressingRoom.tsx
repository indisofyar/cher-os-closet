import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorNav, PocketNavLinks } from '../components/NavBar';
import { Monitor } from '../components/Monitor';
import { Pocket } from '../components/Pocket';
import { useIsPocket } from '../hooks/useIsPocket';
import { DISPLAY, printClass } from '../config';
import { PlaidDefs } from '../components/PlaidDefs';
import { WARDROBE, outfitCheck, pickShoes, type Gender, type Garment } from '../data/garments';
import type { TryOnRouteState } from '../ai/useTryOn';

function GarmentSvg({ item, style, className }: { item: Garment; style?: React.CSSProperties; className?: string }) {
  return (
    <svg className={className} role="img" aria-label={item.name} viewBox="0 0 100 100" style={style}>
      <path d={item.d} fill={item.fill} stroke="#15143F" strokeWidth="1.6" strokeLinejoin="round" />
      <path d={item.d2} fill="none" stroke="#15143F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const PrevIcon = () => (
  <svg width="30" height="16" viewBox="0 0 30 16" aria-hidden="true">
    <path d="M14 0v16L0 8zM30 0v16L16 8z" fill="#1E1C7A" />
  </svg>
);
const NextIcon = () => (
  <svg width="30" height="16" viewBox="0 0 30 16" aria-hidden="true">
    <path d="M0 0v16l14-8zM16 0v16l14-8z" fill="#1E1C7A" />
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2 0v16l14-8z" fill="#1E1C7A" />
  </svg>
);

const WomenIcon = ({ w, h, sw }: { w: number; h: number; sw: number }) => (
  <svg width={w} height={h} viewBox="0 0 26 32" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="#1E1C7A" strokeWidth={sw} strokeLinecap="square">
    <circle cx="13" cy="10" r="7.5" vectorEffect="non-scaling-stroke" />
    <path d="M13 18 L13 30 M6.5 24.5 L19.5 24.5" vectorEffect="non-scaling-stroke" />
  </svg>
);
const MenIcon = ({ w, h, sw }: { w: number; h: number; sw: number }) => (
  <svg width={w} height={h} viewBox="0 0 30 30" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="#1E1C7A" strokeWidth={sw} strokeLinecap="square">
    <circle cx="11" cy="19" r="7.5" vectorEffect="non-scaling-stroke" />
    <path d="M17 13 L26 4 M19 4 L26 4 L26 11" vectorEffect="non-scaling-stroke" />
  </svg>
);

const SmallTri = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
    <path d={dir === 'left' ? 'M0 7 L12 0 L12 14 Z' : 'M12 7 L0 0 L0 14 Z'} fill="#1E1C7A" />
  </svg>
);

export function DressingRoom() {
  const pocket = useIsPocket();
  const navigate = useNavigate();
  /** Which picker the handheld d-pad is driving: 0 = top, 1 = bottom. */
  const [sel, setSel] = useState(0);
  const [gender, setGender] = useState<Gender>('w');
  const [ti, setTi] = useState(0);
  const [bi, setBi] = useState(0);
  const [full, setFull] = useState(false);

  const { tops, bottoms } = WARDROBE[gender];
  const top = tops[ti];
  const bottom = bottoms[bi];
  const shoes = pickShoes(gender, top, bottom);
  const check = outfitCheck(gender, top, bottom);
  /** Opens the try-on screen, which generates the photo of the user in this outfit. */
  const tryOnYou = () =>
    navigate('/try-on', { state: { outfit: { gender, top: top.name, bottom: bottom.name } } satisfies TryOnRouteState });

  const switchGender = (g: Gender) => {
    setGender(g);
    setTi(0);
    setBi(0);
    setFull(false);
  };
  const autoStyle = () => {
    setTi(Math.floor(Math.random() * tops.length));
    setBi(Math.floor(Math.random() * bottoms.length));
    setFull(true);
  };
  const cycle = (set: (f: (n: number) => number) => void, len: number, dir: number) => () =>
    set((n) => (n + dir + len) % len);

  const viewers = [
    { label: 'top', item: top, i: ti, len: tops.length, set: setTi },
    { label: 'bottom', item: bottom, i: bi, len: bottoms.length, set: setBi },
  ];

  const side = `side ${printClass(DISPLAY.print)}`;

  if (pocket) {
    const current = viewers[sel];
    return (
      <Pocket
        title="WARDROBE"
        status={full ? 'OUTFIT CHECK' : 'AUTUMN EDIT'}
        controls={{
          up: { label: 'Up: select top', onClick: () => (setSel(0), setFull(false)) },
          down: { label: 'Down: select bottom', onClick: () => (setSel(1), setFull(false)) },
          left: { label: 'Left: previous item', onClick: cycle(current.set, current.len, -1) },
          right: { label: 'Right: next item', onClick: cycle(current.set, current.len, 1) },
          b: { label: 'B: back', onClick: () => setFull(false) },
          a: full
            ? { label: 'A: try it on on you', onClick: tryOnYou }
            : { label: 'A: try it on', onClick: () => setFull(true) },
          select: { label: 'Select: switch women’s and men’s', onClick: () => switchGender(gender === 'm' ? 'w' : 'm') },
          start: { label: 'Start: auto style', onClick: autoStyle },
        }}
        footer={
          <div className="pk-bar">
            <PocketNavLinks current="/wardrobe" />
            {full ? (
              <button className="pk-sb hot" onClick={tryOnYou}>
                On you
              </button>
            ) : (
              <button className="pk-sb hot" onClick={() => setFull(true)}>
                Try it on
              </button>
            )}
          </div>
        }
      >
        <PlaidDefs id="plaidY" size={18} />
        <main className="pk-panel">
          {!full ? (
            <div className="pk-pick">
              <div className="pk-pick-head">
                <div className="pk-seg-group" role="group" aria-label="Show clothes for">
                  <button className="pk-seg" aria-pressed={gender === 'w'} onClick={() => switchGender('w')} aria-label="Women’s clothes">
                    <WomenIcon w={30} h={26} sw={4.5} />
                  </button>
                  <button className="pk-seg" aria-pressed={gender === 'm'} onClick={() => switchGender('m')} aria-label="Men’s clothes">
                    <MenIcon w={32} h={24} sw={4.5} />
                  </button>
                </div>
                <button className="pk-sb" onClick={autoStyle}>
                  Auto style
                </button>
              </div>
              {viewers.map((v, n) => (
                <section className="pk-row" aria-label={v.label} key={v.label}>
                  <button className="pk-sb" aria-label={`Previous ${v.label}`} onClick={cycle(v.set, v.len, -1)}>
                    <SmallTri dir="left" />
                  </button>
                  <button
                    className={`pk-view${sel === n ? ' selected' : ''}`}
                    onClick={() => setSel(n)}
                    aria-pressed={sel === n}
                    aria-label={`${v.item.name}, ${v.i + 1} of ${v.len}. Select ${v.label} for the d-pad`}
                  >
                    <GarmentSvg item={v.item} />
                    <span className="name">{v.item.name}</span>
                    <span className="pos">
                      {v.i + 1}/{v.len}
                    </span>
                  </button>
                  <button className="pk-sb" aria-label={`Next ${v.label}`} onClick={cycle(v.set, v.len, 1)}>
                    <SmallTri dir="right" />
                  </button>
                </section>
              ))}
            </div>
          ) : (
            <div className="pk-look">
              <GarmentSvg item={top} style={{ width: 108, height: 108, flex: 'none' }} />
              <GarmentSvg item={bottom} style={{ width: 92, height: 92, marginTop: -14, flex: 'none' }} />
              <GarmentSvg item={shoes} style={{ width: 64, height: 64, marginTop: -10, flex: 'none' }} />
              <div className="pk-verdict-row" aria-live="polite">
                <span className="pk-verdict" style={{ background: check.bg, color: check.fg }}>
                  {check.label}
                </span>
                <p className="pk-verdict-line">{check.short}</p>
              </div>
            </div>
          )}
        </main>
      </Pocket>
    );
  }

  return (
    <Monitor
      title="CherOS · WARDROBE"
      tag={full ? 'OUTFIT CHECK' : 'AUTUMN EDIT'}
      footer={
        <MonitorNav current="/wardrobe" />
      }
    >
      <PlaidDefs id="plaidY" size={18} />
      <div className={side}>
        <div className="seg-group" role="group" aria-label="Show clothes for">
          <button
            className="seg"
            aria-pressed={gender === 'w'}
            onClick={() => switchGender('w')}
            aria-label="Women’s clothes"
            title="Women’s clothes"
          >
            <svg width="36" height="32" viewBox="0 0 26 32" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="#1E1C7A" strokeWidth="5.5" strokeLinecap="square">
              <circle cx="13" cy="10" r="7.5" vectorEffect="non-scaling-stroke" />
              <path d="M13 18 L13 30 M6.5 24.5 L19.5 24.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </button>
          <button
            className="seg"
            aria-pressed={gender === 'm'}
            onClick={() => switchGender('m')}
            aria-label="Men’s clothes"
            title="Men’s clothes"
          >
            <svg width="40" height="30" viewBox="0 0 30 30" preserveAspectRatio="none" aria-hidden="true" fill="none" stroke="#1E1C7A" strokeWidth="5.5" strokeLinecap="square">
              <circle cx="11" cy="19" r="7.5" vectorEffect="non-scaling-stroke" />
              <path d="M17 13 L26 4 M19 4 L26 4 L26 11" vectorEffect="non-scaling-stroke" />
            </svg>
          </button>
        </div>
        <button className="big" onClick={autoStyle}>
          Auto
          <br />
          Style
        </button>
      </div>

      <main className="panel">
        {!full ? (
          <div className="pickers">
            {viewers.map((v) => (
              <section className="picker" aria-label={v.label} key={v.label}>
                <div className="view">
                  <GarmentSvg item={v.item} />
                  <span className="name">{v.item.name}</span>
                  <span className="pos">
                    {v.i + 1}/{v.len}
                  </span>
                </div>
                <div className="picker-controls">
                  <button className="tr" aria-label={`Previous ${v.label}`} onClick={cycle(v.set, v.len, -1)}>
                    <PrevIcon />
                  </button>
                  <button className="tr" aria-label={`Pick this ${v.label}`} onClick={() => setFull(true)}>
                    <PlayIcon />
                  </button>
                  <button className="tr" aria-label={`Next ${v.label}`} onClick={cycle(v.set, v.len, 1)}>
                    <NextIcon />
                  </button>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="full-look">
            <GarmentSvg className="look-top" item={top} style={{ width: '46%', maxWidth: 230, height: 'auto', flex: 'none' }} />
            <GarmentSvg className="look-bottom" item={bottom} style={{ width: '40%', maxWidth: 200, height: 'auto', marginTop: '-12%', flex: 'none' }} />
            <GarmentSvg className="look-shoes" item={shoes} style={{ width: '30%', maxWidth: 150, height: 'auto', marginTop: '-4%', flex: 'none' }} />
            <div className="verdict-row" aria-live="polite">
              <span className="verdict" style={{ background: check.bg, color: check.fg }}>
                {check.label}
              </span>
              <p className="verdict-line">{check.line}</p>
            </div>
          </div>
        )}
      </main>

      <div className={side}>
        {full ? (
          <>
            <button className="big small" onClick={() => setFull(false)}>
              Back
            </button>
            <button className="big hot try-on-you" onClick={tryOnYou}>
              Try it on
              <br />
              on you
            </button>
          </>
        ) : (
          <button className="big" onClick={() => setFull(true)}>
            Try It
            <br />
            On
          </button>
        )}
      </div>
    </Monitor>
  );
}
