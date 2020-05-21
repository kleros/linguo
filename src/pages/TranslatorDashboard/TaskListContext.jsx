import React from 'react';
import t from 'prop-types';

const initialValue = Object.defineProperty([], 'byID', { value: () => {} });

const TaskListContext = React.createContext(initialValue);

export default TaskListContext;

export function useTask({ ID }) {
  const taskList = React.useContext(TaskListContext);

  return taskList.byID(ID);
}

export function TaskListProvider({ taskList, children }) {
  const taskListWithIndexing = React.useMemo(() => {
    const indexedById = taskList.reduce(
      (acc, task) =>
        Object.assign(acc, {
          [task.ID]: task,
        }),
      {}
    );

    return Object.defineProperty([...taskList], 'byID', {
      enumerable: false,
      value: ID => indexedById[ID],
    });
  }, [taskList]);

  return <TaskListContext.Provider value={taskListWithIndexing}>{children}</TaskListContext.Provider>;
}

TaskListProvider.propTypes = {
  taskList: t.arrayOf(t.object).isRequired,
  children: t.node,
};

TaskListProvider.defaultProps = {
  children: null,
};
