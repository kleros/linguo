import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import { TaskStatus, Task } from '~/api/linguo';
import { useWeb3React } from '~/app/web3React';
import TaskCreatedAvatar from '~/assets/images/avatar-task-created.svg';

const StyledWrapper = styled.div`
  border: 1px solid ${p => p.theme.primary.default};
  border-radius: 0.75rem;
  padding: 1.5rem 2.5rem;
`;

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: 500;
    color: ${props => props.theme.primary.default};
  }
`;

const StyledDescription = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    color: ${props => props.theme.text.default};
    margin: 0;

    & + & {
      margin-top: 1rem;
    }
  }
`;

const StyledAvatarWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const contentByStatus = {
  [TaskStatus.Created]: {
    title: 'This translation was not assigned yet',
    description: ['You will be informed when this task is assigned to a translator.'],
    avatar: <TaskCreatedAvatar />,
  },
};

const getContent = task => {
  if (Task.isIncomplete(task)) {
    return {
      title: 'This translation was not completed on time',
      description: [
        'You can try submitting the same task again.',
        'Increasing the payout might help you get it done on time.',
      ],
      avatar: <TaskCreatedAvatar />,
    };
  }

  return contentByStatus[task.status] || { title: '', description: [] };
};

function TaskStatusDescription(task) {
  const { account } = useWeb3React();
  const { requester } = task;

  const { title, description, avatar } = getContent(task);
  const showDescription = account === requester;

  return (
    <StyledWrapper>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={16}>
          <StyledTitle>{title}</StyledTitle>
          {showDescription &&
            description.map((paragraph, index) => <StyledDescription key={index}>{paragraph}</StyledDescription>)}
        </Col>
        <Col xs={24} sm={24} md={8}>
          <StyledAvatarWrapper>{avatar}</StyledAvatarWrapper>
        </Col>
      </Row>
    </StyledWrapper>
  );
}

TaskStatusDescription.propTypes = {
  status: t.oneOf(Object.values(TaskStatus)).isRequired,
};

export default TaskStatusDescription;
