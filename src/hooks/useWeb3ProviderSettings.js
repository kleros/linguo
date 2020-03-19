import { useLocalStorage } from '@rehooks/local-storage';

const defaultInitialValues = {
  allowEagerConnection: false,
};

export default function useTranslatorSettings() {
  const [storedValues, setStoredValues] = useLocalStorage('@@linguo/settings/web3-provider', defaultInitialValues);

  return [storedValues, setStoredValues];
}
