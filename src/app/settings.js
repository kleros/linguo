import createUseSettings from '~/hooks/createUseSettings';

export const TRANSLATOR = {
  key: 'translator',
  initialValue: {
    languages: [],
  },
};

export const WEB3_PROVIDER = {
  key: 'web3-provider',
  initialValue: {
    allowEagerConnection: false,
    connectorName: undefined,
  },
};

export const useSettings = createUseSettings('@@linguo/settings');
