import { createSlice, createAction } from '@reduxjs/toolkit';
import { ids, put } from 'redux-saga/effects';
import { push, goBack } from 'connected-react-router';
import { normalize } from 'normalizr';
import * as r from '~/app/routes';
import { notify, NotificationLevel } from '~/features/ui/notificationSlice';
import createWatchSaga from '~/features/shared/createWatchSaga';
import * as schemas from './schemas';

const initialState = {
  skills: {
    ids: [],
    entities: {},
  },
};

const translatorSlice = createSlice({
  name: 'translator',
  initialState,
  reducers: {
    updateSkills(state, action) {
      const { entities, result } = normalize(action.payload, [schemas.skill]);
      state.skills.entities = entities.skill;
      state.skills.ids = result;
    },
    clearSkills(state, _) {
      state.skills = initialState.skills;
    },
  },
});

export default translatorSlice.reducer;

export const { updateSkills, clearSkills } = translatorSlice.actions;
export const saveSettings = createAction('translator/saveSettings');
export const cancelSaveSettings = createAction('translator/cancelSaveSettings');

export const selectAllSkillLanguages = state => state.translator.skills.ids;
export const selectAllSkills = state =>
  selectAllSkillLanguages(state).map(language => state.translator.skills.entities[language]);

export function* saveSettingsSaga(action) {
  yield put(updateSkills(action.payload.skills));

  yield ids([
    put(
      notify({
        key: `${saveSettings}/success`,
        level: NotificationLevel.success,
        message: "You've updated your language skills settings!",
        duration: 10,
      })
    ),
    put(push(r.TRANSLATOR_DASHBOARD)),
  ]);
}

export function* cancelSaveSettingsSaga() {
  yield put(goBack());
}

export const sagas = {
  watchSaveSettings: createWatchSaga(saveSettingsSaga, saveSettings),
  watchCancelSaveSettings: createWatchSaga(cancelSaveSettingsSaga, cancelSaveSettings),
};
