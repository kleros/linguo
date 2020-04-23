import { createHooks } from '~/api/linguo';
import AppContext from './AppContext';
import { useWeb3React } from './web3React';

export const { useCreateLinguoApiInstance, useLinguo } = createHooks({ AppContext, useWeb3React });
