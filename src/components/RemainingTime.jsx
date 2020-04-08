import React from 'react';
import t from 'prop-types';
import dayjs from 'dayjs';
import useCountdownTimer from '~/hooks/useCountdownTimer';

const _1_DAY_IN_SECONDS = 24 * 60 * 60;
const _1_SECOND_IN_MILISSECONDS = 1000;
const _5_MINUTES_IN_MILISSECONDS = 5 * 60 * 1000;

function RemainingTime({ seconds }) {
  const remainingTime = useCountdownTimer({
    seconds,
    updateIntervalMs: remainingTimeInSeconds =>
      remainingTimeInSeconds < _1_DAY_IN_SECONDS ? _1_SECOND_IN_MILISSECONDS : _5_MINUTES_IN_MILISSECONDS,
  });

  const remainingTimeNode =
    remainingTime === 0
      ? '00:00:00'
      : remainingTime < _1_DAY_IN_SECONDS
      ? dayjs().startOf('day').add(remainingTime, 'second').format('HH:mm:ss')
      : dayjs().add(remainingTime, 'second').fromNow();

  return <>{remainingTimeNode}</>;
}

RemainingTime.propTypes = {
  seconds: t.number.isRequired,
};

RemainingTime.defaultProps = {
  seconds: 0,
};

export default RemainingTime;
