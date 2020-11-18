import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography, Row, Col } from 'antd';

function TaskInfoGrid({ data }) {
  return (
    <StyledGrid>
      {data.map(({ title, content, footer = null }) => (
        <GridCell key={title} title={title} content={content} footer={footer} />
      ))}
    </StyledGrid>
  );
}

TaskInfoGrid.propTypes = {
  data: t.arrayOf(
    t.shape({
      title: t.node.isRequired,
      content: t.node.isRequired,
      footer: t.node,
    })
  ).isRequired,
};

export default TaskInfoGrid;

function GridCell({ title, content, footer }) {
  return (
    <StyledCell>
      <GridCellTitle level={4}>{title}</GridCellTitle>
      <GridCellContent>{content}</GridCellContent>
      {footer ? <GridCellFooter>{footer}</GridCellFooter> : null}
    </StyledCell>
  );
}

GridCell.propTypes = {
  title: t.node.isRequired,
  content: t.node.isRequired,
  footer: t.node,
};

const StyledGrid = styled(Row)`
  background-color: ${props => props.theme.color.background.default};
  border: 1px solid ${props => props.theme.color.primary.default};
  border-radius: 0.75rem;
`;

const StyledCell = styled(Col)`
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  align-items: center;
  text-align: center;
  min-width: 0;
  width: 50%;
  padding: 1.25rem 0.75rem;

  :nth-child(odd) {
    border-right: 1px solid ${props => props.theme.color.primary.default};
  }

  // :nth-child(n + 3) means ignore the first 2 elements
  :nth-child(n + 3) {
    border-top: 1px solid ${props => props.theme.color.primary.default};
  }
`;

const GridCellTitle = styled(Typography.Title)`
  && {
    color: ${props => props.theme.color.text.light};
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: ${p => p.theme.fontWeight.regular};
    margin-bottom: 0;
  }
`;

const GridCellContent = styled(Typography.Paragraph)`
  && {
    color: ${props => props.theme.color.text.light};
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${p => p.theme.fontWeight.semibold};
    max-width: 100%;
    margin-bottom: 0;

    &,
    > * {
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
      white-space: nowrap;
    }
  }
`;

const GridCellFooter = styled.footer`
  && {
    color: ${props => props.theme.color.text.light};
    font-size: ${props => props.theme.fontSize.xs};
    font-weight: ${p => p.theme.fontWeight.regular};
  }
`;
