import { createAction } from '@reduxjs/toolkit';
import { curry } from './fp';

/**
 * Create async actions consisting of
 * @param {string} baseType
 * @param {PrepareOptions} prepare
 * @return AsyncAction
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
 *
 * @param {any[]} actionCreators
 * @param {'pending'|'fulfilled'|'rejected'} type
 * @param {AnyAction} action
 * @return {boolean}
 */
function _matchAnyAsyncType(actionCreators, type, action) {
  return actionCreators.some(asyncActionCreator =>
    typeof asyncActionCreator?.[type]?.match === 'function' ? asyncActionCreator?.[type]?.match(action) : false
  );
}

export const matchAnyAsyncType = curry(_matchAnyAsyncType);

/**
 * @typedef {Function} AsyncAction
 * @prop {any} pending
 * @prop {any} fulfilled
 * @prop {any} rejected

/**
 * @function
 *
 * @param {any} payload
 * @param {object} rest
 * @returns {ActionWithPayload}
 */
const defaultPrepare = (payload, rest = {}) => ({ payload, ...rest });

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
