import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './state/AppState';
import { Welcome } from './screens/Welcome';
import { BodyPhoto } from './screens/BodyPhoto';
import { DressingRoom } from './screens/DressingRoom';
import { TryOn } from './screens/TryOn';
import { Stats } from './screens/Stats';
import './styles.css';
import './pocket.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/setup" element={<BodyPhoto />} />
          <Route path="/wardrobe" element={<DressingRoom />} />
          <Route path="/try-on" element={<TryOn />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppStateProvider>
  </StrictMode>,
);
