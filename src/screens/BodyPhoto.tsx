import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Monitor } from '../components/Monitor';
import { DISPLAY, printClass } from '../config';
import { useAppState } from '../state/AppState';

type Phase = 'idle' | 'starting' | 'count' | 'done';

const TIPS = [
  'Head to toe in frame. Feet too.',
  'Stand about 2 metres back, arms slightly out.',
  'Plain wall behind you, good light.',
  'Wear something fitted.',
];

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
  const [phase, setPhase] = useState<Phase>(bodyPhoto ? 'done' : 'idle');
  const [count, setCount] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  }, []);

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
    setCount(3);
    setPhase('count');
    let n = 3;
    timerRef.current = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(timerRef.current);
        capture();
      } else {
        setCount(n);
      }
    }, 800);
  }, [capture]);

  const snap = useCallback(async () => {
    setError(null);
    if (streamRef.current) return startCountdown();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('NO CAMERA HERE. UPLOAD A PHOTO INSTEAD.');
      return;
    }
    setPhase('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
      // Wait a tick for the <video> to mount, then attach the stream.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
        startCountdown();
      });
    } catch {
      setPhase('idle');
      setError('CAMERA BLOCKED. ALLOW IT, OR UPLOAD A PHOTO.');
    }
  }, [startCountdown]);

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
    : phase === 'starting'
      ? 'WARMING UP THE CAMERA...'
      : counting
        ? 'HOLD STILL...'
        : done
          ? 'TAKE ANOTHER OR PRESS LET’S GO.'
          : 'LINE YOURSELF UP WITH THE OUTLINE.';

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
          <button className="big" onClick={() => fileRef.current?.click()}>
            Upload
            <br />
            Photo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          tabIndex={-1}
          aria-label="Upload a full-length photo"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <main className="panel photo">
        <div className="finder">
          {live && <video ref={videoRef} muted playsInline aria-label="Camera preview" />}
          {done && bodyPhoto && <img className="shot" src={bodyPhoto} alt="Your body photo" />}
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
          <h1>{done ? 'Looking good!' : 'First, a full-length photo'}</h1>
          <p className="intro">
            {done
              ? 'Body photo saved. CherOS will use it to show outfits on you.'
              : 'So CherOS can try clothes on you, take one photo of your whole body.'}
          </p>
          {TIPS.map((t, i) => (
            <div className="tip" key={t}>
              <b>{i + 1}</b>
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
          <button className="big hot" onClick={snap} disabled={phase === 'starting' || counting}>
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
      viewBox="0 0 100 200"
      style={overVideo ? { opacity: 0.8 } : undefined}
    >
      <circle cx="50" cy="16" r="11" fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray={dash} />
      <path
        d="M34 32 Q50 27 66 32 L76 86 L68 88 L61 50 L62 112 L58 190 L51 190 L50 124 L49 190 L42 190 L38 112 L39 50 L32 88 L24 86 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray={dash}
      />
    </svg>
  );
}
