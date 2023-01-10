import { useState } from 'react';

const useLocalStorage = (key, defaultValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (err) {
      return defaultValue;
    }
  });

  const setStoreValue = newValue => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } finally {
      setStoredValue(newValue);
    }
  };

  return [storedValue, setStoreValue];
};

export default useLocalStorage;
