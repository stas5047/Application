import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { setupAxiosInterceptors } from './lib/setupAxiosInterceptors';
import { useAuthStore } from './store/auth.store';

// 1. Setup interceptors BEFORE hydrate — pass getState so interceptors always read current state (ADR-F001)
setupAxiosInterceptors(useAuthStore.getState);

// 2. Fire hydrate non-blocking — App gates on isHydrated flag
void useAuthStore.getState().hydrate();

// 3. Render immediately
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
