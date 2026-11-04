import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor } from '../components/Monitor';
import { Pocket } from '../components/Pocket';
import { useIsPocket } from '../hooks/useIsPocket';
import { DISPLAY, printClass } from '../config';
import { useAppState } from '../state/AppState';

type Phase = 'idle' | 'count' | 'done';

/** Seconds on the self-timer before the photo is taken. */
const COUNTDOWN = 5;

const HEADING = 'Step 1: Upload or take a photo';
const INTRO = 'Let’s see what we’re working with and make it TOTALLY fabulous.';

/** Shown on both layouts. We only need the top half of the body in the photo. */
const TIPS = ['Make sure you get head in the shot', 'Smile and click. You’ve got this!'];

const MAX_SIDE = 1200;

/** Draws a source onto a canvas no larger than MAX_SIDE and returns a JPEG data URL. */
function toDataUrl(src: CanvasImageSource, w: number, h: number, mirror = false) {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d')!;
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export function BodyPhoto() {
  const { bodyPhoto, setBodyPhoto } = useAppState();
  const navigate = useNavigate();
  const pocket = useIsPocket();
  const [phase, setPhase] = useState<Phase>(bodyPhoto ? 'done' : 'idle');
  const [count, setCount] = useState(COUNTDOWN);
  const [error, setError] = useState<string | null>(null);
  const [cam, setCam] = useState<'off' | 'starting' | 'on'>('off');
  const live = cam === 'on';

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  // Bumped whenever a pending camera request should be discarded.
  const requestRef = useRef(0);

  const stopCamera = useCallback(() => {
    requestRef.current += 1;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCam('off');
  }, []);

  /** Turns the camera on. Resolves true once the preview is live. */
  const startCamera = useCallback(async () => {
    if (streamRef.current) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('NO CAMERA HERE. UPLOAD A PHOTO INSTEAD.');
      return false;
    }
    const req = ++requestRef.current;
    setCam('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      if (req !== requestRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return false;
      }
      streamRef.current = stream;
      setError(null);
      setCam('on');
      return true;
    } catch {
      if (req === requestRef.current) {
        setCam('off');
        setError('CAMERA BLOCKED. ALLOW IT, OR UPLOAD A PHOTO.');
      }
      return false;
    }
  }, []);

  // Attach the stream once the <video> element has mounted.
  useEffect(() => {
    const v = videoRef.current;
    if (live && v && streamRef.current) {
      v.srcObject = streamRef.current;
      void v.play().catch(() => {});
    }
  }, [live, pocket]);

  // Turn the camera on as soon as the screen opens (and again after Retake).
  useEffect(() => {
    if (phase === 'idle') void startCamera();
  }, [phase, startCamera]);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      stopCamera();
    },
    [stopCamera],
  );

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (v && v.videoWidth) setBodyPhoto(toDataUrl(v, v.videoWidth, v.videoHeight, true));
    stopCamera();
    setPhase('done');
  }, [setBodyPhoto, stopCamera]);

  const startCountdown = useCallback(() => {
    clearInterval(timerRef.current);
    setCount(COUNTDOWN);
    setPhase('count');
    let n = COUNTDOWN;
    timerRef.current = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(timerRef.current);
        capture();
      } else {
        setCount(n);
      }
    }, 1000);
  }, [capture]);

  const snap = useCallback(async () => {
    setError(null);
    if (await startCamera()) startCountdown();
  }, [startCamera, startCountdown]);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBodyPhoto(toDataUrl(img, img.naturalWidth, img.naturalHeight));
      URL.revokeObjectURL(url);
      stopCamera();
      setPhase('done');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError('THAT FILE IS NOT A PHOTO. TRY A JPG OR PNG.');
    };
    img.src = url;
  };

  const retake = () => {
    setBodyPhoto(null);
    setPhase('idle');
  };

  const done = phase === 'done';
  const counting = phase === 'count';
  const side = `side ${printClass(DISPLAY.print)}`;

  const status = error
    ? error
    : cam === 'starting'
      ? 'WARMING UP THE CAMERA...'
      : counting
        ? 'HOLD STILL...'
        : done
          ? 'TAKE ANOTHER OR PRESS LET’S GO.'
          : live
            ? 'HEAD AND SHOULDERS IN THE OUTLINE, THEN PRESS TAKE PHOTO.'
            : 'GET YOUR HEAD AND SHOULDERS IN THE OUTLINE.';

  const openPicker = () => fileRef.current?.click();
  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="visually-hidden"
      tabIndex={-1}
      aria-label="Upload a photo"
      onChange={(e) => {
        onFile(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );
  const finderContents = (
    <>
      {live && <video ref={videoRef} muted playsInline aria-label="Camera preview" />}
      {done && bodyPhoto && <img className="shot" src={bodyPhoto} alt="Your body photo" />}
    </>
  );

  if (pocket) {
    const left = done ? { label: 'Retake', onClick: retake } : { label: 'Upload photo', onClick: openPicker };
    const right = done
      ? { label: 'Let’s go', to: '/wardrobe' }
      : { label: 'Take photo', onClick: () => void snap() };
    const heading = error
      ? error
      : cam === 'starting'
        ? 'Warming up the camera...'
        : counting
          ? 'Hold still...'
          : done
            ? 'Looking good!'
            : 'Upload or take a photo';
    return (
      <Pocket
        title="SETUP · STEP 1"
        status={
          <>
            {done ? 'SAVED' : 'NEW USER'}
            {/* Start is hidden on short phones, so skipping lives here instead. */}
            <Link className="pk-skip pk-short-only" to="/wardrobe">
              SKIP ›
            </Link>
          </>
        }
        controls={{ b: left, a: right, start: { label: 'Start: skip for now', to: '/wardrobe' } }}
      >
        <main className="pk-photo">
          <div className="pk-finder">
            {finderContents}
            <span className="pk-corner pk-c1" aria-hidden="true" />
            <span className="pk-corner pk-c2" aria-hidden="true" />
            <span className="pk-corner pk-c3" aria-hidden="true" />
            <span className="pk-corner pk-c4" aria-hidden="true" />
            <span className="pk-rec">
              <span className="pk-dot blinky" aria-hidden="true" />
              CAM
            </span>
            {!(done && bodyPhoto) && <BodyOutline captured={done} overVideo={live} />}
            {counting && (
              <div className="pk-count" aria-live="assertive">
                {count}
              </div>
            )}
            {done && <div className="pk-got-it">GOT IT!</div>}
          </div>
          <h1 className="pk-heading" aria-live="polite">
            {heading}
          </h1>
          {!done && <p className="pk-intro">{INTRO}</p>}
          {TIPS.map((t, i) => (
            <div className="pk-tip" key={t}>
              <b>TIP {i + 1}</b>
              <span>{t}</span>
            </div>
          ))}
          <div className="pk-actions">
            <button className="pk-sb" style={{ flex: 1 }} onClick={left.onClick}>
              {done ? 'Retake' : 'Upload'}
            </button>
            {done ? (
              <button className="pk-sb hot" style={{ flex: 1.3 }} onClick={() => navigate('/wardrobe')}>
                Let’s go
              </button>
            ) : (
              <button className="pk-sb hot" style={{ flex: 1.3 }} onClick={snap} disabled={cam === 'starting' || counting}>
                Take photo
              </button>
            )}
          </div>
          {fileInput}
        </main>
      </Pocket>
    );
  }

  return (
    <Monitor
      title="CherOS · SETUP"
      tag={done ? 'PHOTO SAVED' : 'NEW USER'}
      footer={
        <div className="bar">
          <span className="bar-label">STEP 1 · BODY PHOTO</span>
          <Link to="/wardrobe">SKIP FOR NOW</Link>
        </div>
      }
    >
      <div className={side}>
        {done ? (
          <button className="big" onClick={retake}>
            Retake
          </button>
        ) : (
          <button className="big" onClick={openPicker}>
            Upload
            <br />
            Photo
          </button>
        )}
        {fileInput}
      </div>

      <main className="panel photo">
        <div className="finder">
          {finderContents}
          <span className="corner c1" aria-hidden="true" />
          <span className="corner c2" aria-hidden="true" />
          <span className="corner c3" aria-hidden="true" />
          <span className="corner c4" aria-hidden="true" />
          <span className="rec">
            <span className="dot blinky" aria-hidden="true" />
            CAM
          </span>
          {!(done && bodyPhoto) && <BodyOutline captured={done} overVideo={live} />}
          {counting && (
            <div className="count" aria-live="assertive">
              {count}
            </div>
          )}
          {done && <div className="got-it">GOT IT!</div>}
        </div>

        <div className="photo-copy">
          <h1>{done ? 'Looking good!' : HEADING}</h1>
          <p className="intro">
            {done
              ? 'Body photo saved. CherOS will use it to show outfits on you.'
              : INTRO}
          </p>
          {TIPS.map((t, i) => (
            <div className="tip" key={t}>
              <b>TIP {i + 1}</b>
              <span>{t}</span>
            </div>
          ))}
          <p className="photo-status" aria-live="polite">
            {status}
          </p>
        </div>
      </main>

      <div className={side}>
        {done ? (
          <button className="big hot" onClick={() => navigate('/wardrobe')}>
            Let's
            <br />
            Go
          </button>
        ) : (
          <button className="big hot" onClick={snap} disabled={cam === 'starting' || counting}>
            Take
            <br />
            Photo
          </button>
        )}
      </div>
    </Monitor>
  );
}

function BodyOutline({ captured, overVideo }: { captured: boolean; overVideo: boolean }) {
  const fill = captured ? '#FF8FC7' : 'none';
  const stroke = captured ? '#ECEBFF' : '#ABA7F2';
  const dash = captured ? 'none' : '6 5';
  return (
    <svg
      className="outline"
      role="img"
      aria-label={captured ? 'Body photo captured' : 'Outline showing where to stand'}
      viewBox="0 0 100 100"
      style={overVideo ? { opacity: 0.8 } : undefined}
    >
      <ellipse cx="50" cy="28" rx="15" ry="18" fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={dash} />
      <path
        d="M43 46 L43 52 Q24 54 17 64 Q13 72 13 99 L87 99 Q87 72 83 64 Q76 54 57 52 L57 46"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray={dash}
      />
    </svg>
  );
}
