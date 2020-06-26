import { changeLibrary } from './web3Slice';
import { take, all, call, fork, cancel, cancelled, setContext } from 'redux-saga/effects';

/**
 * Runs sagas whose context depends upon the `library` object set by web3-react.
 * Since this object is non-serializable, we shouldn't hold it in the store or pass it around
 * in action payload.
 *
 * Because web3-react API is React-centric, is hard to get hold of its values.
 * We created a special action type `web3/changeLibrary`, which will be triggered whenever
 * web3-react `library` value changes.
 *
 * This function will create a saga which will watch for `web3/changeLibrary` events
 * and will spawn all `sagas` after setting their context with the return of `createContext`.
 *
 * Whenever a new `web3/changeLibrary` action is dispatched, all `sagas` registered here will
 * be cancelled and re-spawn again with the updated context.
 *
 * The returned saga SHOULD be exported in the consuming slice to be picked up by the root saga.
 *
 * @param {Generator[]} sagas an array of generator functions which should be aware of the context.
 * Usually these are the "watcher" sagas, which will watch for incomming actions, that is,
 * those ones with `takeLatest`, `takeEvery` or `debounce` in their body. Since those sagas
 * usually `fork` the "worker" sagas, the context will be available for them too.
 *
 * @param {object} options to config
 * @param {({ library: any }) => ({ [prop]: any })} [options.createContext]
 * @returns Generator
 */
export function watchAll(sagas, { createContext = ({ library }) => ({ library }) } = {}) {
  return function* watchChangeLibrary() {
    let tasks = [];

    while (true) {
      const action = yield take(`${changeLibrary}`);
      const { library } = action.payload;

      if (tasks) {
        yield cancel(tasks);
      }

      if (!library) {
        tasks = [];
        continue;
      }

      const context = yield call(createContext, { library });
      yield setContext(context);

      tasks = yield all(
        sagas.map(saga =>
          fork(function* sagaWrapper() {
            let isCancelled = false;

            while (!isCancelled) {
              try {
                yield call(saga);
              } catch (err) {
                console.warn('Error in saga:', err);
              } finally {
                if (yield cancelled()) {
                  console.info('Cancelling saga:', saga.name);
                  isCancelled = true;
                }
              }
            }
          })
        )
      );
    }
  };
}

/**
 * Runs a saga whose context depends upon the `library` object set by web3-react.
 * Here `saga` will run **at most once** per page load.
 *
 * Since this object is non-serializable, we shouldn't hold it in the store or pass it around
 * in action payload.
 *
 * Because web3-react API is React-centric, is hard to get hold of its values.
 * We created a special action type `web3/changeLibrary`, which will be triggered whenever
 * web3-react `library` value changes.
 *
 * This function will create a saga which will watch for `web3/changeLibrary` events
 * and will spawn all `sagas` after setting their context with the return of `createContext`.
 *
 * When `web3/changeLibrary` action is dispatched, it checks if `library` is set.
 * If `library` is set, it will run `saga` and halt after it returns.
 * Otherwise, it will wait for the next `web3/changeLibrary` and `saga` will NOT be called.
 *
 * @param {Generator} saga a generator function which should be aware of the context.
 * Usually this is a saga, which will perform a cleanup or hook into persisted data
 * that need update after the page loads.
 *
 * @param {object} options to config
 * @param {any[]} [options.args] arguments to be passed to `saga` upon call.
 * @param {({ library: any }) => ({ [prop]: any })} [options.createContext]
 * @returns Generator
 */
export function runOnceWhenReady(saga, { args = [], createContext = ({ library }) => ({ library }) } = {}) {
  return function* watchChangeLibrary() {
    while (true) {
      const action = yield take(`${changeLibrary}`);
      const { library } = action.payload;

      if (!library) {
        continue;
      }

      const context = yield call(createContext, { library });
      yield setContext(context);

      yield call(saga, ...args);
      return;
    }
  };
}
