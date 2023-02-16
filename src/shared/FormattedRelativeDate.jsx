import t from 'prop-types';
import moment from 'moment';

function FormattedRelativeDate({ value, unit, render, baseDateTime }) {
  const formattedValue = moment(baseDateTime).add(value, unit).fromNow(true);
  return render({ value, unit, formattedValue });
}

FormattedRelativeDate.propTypes = {
  value: t.oneOfType([t.string, t.number]).isRequired,
  unit: t.oneOf(['year', 'quarter', 'month', 'week', 'day', 'second', 'millisecond']).isRequired,
  render: t.func,
  baseDateTime: t.oneOfType([t.string, t.instanceOf(Date)]).isRequired,
};

FormattedRelativeDate.defaultProps = {
  baseDateTime: new Date(),
  render: ({ formattedValue }) => formattedValue,
};

export default FormattedRelativeDate;
