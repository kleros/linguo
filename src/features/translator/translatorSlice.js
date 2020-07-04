import { combineReducers } from '@reduxjs/toolkit';
import { mapValues } from '~/shared/fp';
import { selectAllFilterByIds } from '~/features/tasks/tasksSlice';
import skillsReducer, * as skills from './translatorSkillsSlice';
import tasksReducer, * as tasks from './translatorTasksSlice';

export default combineReducers({
  skills: skillsReducer,
  tasks: tasksReducer,
});

export const { updateSkills, clearSkills, saveSkills, cancelSaveSkills } = skills.actions;
export const { fetchTasks } = tasks.actions;

export const { selectAllSkillLanguages, selectAllSkills } = mapValues(
  selector => state => selector(state.translator.skills),
  skills.selectors
);

export const { selectIsIdle, selectIsLoading, selectHasSucceeded, selectHasFailed, selectTaskIds } = mapValues(
  selector => account => state => selector(account)(state.translator.tasks),
  tasks.selectors
);

export const selectTasks = account => state => {
  const taskIds = selectTaskIds(account)(state);
  return selectAllFilterByIds(taskIds)(state);
};

export const sagas = {
  ...skills.sagas,
  ...tasks.sagas,
};
