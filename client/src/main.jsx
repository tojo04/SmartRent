import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <App />
    </Suspense>
  </StrictMode>
);
