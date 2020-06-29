import { createAction, createSlice } from '@reduxjs/toolkit';
import { goBack, push } from 'connected-react-router';
import { normalize } from 'normalizr';
import { put } from 'redux-saga/effects';
import * as r from '~/app/routes';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { NotificationLevel, notify } from '~/features/ui/notificationSlice';
import * as schemas from './schemas';

export const initialState = {
  ids: [],
  entities: {},
};

const translatorSkillsSlice = createSlice({
  name: 'translator',
  initialState,
  reducers: {
    updateSkills(state, action) {
      const { entities, result } = normalize(action.payload, [schemas.skill]);
      state.entities = entities.skill;
      state.ids = result;
    },
    clearSkills() {
      return initialState;
    },
  },
});

export default translatorSkillsSlice.reducer;

const { updateSkills, clearSkills } = translatorSkillsSlice.actions;
const saveSettings = createAction('translator/saveSettings');
const cancelSaveSettings = createAction('translator/cancelSaveSettings');

export const actions = {
  updateSkills,
  clearSkills,
  saveSettings,
  cancelSaveSettings,
};

const selectAllSkillLanguages = state => state.ids;
const selectAllSkills = state => selectAllSkillLanguages(state).map(language => state.entities[language]);

export const selectors = {
  selectAllSkillLanguages,
  selectAllSkills,
};

function* saveSettingsSaga(action) {
  yield put(updateSkills(action.payload));

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

function* cancelSaveSettingsSaga() {
  yield put(goBack());
}

export const sagas = {
  watchSaveSettings: createWatcherSaga({ takeType: TakeType.every }, saveSettingsSaga, saveSettings.type),
  watchCancelSaveSettings: createWatcherSaga(
    { takeType: TakeType.every },
    cancelSaveSettingsSaga,
    cancelSaveSettings.type
  ),
};
