import { combineReducers } from '@reduxjs/toolkit';
import skillsReducer, * as skills from './translatorSkillsSlice';
import tasksReducer, * as tasks from './translatorTasksSlice';
import { selectAllFilterByIds } from '~/features/tasks/tasksSlice';
import { mapValues } from '~/features/shared/fp';

export default combineReducers({
  skills: skillsReducer,
  tasks: tasksReducer,
});

export const { updateSkills, clearSkills, saveSettings, cancelSaveSettings } = skills.actions;
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
