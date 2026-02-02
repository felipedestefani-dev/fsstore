import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored == null) return initialValue;
      if (typeof initialValue === 'number') return parseFloat(stored) || initialValue;
      if (Array.isArray(initialValue) || (typeof initialValue === 'object' && initialValue !== null)) {
        return JSON.parse(stored);
      }
      return stored;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (value === undefined) return;
    try {
      if (typeof value === 'object' && value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, String(value));
      }
    } catch (e) {
      console.warn('useLocalStorage save failed', e);
    }
  }, [key, value]);

  return [value, setValue];
}
