import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';
import PropTypes from 'prop-types';

const TasksFilterContext = createContext();

export const TasksFilterProvider = ({ children }) => {
  const location = useLocation();
  const history = useHistory();

  const queryParams = new URLSearchParams(location.search);
  const [statusFilter, setStatusFilter] = useState(queryParams.get('status') || 'open');
  const [allTasksFilter, setAllTasksFilter] = useState(queryParams.get('status') === 'open');

  useEffect(() => {
    const search = new URLSearchParams({
      status: statusFilter,
      allTasks: allTasksFilter,
    });
    history.replace({ search: search.toString() });
  }, [history, statusFilter, allTasksFilter]);

  const filters = useMemo(() => {
    return {
      status: statusFilter,
      allTasks: allTasksFilter,
    };
  }, [allTasksFilter, statusFilter]);

  const updateFilters = newFilters => {
    const { status, allTasks } = newFilters;
    setStatusFilter(status || 'open');
    setAllTasksFilter(status === 'open' ? true : allTasks);
  };

  const value = useMemo(() => {
    return { filters, updateFilters };
  }, [filters]);

  return <TasksFilterContext.Provider value={value}>{children}</TasksFilterContext.Provider>;
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
