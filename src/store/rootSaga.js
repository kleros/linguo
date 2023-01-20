import { all, call, spawn } from 'redux-saga/effects';
import { sagas as commentsSagas } from '~/features/comments/commentsSlice';
import { sagas as userSettingsSagas } from '~/features/users/userSettingsSlice';
import { sagas as tokensSagas } from '~/features/tokens/tokensSlice';
import { sagas as transactionsSagas } from '~/features/transactions/transactionsSlice';
import { sagas as uiSagas } from '~/features/ui/uiSlice';
import { sagas as web3Sagas } from '~/features/web3/web3Slice';

export default function* rootSaga() {
  const sagas = [
    ...Object.values(commentsSagas),
    ...Object.values(tokensSagas),
    ...Object.values(transactionsSagas),
    ...Object.values(uiSagas),
    ...Object.values(userSettingsSagas),
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
