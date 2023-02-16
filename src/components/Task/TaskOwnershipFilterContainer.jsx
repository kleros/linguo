import React from 'react';
import TaskOwnershipFilter from '~/components/Task/TaskOwnershipFilter';
import { useTasksFilter } from '~/context/TasksFilterProvider';
import { useWeb3 } from '~/hooks/useWeb3';
import { statusFilters } from '~/consts/statusFilters';

const TaskOwnershipFilterContainer = () => {
  const { account } = useWeb3();
  const {
    filters: { status, allTasks },
    updateFilters,
  } = useTasksFilter();

  const handleFilterChange = React.useCallback(
    value => {
      updateFilters({ status, allTasks: value });
    },
    [status, updateFilters]
  );

  const shouldDisplay = account && status !== statusFilters.open;

  return shouldDisplay ? <TaskOwnershipFilter fullWidth value={allTasks} onChange={handleFilterChange} /> : null;
};

export default TaskOwnershipFilterContainer;
