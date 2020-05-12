import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';

function AccountingTable({ rows, summary, className }) {
  return (
    <StyledTable summary={summary} className={className}>
      <tbody>
        {rows.map(({ description, value, rowProps }, index) => {
          return (
            <StyledTableRow key={index} {...rowProps}>
              <StyledTableCellHeader>{description}</StyledTableCellHeader>
              <StyledTableCell>{value}</StyledTableCell>
            </StyledTableRow>
          );
        })}
      </tbody>
    </StyledTable>
  );
}

AccountingTable.propTypes = {
  rows: t.arrayOf(
    t.shape({
      description: t.node.isRequired,
      value: t.node.isRequired,
      rowProps: t.object,
    })
  ).isRequired,
  summary: t.string,
  className: t.string,
};

AccountingTable.defaultProps = {
  summary: '',
  className: '',
};

export default AccountingTable;

const StyledTable = styled.table`
  color: ${p => p.theme.color.text.default};
  font-weight: 400;
  width: 100%;
`;

const rowStyledByColor = {
  default: css`
    color: ${p => p.theme.color.text.default};
  `,
  primary: css`
    color: ${p => p.theme.color.primary.default};
  `,
  secondary: css`
    color: ${p => p.theme.color.secondary.default};
  `,
  danger: css`
    color: ${p => p.theme.color.danger.default};
  `,
};

const StyledTableRow = styled.tr.attrs(props => ({
  ...props,
  color: props.color ?? 'default',
}))`
  ${p => rowStyledByColor[p.color]}
  line-height: 1.33;
`;

const inheritProps = css`
  font-weight: inherit;
  font-size: inherit;
  color: inherit;
`;

const StyledTableCellHeader = styled.th`
  ${inheritProps}
  text-align: left;
`;

const StyledTableCell = styled.td`
  ${inheritProps}
  text-align: right;
`;
