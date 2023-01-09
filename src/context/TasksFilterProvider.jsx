import React, { useState, createContext, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router';
import PropTypes from 'prop-types';

const TasksFilterContext = createContext({
  statusFilter: 'all',
  allTasksFilter: true,
});

export const TasksFilterProvider = ({ children }) => {
  const location = useLocation();
  const history = useHistory();

  const queryParams = new URLSearchParams(location.search);
  const [statusFilter, setStatusFilter] = useState(queryParams.get('status') || '');
  const [allTasksFilter, setAllTasksFilter] = useState(queryParams.get('allTasks') === 'true');

  useEffect(() => {
    const search = new URLSearchParams({
      status: statusFilter,
      allTasks: allTasksFilter,
    });
    history.replace({ search: search.toString() });
  }, [history, statusFilter, allTasksFilter]);

  const filters = {
    status: statusFilter,
    allTasks: allTasksFilter,
  };

  const setFilters = newFilters => {
    setStatusFilter(newFilters.status || '');
    setAllTasksFilter(newFilters.allTasks || false);
  };

  return <TasksFilterContext.Provider value={(filters, setFilters)}>{children}</TasksFilterContext.Provider>;
};

export const useTasksFilter = () => {
  const context = useContext(TasksFilterContext);
  if (context === undefined) {
    throw new Error('useTasksFilter must be used within a TasksFilterProvider');
  }
  return context;
};

TasksFilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const statusFilters = {
  all: 'all',
  open: 'open',
  inProgress: 'inProgress',
  inReview: 'inReview',
  inDispute: 'inDispute',
  finished: 'finished',
  incomplete: 'incomplete',
};

export const getStatusFilter = filterName => {
  return statusFilters[filterName] ?? statusFilters.all;
};
