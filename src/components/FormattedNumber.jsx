import t from 'prop-types';

function FormattedNumber({ value, decimals, render }) {
  const nf = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  });

  const formattedValue = nf.format(value);
  return render({ formattedValue, decimals });
}

FormattedNumber.propTypes = {
  value: t.number,
  decimals: t.number,
  render: t.func,
};

FormattedNumber.defaultProps = {
  value: 0,
  decimals: 0,
  render: ({ formattedValue }) => formattedValue,
};

export default FormattedNumber;
