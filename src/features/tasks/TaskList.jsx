import { Col, Row, Typography } from 'antd';
import t from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import TaskCard from './TaskCard';

export default function TaskList({ data, showFootnote }) {
  return data.length === 0 ? (
    <StyledEmptyListText>Wow, such empty! There are currently no tasks.</StyledEmptyListText>
  ) : (
    <>
      <StyledTaskCountText>
        Total of {data.length} {pluralize(data.length, { single: 'task', many: 'tasks' })}
      </StyledTaskCountText>
      <StyledListWrapper>
        <StyledRow
          gutter={[
            { xs: 0, sm: 32 },
            { xs: 16, sm: 32 },
          ]}
        >
          {data.map(task => {
            return (
              <Col key={task.id} xs={24} sm={24} md={12} lg={8}>
                <TaskCard {...task} />
              </Col>
            );
          })}
        </StyledRow>
      </StyledListWrapper>
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

const pluralize = (quantity, { single, many }) => (quantity === 1 ? single : many);

const StyledListWrapper = styled.div`
  @media (max-width: 575.98px) {
    margin: 0 -1.5rem;
  }
`;

const StyledRow = styled(Row)`
  // make cards in the same row to have the same height
  align-items: stretch;
`;

const StyledFootnote = styled(Typography.Paragraph)`
  && {
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};

    @media (max-width: 575.98px) {
      margin: 1rem 0 2rem;
    }
  }
`;

const StyledEmptyListText = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.xl};
    text-align: center;
    margin: 2rem 0;
  }
`;

const StyledTaskCountText = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    text-align: right;
    margin: 0 0 1rem;
  }
`;
