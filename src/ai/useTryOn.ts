import { useEffect, useState } from 'react';
import type { Gender } from '../data/garments';
import type { TryOnOutfit } from './tryOnPrompt';

/** Router state passed from the dressing room's "Try it on on you" button. */
export type TryOnRouteState = { outfit: TryOnOutfit };

export function readOutfit(state: unknown): TryOnOutfit | null {
  const o = (state as Partial<TryOnRouteState> | null)?.outfit;
  if (!o || (o.gender !== 'w' && o.gender !== 'm') || typeof o.top !== 'string' || typeof o.bottom !== 'string') return null;
  return { gender: o.gender as Gender, top: o.top, bottom: o.bottom };
}

/** Cheap fingerprint so the cache key doesn't hold the whole photo twice. */
function fingerprint(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return `${s.length}:${(h >>> 0).toString(36)}`;
}

// One request per photo + outfit for this page session. This also stops React's
// StrictMode double effect (and quick back/forward) from paying for a second image.
const inflight = new Map<string, Promise<string>>();

async function callApi(photo: string, outfit: TryOnOutfit): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/try-on', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ photo, ...outfit }),
    });
  } catch {
    throw new Error('Can’t reach the stylist. Check your connection.');
  }
  const body = (await res.json().catch(() => null)) as { image?: string; message?: string } | null;
  if (res.ok && body?.image) return body.image;
  throw new Error(body?.message || 'The stylist is out to lunch. Try again.');
}

export function requestTryOn(photo: string, outfit: TryOnOutfit): Promise<string> {
  const key = `${fingerprint(photo)}|${outfit.gender}|${outfit.top}|${outfit.bottom}`;
  let p = inflight.get(key);
  if (!p) {
    p = callApi(photo, outfit);
    inflight.set(key, p);
    // Failed attempts are forgotten so "Try again" makes a fresh request.
    p.catch(() => inflight.delete(key));
  }
  return p;
}

export type TryOnState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; image: string }
  | { status: 'error'; message: string };

/** Generates (once) an image of the body photo wearing `outfit`. Idle when either is missing. */
export function useTryOn(photo: string | null, outfit: TryOnOutfit | null) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<TryOnState>({ status: 'idle' });
  const gender = outfit?.gender;
  const top = outfit?.top;
  const bottom = outfit?.bottom;

  useEffect(() => {
    if (!photo || !gender || !top || !bottom) {
      setState({ status: 'idle' });
      return;
    }
    let live = true;
    setState({ status: 'loading' });
    requestTryOn(photo, { gender, top, bottom }).then(
      (image) => live && setState({ status: 'done', image }),
      (err: Error) => live && setState({ status: 'error', message: err.message }),
    );
    return () => {
      live = false;
    };
  }, [photo, gender, top, bottom, attempt]);

  return { state, retry: () => setAttempt((a) => a + 1) };
}
