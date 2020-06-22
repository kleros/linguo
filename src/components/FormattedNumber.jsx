import t from 'prop-types';

function FormattedNumber({ value, decimals, style, currency, render }) {
  const nf = new Intl.NumberFormat('en-US', {
    style,
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });

  const formattedValue = nf.format(value);
  return render({ formattedValue, decimals });
}

FormattedNumber.propTypes = {
  style: t.oneOf(['decimal', 'percent', 'currency']),
  current: t.string,
  value: t.oneOfType([t.number, t.string]),
  decimals: t.number,
  render: t.func,
};

FormattedNumber.defaultProps = {
  style: 'decimal',
  value: 0,
  decimals: 0,
  render: ({ formattedValue }) => formattedValue,
};

export default FormattedNumber;
