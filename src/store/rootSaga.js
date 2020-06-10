import { all, call, spawn } from 'redux-saga/effects';
import { sagas as translatorSagas } from '~/features/translator/translatorSlice';
import { sagas as uiSagas } from '~/features/ui/uiSlice';
import { sagas as web3Sagas } from '~/features/web3/web3Slice';

export default function* rootSaga() {
  const sagas = {
    ...translatorSagas,
    ...uiSagas,
    ...web3Sagas,
  };

  yield all(
    Object.values(sagas).map(saga =>
      spawn(function* sagaWrapper() {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (err) {
            console.log(err);
          }
        }
      })
    )
  );
}
