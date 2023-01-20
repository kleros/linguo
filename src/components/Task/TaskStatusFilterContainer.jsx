import React from 'react';
import TaskStatusFilter from './TaskStatusFilter';
import { useTasksFilter } from '~/context/TasksFilterProvider';

const TaskStatusFilterContainer = () => {
  const {
    filters: { status, allTasks },
    updateFilters,
  } = useTasksFilter();

  const handleFilterChange = React.useCallback(
    value => {
      updateFilters({ status: value, allTasks });
    },
    [updateFilters, allTasks]
  );

  return <TaskStatusFilter fullWidth value={status} onChange={handleFilterChange} />;
};

export default TaskStatusFilterContainer;
