"use client";
import { useEffect } from 'react';

function shouldReload(message) {
  if (typeof message !== 'string') return false;
  return (
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError') ||
    message.includes('Failed to fetch dynamically imported module')
  );
}

export default function ChunkErrorRecovery() {
  useEffect(() => {
    let reloaded = false;

    const reloadOnce = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    const onError = (event) => {
      if (shouldReload(event.message)) reloadOnce();
    };

    const onRejection = (event) => {
      const message = event.reason?.message || String(event.reason || '');
      if (shouldReload(message)) reloadOnce();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
