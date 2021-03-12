import { combineReducers, createSelector } from '@reduxjs/toolkit';
import { push, replace } from 'connected-react-router';
import { persistReducer, createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { put, select } from 'redux-saga/effects';
import { selectAllFilterByIds } from '~/features/tasks/tasksSlice';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { compose, filter as arrayFilter, mapValues, sort } from '~/shared/fp';
import migrations from './migrations';
import skillsReducer, * as skills from './skillsSlice';
import { getStatusFilter, getStatusFilterPredicate, getAllTasksFilterPredicate } from './taskFilters';
import { getComparator } from './taskSorting';
import tasksReducer, * as tasks from './tasksSlice';
import { createSkillsTaskMatcher } from './skillsMatchTask';

const PERSISTANCE_KEY = 'translator';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 1,
    migrate: createMigrate(migrations, { debug: process.env.NODE_ENV !== 'production' }),
    blacklist: [],
  };

  return persistReducer(persistConfig, reducer);
}

export default createPersistedReducer(
  combineReducers({
    skills: skillsReducer,
    tasks: tasksReducer,
  })
);

export const { updateSkills, clearSkills, saveSkills, cancelSaveSkills } = skills.actions;
export const { fetchTasks, setFilters } = tasks.actions;

export const { selectAllSkillLanguages, selectAllSkills } = mapValues(
  selector => state => selector(state.translator.skills),
  skills.selectors
);

export const {
  selectStatusFilter,
  selectAllTasksFilter,
  selectIsIdle,
  selectIsLoading,
  selectHasSucceeded,
  selectHasFailed,
  selectTaskIds,
} = mapValues(selector => (state, ...rest) => selector(state.translator.tasks, ...rest), tasks.selectors);

export const selectAllTasks = (state, { account }) => {
  const taskIds = selectTaskIds(state, { account });
  return selectAllFilterByIds(taskIds)(state);
};

export const selectTasksForFilter = createSelector(
  [
    selectAllTasks,
    (_, { status }) => status,
    (_, { allTasks }) => allTasks,
    (_, { account }) => account,
    (_, { skills }) => skills,
  ],
  (tasks, status, allTasks, account, skills) =>
    compose(
      sort(getComparator(status, { account, skills })),
      arrayFilter(getAllTasksFilterPredicate(allTasks, { status, account })),
      arrayFilter(getStatusFilterPredicate(status, { skills }))
    )(tasks)
);

export const selectTaskCountForFilter = createSelector(
  [selectTasksForFilter, (_, { skills }) => createSkillsTaskMatcher(skills)],
  (_tasks, skillsMatch) => arrayFilter(skillsMatch, _tasks).length
);

export const selectTasksForCurrentFilter = createSelector(
  [state => state, (_, { account }) => account, (_, { skills }) => skills, selectStatusFilter, selectAllTasksFilter],
  (state, account, skills, status, allTasks) => selectTasksForFilter(state, { account, skills, status, allTasks })
);

export function* onFilterChangeSaga(action) {
  const statusFilterFromAction = action.payload?.status;
  const allTasksFilterFromAction = action.payload?.allTasks;
  const additionalParams = action.payload?.additionalParams ?? {};

  const statusFilter = getStatusFilter(statusFilterFromAction);

  const allTasksFilterFromStore = yield select(tasks.selectAllTasksFilter);
  const allTasksFilter = allTasksFilterFromAction ?? allTasksFilterFromStore;

  const allTasksFilterMixin = allTasksFilter ? { allTasks: allTasksFilter } : {};

  const search = new URLSearchParams({
    status: statusFilter,
    ...allTasksFilterMixin,
    ...additionalParams,
  });

  const currentFilter = yield select(selectStatusFilter);
  const routerAction = statusFilter === currentFilter ? replace : push;

  yield put(routerAction({ search: search.toString() }));
}

export const sagas = {
  ...skills.sagas,
  ...tasks.sagas,
  watchSetFilterSaga: createWatcherSaga({ takeType: TakeType.every }, onFilterChangeSaga, setFilters),
};
