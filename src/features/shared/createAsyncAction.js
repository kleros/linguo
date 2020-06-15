import { createAction } from '@reduxjs/toolkit';

export default function createAsyncAction(name, prepare = {}) {
  const prepareWrapper = prepare.wrapper ?? defaultPrepare;
  const preparePending = prepare.pending ?? defaultPrepare;
  const prepareFulfilled = prepare.fulfilled ?? defaultPrepare;
  const prepareRejected = prepare.rejected ?? defaultPrepare;

  return Object.assign(createAction(name, prepareWrapper), {
    pending: createAction(`${name}/pending`, preparePending),
    fulfilled: createAction(`${name}/fulfilled`, prepareFulfilled),
    rejected: createAction(`${name}/rejected`, prepareRejected),
  });
}

const defaultPrepare = payload => ({ payload });
