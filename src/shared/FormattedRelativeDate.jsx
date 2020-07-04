import t from 'prop-types';
import dayjs from 'dayjs';

function FormattedRelativeDate({ value, unit, render, baseDateTime }) {
  const formattedValue = dayjs(baseDateTime).add(value, unit).fromNow(true);
  return render({ value, unit, formattedValue });
}

FormattedRelativeDate.propTypes = {
  value: t.number.isRequired,
  unit: t.oneOf(['year', 'quarter', 'month', 'week', 'day', 'second', 'millisecond']).isRequired,
  render: t.func,
  baseDateTime: t.oneOfType([t.string, t.instanceOf(Date)]).isRequired,
};

FormattedRelativeDate.defaultProps = {
  baseDateTime: new Date(),
  render: ({ formattedValue }) => formattedValue,
};

export default FormattedRelativeDate;
