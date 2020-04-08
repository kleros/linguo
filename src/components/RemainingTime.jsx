import t from 'prop-types';
import dayjs from 'dayjs';
import useCountdownTimer from '~/hooks/useCountdownTimer';

const _1_SECOND_IN_MILISSECONDS = 1000;
const _5_MINUTES_IN_MILISSECONDS = 5 * 60 * 1000;
const _1_DAY_IN_SECONDS = 24 * 60 * 60;

function RemainingTime({ initialValueSeconds, render }) {
  const remainingTime = useCountdownTimer({
    seconds: initialValueSeconds,
    updateIntervalMs: remainingTimeInSeconds =>
      remainingTimeInSeconds < _1_DAY_IN_SECONDS ? _1_SECOND_IN_MILISSECONDS : _5_MINUTES_IN_MILISSECONDS,
  });

  const formattedValue =
    remainingTime === 0
      ? '00:00:00'
      : remainingTime < _1_DAY_IN_SECONDS
      ? dayjs().startOf('day').add(remainingTime, 'second').format('HH:mm:ss')
      : dayjs().add(remainingTime, 'second').fromNow();

  const endingSoon = remainingTime < _1_DAY_IN_SECONDS;

  return render({ value: remainingTime, formattedValue, endingSoon });
}

const defaultRender = ({ formattedValue }) => formattedValue;

RemainingTime.propTypes = {
  initialValueSeconds: t.number.isRequired,
  render: t.func,
};

RemainingTime.defaultProps = {
  initialValueSeconds: 0,
  render: defaultRender,
};

export default RemainingTime;
