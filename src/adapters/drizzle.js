import { drizzleReactHooks } from '@drizzle/react-plugin';

const { DrizzleProvider, Initializer, useDrizzleState, useDrizzle } = drizzleReactHooks;

export { DrizzleProvider, Initializer, useDrizzleState, useDrizzle };

export const useAccount = () => {
  return useDrizzleState(({ accounts }) => {
    return accounts[0];
  });
};

export const useAccountBalance = account => {
  return useDrizzleState(({ accountBalances }) => {
    return accountBalances[account] || '0';
  });
};
