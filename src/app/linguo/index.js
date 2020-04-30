import AppContext from '../AppContext';
import { useWeb3React } from '../web3React';
import createHooks from './createHooks';

import * as Task from './entities/Task';
export { Task };

export { default as TaskStatus } from './entities/TaskStatus';
export { default as TaskParty } from './entities/TaskParty';
export { default as createHooks } from './createHooks';
export { getFileUrl } from './createApi';
export { default as getFilter, filters } from './filters';
export { default as getComparator } from './sorting';

export const { useCreateLinguoApiInstance, useLinguo, useCacheCall } = createHooks({ AppContext, useWeb3React });
