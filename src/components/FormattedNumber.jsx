import t from 'prop-types';

function FormattedNumber({ value, decimals, style, render }) {
  const nf = new Intl.NumberFormat('en-US', {
    style,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });

  const formattedValue = nf.format(value);
  return render({ formattedValue, decimals });
}

FormattedNumber.propTypes = {
  style: t.oneOf(['decimal', 'percent']),
  value: t.number,
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
