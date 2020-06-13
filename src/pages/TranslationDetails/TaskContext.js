import React from 'react';
import t from 'prop-types';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import { TaskStatus } from '~/app/linguo';

const TaskContext = React.createContext({});
TaskContext.displayName = 'TaskContext';

export default TaskContext;

export function TaskProvider({ task, children }) {
  return <TaskContext.Provider value={task}>{children}</TaskContext.Provider>;
}

TaskProvider.propTypes = {
  task: t.shape({
    ID: t.oneOfType([t.number, t.string]).isRequired,
    status: t.oneOf(Object.values(TaskStatus)).isRequired,
    title: t.string.isRequired,
    deadline: t.oneOfType([t.string, t.instanceOf(Date)]).isRequired,
    minPrice: t.string.isRequired,
    maxPrice: t.string.isRequired,
    assignedPrice: t.string,
    expectedQuality: t.oneOf(Object.keys(translationQualityTiers)).isRequired,
    wordCount: t.number.isRequired,
    submissionTimeout: t.number.isRequired,
    reviewTimeout: t.number.isRequired,
    requester: t.string.isRequired,
    parties: t.shape({
      translator: t.string,
      challenger: t.string,
    }).isRequired,
  }).isRequired,
  children: t.node,
};

TaskProvider.defaultProps = {
  children: null,
};
