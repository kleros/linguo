import AppContext from '../AppContext';
import { useWeb3React } from '~/features/web3';
import createHooks from './createHooks';

import * as Task from './entities/Task';
import * as Dispute from './entities/Dispute';

export { Task, Dispute };

export { default as TaskStatus } from './entities/TaskStatus';
export { default as TaskParty } from './entities/TaskParty';
export { default as DisputeStatus } from './entities/DisputeStatus';
export { default as DisputeRuling } from './entities/DisputeRuling';
export { default as AppealSide } from './entities/AppealSide';
export { default as createHooks } from './createHooks';
export { default as getFileUrl } from './getFileUrl';

export const { useCreateLinguoApiInstance, useLinguo, useCacheCall } = createHooks({ AppContext, useWeb3React });
