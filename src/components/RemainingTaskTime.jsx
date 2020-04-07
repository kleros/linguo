import React from 'react';
import t from 'prop-types';
import dayjs from 'dayjs';
import { useTimeoutCountdown } from '~/api/linguo';

const _1_DAY_IN_SECONDS = 24 * 60 * 60;
const _1_SECOND_IN_MILISSECONDS = 1000;
const _5_MINUTES_IN_MILISSECONDS = 5 * 60 * 1000;

function RemainingTaskTime({ status, lastInteraction, submissionTimeout }) {
  const remainingTimeInSeconds = useTimeoutCountdown(
    {
      status,
      lastInteraction,
      submissionTimeout,
    },
    {
      updateIntervalMs: remainingTimeInSeconds =>
        remainingTimeInSeconds < _1_DAY_IN_SECONDS ? _1_SECOND_IN_MILISSECONDS : _5_MINUTES_IN_MILISSECONDS,
    }
  );

  const remainingTime =
    remainingTimeInSeconds === 0
      ? '00:00:00'
      : remainingTimeInSeconds < _1_DAY_IN_SECONDS
      ? dayjs().startOf('day').add(remainingTimeInSeconds, 'second').format('HH:mm:ss')
      : dayjs().add(remainingTimeInSeconds, 'second').fromNow();

  return <>{remainingTime}</>;
}

RemainingTaskTime.propTypes = {
  status: t.number.isRequired,
  lastInteraction: t.oneOfType([t.instanceOf(Date), t.number, t.any]).isRequired,
  submissionTimeout: t.number.isRequired,
};

export default RemainingTaskTime;
