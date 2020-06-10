import createUseSettings from '~/hooks/createUseSettings';

export const WEB3_PROVIDER = {
  key: 'web3-provider',
  initialValue: {
    allowEagerConnection: false,
    connectorName: undefined,
  },
};

export const useSettings = createUseSettings('@@linguo/settings');
