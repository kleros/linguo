import { createAction, createSlice } from '@reduxjs/toolkit';
import { goBack, push } from 'connected-react-router';
import { normalize } from 'normalizr';
import { put } from 'redux-saga/effects';
import * as r from '~/app/routes';
import createWatcherSaga from '~/features/shared/createWatcherSaga';
import { NotificationLevel, notify } from '~/features/ui/notificationSlice';
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

  yield put(
    notify({
      key: `${saveSettings}/success`,
      level: NotificationLevel.success,
      message: "You've updated your language skills settings!",
      duration: 10,
    })
  );

  yield put(push(r.TRANSLATOR_DASHBOARD));
}

export function* cancelSaveSettingsSaga() {
  yield put(goBack());
}

export const sagas = {
  watchSaveSettings: createWatcherSaga(saveSettingsSaga, saveSettings),
  watchCancelSaveSettings: createWatcherSaga(cancelSaveSettingsSaga, cancelSaveSettings),
};
