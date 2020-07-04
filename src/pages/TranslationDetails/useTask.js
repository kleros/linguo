import { useContext } from 'react';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { selectById } from '~/features/tasks/tasksSlice';
import TaskContext from './TaskContext';

export default function useTask(id) {
  const taskFromStore = useShallowEqualSelector(selectById(id));
  const taskFromContext = useContext(TaskContext);

  return id ? taskFromStore : taskFromContext;
}
