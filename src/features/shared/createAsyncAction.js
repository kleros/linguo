import { createAction } from '@reduxjs/toolkit';

export default function createAsyncAction(name, prepare = {}) {
  const preparePending = prepare.pending ?? defaultPrepare;
  const prepareFulfilled = prepare.fulfilled ?? defaultPrepare;
  const prepareRejected = prepare.rejected ?? defaultPrepare;

  const action = createAction(`${name}/pending`, preparePending);

  return Object.assign(action, {
    pending: action,
    fulfilled: createAction(`${name}/fulfilled`, prepareFulfilled),
    rejected: createAction(`${name}/rejected`, prepareRejected),
  });
}

const defaultPrepare = (payload, meta = {}) => ({ payload, meta });
