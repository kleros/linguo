import { createAction } from '@reduxjs/toolkit';

/**
 * @param {string} baseType
 * @param {PrepareOptions} prepare
 */
export default function createAsyncAction(baseType, prepare = {}) {
  const preparePending = prepare.pending ?? defaultPrepare;
  const prepareFulfilled = prepare.fulfilled ?? defaultPrepare;
  const prepareRejected = prepare.rejected ?? defaultPrepare;

  const action = createAction(`${baseType}/pending`, preparePending);

  return Object.assign(action, {
    pending: action,
    fulfilled: createAction(`${baseType}/fulfilled`, prepareFulfilled),
    rejected: createAction(`${baseType}/rejected`, prepareRejected),
  });
}

/**
 * @function
 *
 * @param {any} payload
 * @param {object} meta
 * @returns {ActionWithPayload}
 */
const defaultPrepare = (payload, meta = {}) => ({ payload, meta });

/**
 * @typedef {object} ActionWithPayload
 * @prop {object} payload
 * @prop {object=} meta
 * @prop {boolean=} error
 */

/**
 * @callback PrepareAction
 * @param {...any} args
 * @return {ActionWithPayload}
 */

/**
 * @typedef {object} PrepareOptions
 * @prop {PrepareAction=} pending
 * @prop {PrepareAction=} fulfilled
 * @prop {PrepareAction=} rejected
 */
