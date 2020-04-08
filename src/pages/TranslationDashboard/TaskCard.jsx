import React from 'react';
import t from 'prop-types';
import Card from '~/components/Card';
import { Task } from '~/api/linguo';
import RemainingTime from '~/components/RemainingTime';
import TaskCardTitle from './TaskCardTitle';

function TaskCard({ status, sourceLanguage, targetLanguage, lastInteraction, submissionTimeout }) {
  const remainingTimeForSubmission = React.useMemo(() => {
    return Task.remainingTimeForSubmission({
      status,
      lastInteraction,
      submissionTimeout,
    });
  }, [status, lastInteraction, submissionTimeout]);
  return (
    <Card title={<TaskCardTitle sourceLanguage={sourceLanguage} targetLanguage={targetLanguage} />}>
      <RemainingTime seconds={remainingTimeForSubmission} />
    </Card>
  );
}

TaskCard.propTypes = {
  status: t.number.isRequired,
  sourceLanguage: t.string.isRequired,
  targetLanguage: t.string.isRequired,
  lastInteraction: t.any.isRequired,
  submissionTimeout: t.number.isRequired,
};

TaskCard.defaultProps = {};

export default TaskCard;
