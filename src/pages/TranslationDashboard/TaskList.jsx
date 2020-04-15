import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import TaskCard from './TaskCard';

const StyledRow = styled(Row)`
  // make cards in the same row to have the same height
  align-items: stretch;
`;

const StyledReponsiveText = styled(Typography.Paragraph)`
  @media (max-width: 575.98px) {
    padding: 0 1rem;
  }
`;

const StyledFootnote = styled(StyledReponsiveText)`
  && {
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};

    @media (max-width: 575.98px) {
      margin: 1rem 0 2rem;
    }
  }
`;

const StyledEmptyListText = styled(StyledReponsiveText)`
  && {
    font-size: ${props => props.theme.fontSize.lg};
    text-align: center;
    margin: 2rem 0;
  }
`;

const StyledTaskCountText = styled(StyledReponsiveText)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    text-align: right;
    margin: 0 0 1rem;
  }
`;

const pluralize = (quantity, { single, many }) => (quantity === 1 ? single : many);

function TaskList({ data, showFootnote }) {
  return data.length === 0 ? (
    <StyledEmptyListText>Wow, such empty! There are currently no tasks.</StyledEmptyListText>
  ) : (
    <>
      <StyledTaskCountText>
        Total of {data.length} {pluralize(data.length, { single: 'task', many: 'tasks' })}
      </StyledTaskCountText>
      <StyledRow gutter={[32, { xs: 0, sm: 32 }]}>
        {data.map(task => {
          return (
            <Col key={task.ID} xs={24} sm={24} md={12} lg={8}>
              <TaskCard {...task} />
            </Col>
          );
        })}
      </StyledRow>
      {showFootnote && (
        <StyledFootnote>
          <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
        </StyledFootnote>
      )}
    </>
  );
}

TaskList.propTypes = {
  data: t.arrayOf(t.object).isRequired,
  showFootnote: t.bool,
};

TaskList.defaultProps = {
  showFootnote: false,
};

export default TaskList;
