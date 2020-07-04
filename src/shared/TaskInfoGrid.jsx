import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography, Row, Col } from 'antd';

function TaskInfoGrid({ data }) {
  return (
    <StyledGrid>
      {data.map(({ title, content }) => (
        <GridCell key={title} title={title} content={content} />
      ))}
    </StyledGrid>
  );
}

TaskInfoGrid.propTypes = {
  data: t.arrayOf(
    t.shape({
      title: t.node.isRequired,
      content: t.node.isRequired,
    })
  ).isRequired,
};

export default TaskInfoGrid;

function GridCell({ title, content }) {
  return (
    <StyledCell>
      <GridCellTitle level={4}>{title}</GridCellTitle>
      <GridCellContent>{content}</GridCellContent>
    </StyledCell>
  );
}

GridCell.propTypes = {
  title: t.node.isRequired,
  content: t.node.isRequired,
};

const StyledGrid = styled(Row)`
  background-color: ${props => props.theme.color.background.default};
  border: 1px solid ${props => props.theme.color.primary.default};
  border-radius: 0.75rem;
`;

const StyledCell = styled(Col)`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  text-align: center;
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
    font-weight: 400;
    margin-bottom: -0.25rem;
  }
`;

const GridCellContent = styled(Typography.Paragraph)`
  && {
    color: ${props => props.theme.color.text.light};
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: 500;
    margin-bottom: 0;
  }
`;
