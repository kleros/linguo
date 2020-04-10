import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography, Spin, Alert } from 'antd';
import TaskCard from './TaskCard';

const StyledSpin = styled(Spin)`
  &&.ant-spin {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const StyledRow = styled(Row)`
  // make cards in the same row to have the same height
  align-items: stretch;
`;

function TaskCardList({ isLoading, data, error }) {
  return (
    <StyledSpin tip="Loading the translations tasks you created..." spinning={isLoading}>
      {error && <Alert type="error" message={error} />}
      <StyledRow gutter={[32, { xs: 0, sm: 32 }]}>
        {data.map(task => {
          return (
            <Col key={task.ID} xs={24} sm={24} md={12} lg={8}>
              <TaskCard {...task} />
            </Col>
          );
        })}
      </StyledRow>
      {data.length > 0 && (
        <Typography.Text>
          <sub>
            <sup>*</sup>Approximate value: the actual price is defined when a translator assigns himself to the task.
          </sub>
        </Typography.Text>
      )}
    </StyledSpin>
  );
}

TaskCardList.propTypes = {
  isLoading: t.bool.isRequired,
  data: t.arrayOf(t.object),
  error: t.string,
};

TaskCardList.defaultProps = {
  isLoading: false,
  data: [],
};

export default TaskCardList;
