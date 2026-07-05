import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA with version update checking
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js?v=2.0')
      .then((registration) => {
        console.log('[PWA] ServiceWorker v2.0 registered with scope: ', registration.scope);
        // Force update check on every page visit to guarantee new PWA icons & shell are fetched
        registration.update();

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] New icon/shell updated; refreshing client...');
                  window.location.reload();
                }
              }
            };
          }
        };
      })
      .catch((err) => {
        console.log('[PWA] ServiceWorker registration failed: ', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
