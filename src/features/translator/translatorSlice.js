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
import { getFilter, getFilterPredicate, getSecondLevelFilter, getSecondLevelFilterPredicate } from './taskFilters';
import { getComparator } from './taskSorting';
import tasksReducer, * as tasks from './tasksSlice';
import { createSkillsTaskMatcher } from './skillsMatchTask';

const PERSISTANCE_KEY = 'translator';

function createPersistedReducer(reducer) {
  const persistConfig = {
    key: PERSISTANCE_KEY,
    storage,
    version: 0,
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
  selectFilter,
  selectSecondLevelFilter,
  selectSecondLevelFilterForFilter,
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
    (_, { filter }) => filter,
    (_, { secondLevelFilter }) => secondLevelFilter,
    (_, { account }) => account,
    (_, { skills }) => skills,
  ],
  (tasks, filter, secondLevelFilter, account, skills) =>
    compose(
      sort(getComparator(filter, { account, skills })),
      arrayFilter(getSecondLevelFilterPredicate(filter, secondLevelFilter, { account })),
      arrayFilter(getFilterPredicate(filter, { skills }))
    )(tasks)
);

export const selectTaskCountForFilter = createSelector(
  [selectTasksForFilter, (_, { skills }) => createSkillsTaskMatcher(skills)],
  (_tasks, skillsMatch) => arrayFilter(skillsMatch, _tasks).length
);

export const selectTasksForCurrentFilter = createSelector(
  [state => state, (_, { account }) => account, (_, { skills }) => skills, selectFilter, selectSecondLevelFilter],
  (state, account, skills, filter, secondLevelFilter) =>
    selectTasksForFilter(state, { account, skills, filter, secondLevelFilter })
);

export function* onFilterChangeSaga(action) {
  const filterFromAction = action.payload?.filter;
  const secondLevelFilterFromAction = action.payload?.secondLevelFilter;
  const additionalParams = action.payload?.additionalParams ?? {};

  const filter = getFilter(filterFromAction);

  const secondLevelFilterFromStore = yield select(state => selectSecondLevelFilterForFilter(state, { filter }));

  const secondLevelFilter = getSecondLevelFilter(filter, secondLevelFilterFromAction ?? secondLevelFilterFromStore);

  const secondLevelFilterMixin = secondLevelFilter ? { secondLevelFilter } : {};

  const search = new URLSearchParams({
    filter: filter,
    ...secondLevelFilterMixin,
    ...additionalParams,
  });

  const currentFilter = yield select(selectFilter);
  const routerAction = filter === currentFilter ? replace : push;

  yield put(routerAction({ search: search.toString() }));
}

export const sagas = {
  ...skills.sagas,
  ...tasks.sagas,
  watchSetFilterSaga: createWatcherSaga({ takeType: TakeType.every }, onFilterChangeSaga, setFilters),
};
