import { useCallback } from 'react';
import { useLocalStorage } from '@rehooks/local-storage';

const defaultInitialValues = {
  languages: [],
};

export default function useTranslatorSettings() {
  const [storedValues, setStoredValues] = useLocalStorage('@@linguo/settings/translator', defaultInitialValues);

  const updateStoredValues = useCallback(
    payload =>
      setStoredValues(storedValues => ({
        ...storedValues,
        ...payload,
      })),
    [setStoredValues]
  );

  return [storedValues, updateStoredValues];
}
