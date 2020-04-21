import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import { TaskStatus, Task, TaskParty } from '~/api/linguo';
import { useWeb3React } from '~/app/web3React';
import TaskCreatedAvatar from '~/assets/images/avatar-task-created.svg';
import TaskDeadline from './TaskDeadline';
import TaskAssignmentDeposit from './TaskAssignmentDeposit';
import Button from '~/components/Button';
import Spacer from '~/components/Spacer';

const StyledWrapper = styled.div`
  border: 1px solid ${p => p.theme.color.primary.default};
  border-radius: 0.75rem;
  padding: 1.5rem 2.5rem;
`;

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: 500;
    color: ${props => props.theme.color.primary.default};
  }
`;

const StyledDescription = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    color: ${props => props.theme.color.text.default};
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

const StyledActionWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;

  @media (max-width: 767.98px) {
    margin-left: 50%;
  }
`;

const getCurrentParty = ({ account, requester, translator, challenger }) => {
  switch (account) {
    case requester:
      return TaskParty.Requester;
    case translator:
      return TaskParty.Translator;
    case challenger:
      return TaskParty.Challenger;
    default:
      return TaskParty.Other;
  }
};

const getContent = (task, party) => {
  /**
   * This is a special case that does not map directly to any Task.status value.
   */
  if (Task.isIncomplete(task)) {
    return {
      title: 'This translation was not completed on time',
      description:
        party === TaskParty.Requester
          ? ['You can try submitting the same task again.', 'Increasing the payout might help you get it done on time.']
          : [],
      // TODO: change this after @Plinio designs the proper icon.
      renderAction: function IncompleteAction() {
        return (
          <StyledAvatarWrapper>
            <TaskCreatedAvatar />
          </StyledAvatarWrapper>
        );
      },
    };
  }

  const contentByStatusAndParty = {
    [TaskStatus.Created]: {
      /**
       * Only the Requester is known when the task istatus is Created.
       * There is no need to set values for Translator or Challenger.
       */
      [TaskParty.Requester]: {
        title: 'This translation was not assigned yet',
        description: ['You will be informed when this task is assigned to a translator.'],
        renderAction: function CreatedRequesterAction() {
          return (
            <StyledAvatarWrapper>
              <TaskCreatedAvatar />
            </StyledAvatarWrapper>
          );
        },
      },
      [TaskParty.Other]: {
        title: 'Start translating it',
        description: [
          'In order to self-assign this task you need to send a translation deposit. The value will be reimbursed when the task is finished and approved after the review time.',
          'In case your translation is not delivered in time or not approved, it will be used as a compensation to the task requester or challenger.',
        ],
        renderAction: function CreatedOtherAction() {
          return (
            <StyledActionWrapper>
              <TaskDeadline {...task} />
              <Spacer />
              <Button fullWidth>Translate it</Button>
              <Spacer />
              <TaskAssignmentDeposit {...task} />
            </StyledActionWrapper>
          );
        },
      },
    },
  };

  return contentByStatusAndParty[task.status][party] || { title: '', description: [] };
};

function TaskStatusDescription(task) {
  const { account } = useWeb3React();
  const { requester, parties } = task;

  const party = getCurrentParty({ account, requester, ...parties });
  const { title, description, renderAction } = getContent(task, party);

  return (
    <StyledWrapper>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={24} md={16}>
          <StyledTitle>{title}</StyledTitle>
          {description.map((paragraph, index) => (
            <StyledDescription key={index}>{paragraph}</StyledDescription>
          ))}
        </Col>
        <Col xs={24} sm={24} md={8}>
          {renderAction()}
        </Col>
      </Row>
    </StyledWrapper>
  );
}

TaskStatusDescription.propTypes = {
  status: t.oneOf(Object.values(TaskStatus)).isRequired,
};

export default TaskStatusDescription;
