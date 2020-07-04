import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';

export default function AccountingTable({ rows, summary, className }) {
  return (
    <StyledTable summary={summary} className={className}>
      <tbody>
        {rows.map(({ description, value, rowProps }, index) => {
          const { css, ...rest } = rowProps ?? {};
          return (
            <StyledTableRow key={index} css={css} {...rest}>
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

const StyledTable = styled.table`
  color: inherit;
  font-weight: 400;
  width: 100%;
`;

const StyledTableRow = styled.tr`
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
