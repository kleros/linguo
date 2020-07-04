import { createAction, createSlice } from '@reduxjs/toolkit';
import { goBack, push } from 'connected-react-router';
import { put } from 'redux-saga/effects';
import * as r from '~/app/routes';
import createWatcherSaga, { TakeType } from '~/features/shared/createWatcherSaga';
import { NotificationLevel, notify } from '~/features/ui/notificationSlice';
import { groupBy, map, prop } from '~/features/shared/fp';

export const initialState = {
  ids: [],
  entities: {},
};

const translatorSkillsSlice = createSlice({
  name: 'translator/skills',
  initialState,
  reducers: {
    updateSkills(state, action) {
      const skills = action.payload?.skills ?? [];

      const getLanguage = prop('language');
      state.entities = groupBy(getLanguage, skills);
      state.ids = map(getLanguage, skills);
    },
    clearSkills() {
      return initialState;
    },
  },
});

export default translatorSkillsSlice.reducer;

const { updateSkills, clearSkills } = translatorSkillsSlice.actions;
const saveSkills = createAction('translator/skills/save');
const cancelSaveSkills = createAction('translator/skills/cancelSave');

export const actions = {
  updateSkills,
  clearSkills,
  saveSkills,
  cancelSaveSkills,
};

const selectAllSkillLanguages = state => state.ids ?? [];
const selectAllSkills = state => selectAllSkillLanguages(state).map(language => state.entities[language]);

export const selectors = {
  selectAllSkillLanguages,
  selectAllSkills,
};

function* saveSettingsSaga(action) {
  yield put(updateSkills(action.payload));

  yield put(
    notify({
      key: `${saveSkills}/success`,
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
  watchSaveSettings: createWatcherSaga({ takeType: TakeType.every }, saveSettingsSaga, saveSkills.type),
  watchCancelSaveSettings: createWatcherSaga(
    { takeType: TakeType.every },
    cancelSaveSettingsSaga,
    cancelSaveSkills.type
  ),
};
