import { all, call, spawn } from 'redux-saga/effects';
import { sagas as disputesSagas } from '~/features/disputes/disputesSlice';
import { sagas as evidencesSagas } from '~/features/evidences/evidencesSlice';
import { sagas as requesterSagas } from '~/features/requester/requesterSlice';
import { sagas as tasksSagas } from '~/features/tasks/tasksSlice';
import { sagas as tokensSagas } from '~/features/tokens/tokensSlice';
import { sagas as transactionsSagas } from '~/features/transactions/transactionsSlice';
import { sagas as translatorSagas } from '~/features/translator/translatorSlice';
import { sagas as uiSagas } from '~/features/ui/uiSlice';
import { sagas as web3Sagas } from '~/features/web3/web3Slice';

export default function* rootSaga() {
  const sagas = [
    ...Object.values(disputesSagas),
    ...Object.values(evidencesSagas),
    ...Object.values(requesterSagas),
    ...Object.values(tasksSagas),
    ...Object.values(tokensSagas),
    ...Object.values(transactionsSagas),
    ...Object.values(translatorSagas),
    ...Object.values(uiSagas),
    ...Object.values(web3Sagas),
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
