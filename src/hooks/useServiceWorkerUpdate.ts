import { useState, useEffect, useCallback } from 'react';

const VERSION_CHECK_INTERVAL = 30000; // Check every 30 seconds
const VERSION_KEY = 'app_build_version';

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const applyUpdate = useCallback(async () => {
    // Store the latest version so we don't show again until next publish
    try {
      const r = await fetch('/version.json?t=' + Date.now());
      const data = await r.json();
      localStorage.setItem(VERSION_KEY, data.version);
    } catch {}

    // Tell SW to skip waiting
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }

    window.location.reload();
  }, []);

  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        if (!response.ok) return;
        const data = await response.json();
        const currentVersion = localStorage.getItem(VERSION_KEY);

        if (currentVersion && currentVersion !== data.version) {
          setUpdateAvailable(true);
        } else if (!currentVersion) {
          // First visit — just store the version
          localStorage.setItem(VERSION_KEY, data.version);
        }
      } catch {
        // Offline or error, ignore
      }
    };

    // Check immediately
    checkForUpdate();

    // Then poll periodically
    const interval = setInterval(checkForUpdate, VERSION_CHECK_INTERVAL);

    // Also listen for SW updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          setUpdateAvailable(true);
        }
      });

      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        if (reg.waiting) {
          setUpdateAvailable(true);
          return;
        }
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      });
    }

    return () => clearInterval(interval);
  }, []);

  return { updateAvailable, applyUpdate };
};
