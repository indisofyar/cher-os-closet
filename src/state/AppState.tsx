import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type SavedOutfit = { id: string; name: string; savedAt: number };

type AppState = {
  bodyPhoto: string | null;
  setBodyPhoto: (dataUrl: string | null) => void;
  savedOutfits: SavedOutfit[];
  toggleSaved: (id: string, name: string) => void;
  isSaved: (id: string) => boolean;
};

const Ctx = createContext<AppState | null>(null);

const PHOTO_KEY = 'cheros.bodyPhoto';
const OUTFITS_KEY = 'cheros.savedOutfits';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: keep working in memory.
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [bodyPhoto, setBodyPhoto] = useState<string | null>(() => load(PHOTO_KEY, null));
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(() => load(OUTFITS_KEY, []));

  useEffect(() => save(PHOTO_KEY, bodyPhoto), [bodyPhoto]);
  useEffect(() => save(OUTFITS_KEY, savedOutfits), [savedOutfits]);

  const toggleSaved = useCallback((id: string, name: string) => {
    setSavedOutfits((list) =>
      list.some((o) => o.id === id) ? list.filter((o) => o.id !== id) : [...list, { id, name, savedAt: Date.now() }],
    );
  }, []);

  const value = useMemo<AppState>(
    () => ({
      bodyPhoto,
      setBodyPhoto,
      savedOutfits,
      toggleSaved,
      isSaved: (id) => savedOutfits.some((o) => o.id === id),
    }),
    [bodyPhoto, savedOutfits, toggleSaved],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used inside AppStateProvider');
  return v;
}
