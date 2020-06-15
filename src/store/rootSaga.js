import { all, call, spawn } from 'redux-saga/effects';
import { sagas as translatorSagas } from '~/features/translator/translatorSlice';
import { sagas as uiSagas } from '~/features/ui/uiSlice';
import { sagas as web3Sagas } from '~/features/web3/web3Slice';
import { sagas as tokensSagas } from '~/features/tokens/tokensSlice';
import { sagas as transactionsSagas } from '~/features/transactions/transactionsSlice';

export default function* rootSaga() {
  const sagas = [
    ...Object.values(translatorSagas),
    ...Object.values(uiSagas),
    ...Object.values(web3Sagas),
    ...Object.values(tokensSagas),
    ...Object.values(transactionsSagas),
  ];

  yield all(
    sagas.map(saga =>
      spawn(function* sagaWrapper() {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (err) {
            console.warn(`Error in saga ${saga.name}:`, err);
          }
        }
      })
    )
  );
}
