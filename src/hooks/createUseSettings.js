import { useLocalStorage } from '@rehooks/local-storage';

export default function createUseSettings(prefix) {
  return function useSettings({ key, initialValue }) {
    const [storedSettings, setStoredSettings] = useLocalStorage(`${prefix}/${key}`, initialValue);

    return [storedSettings, setStoredSettings];
  };
}
