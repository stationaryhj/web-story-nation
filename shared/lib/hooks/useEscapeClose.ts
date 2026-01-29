import { useEffect } from 'react';

interface UseEscapeCloseOptions {
  enabled: boolean;
  onEscape: () => void;
}

export function useEscapeClose({ enabled, onEscape }: UseEscapeCloseOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEscape]);
}
