import t from 'prop-types';

function FormattedDate({ value, render, weekday, year, month, day, hour, minute, second, timeZoneName }) {
  const df = new Intl.DateTimeFormat('en-us', { weekday, year, month, day, hour, minute, second, timeZoneName });
  const formattedValue = df.format(value);

  return render({ formattedValue, value });
}

FormattedDate.propTypes = {
  value: t.oneOfType([t.string, t.instanceOf(Date)]).isRequired,
  render: t.func,
  weekday: t.oneOf(['long', 'short', 'narrow']),
  year: t.oneOf(['numeric', '2-digit']),
  month: t.oneOf(['numeric', '2-digit', 'long', 'short', 'narrow']),
  day: t.oneOf(['numeric', '2-digit']),
  hour: t.oneOf(['numeric', '2-digit']),
  minute: t.oneOf(['numeric', '2-digit']),
  second: t.oneOf(['numeric', '2-digit']),
  timeZoneName: t.oneOf(['long', 'short']),
};

FormattedDate.defaultProps = {
  render: ({ formattedValue }) => formattedValue,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

export default FormattedDate;
