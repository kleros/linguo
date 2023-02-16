import { useEffect, useState } from 'react';
import { useWeb3 } from './useWeb3';

export const useBalance = () => {
  const { account, library: provider } = useWeb3();
  const [balance, setBalance] = useState();
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const getBalance = async () => {
      setStatus('pending');
      try {
        if (account) {
          const value = await provider.getBalance(account);
          setBalance(value.toString());
          setStatus('succeeded');
        }
      } catch (error) {
        console.warn('Failed to get the account balance:', error);
        setStatus('failed');
      }
    };
    getBalance();
  }, [account, provider, setStatus]);
  return { balance, status };
};
