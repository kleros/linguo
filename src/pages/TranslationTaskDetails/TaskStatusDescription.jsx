import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { TaskStatus, Task, TaskParty } from '~/api/linguo';
import { useWeb3React } from '~/app/web3React';
import TaskCreatedAvatar from '~/assets/images/avatar-task-created.svg';
import TaskAssignedAvatar from '~/assets/images/avatar-task-assigned.svg';
import TaskAwaitingReviewAvatar from '~/assets/images/avatar-task-awaiting-review.svg';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';
import Spacer from '~/components/Spacer';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import ContentBlocker from '~/components/ContentBlocker';
import FormattedRelativeDate from '~/components/FormattedRelativeDate';
import TaskDeadline from './TaskDeadline';
import TaskAssignmentDepositFetcher from './TaskAssignmentDepositFetcher';
import TaskInteractionButton from './TaskInteractionButton';
import TranslationUploadButton from './TranslationUploadButton';

const StyledWrapper = styled.div`
  border: 1px solid ${p => p.theme.color.primary.default};
  border-radius: 0.75rem;
  padding: 2rem;
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

const StyledIllustrationWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  > svg {
    max-width: 10rem;
  }

  @media (max-width: 767.98px) {
    justify-content: center;
  }
`;

const StyledActionWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;

  @media (max-width: 767.98px) {
    width: 50%;
    margin: 0 auto;
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
      renderAction() {
        return (
          <StyledIllustrationWrapper>
            <TaskIgnoredAvatar />
          </StyledIllustrationWrapper>
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
        renderAction() {
          return (
            <StyledIllustrationWrapper>
              <TaskCreatedAvatar />
            </StyledIllustrationWrapper>
          );
        },
      },
      [TaskParty.Other]: {
        title: 'Start translating it',
        description: [
          'In order to self-assign this task you need to send a translation deposit. The value will be reimbursed when the task is finished and approved after the review time.',
          'In case your translation is not delivered in time or not approved, it will be used as a compensation to the task requester or challenger.',
        ],
        renderAction() {
          return (
            <StyledActionWrapper>
              <TaskDeadline {...task} />
              <Spacer />
              <TaskInteractionButton
                ID={task.ID}
                interaction={TaskInteractionButton.Interaction.Assign}
                content={{
                  idle: 'Translate It',
                  pending: (
                    <>
                      <LoadingOutlined /> Sending...
                    </>
                  ),
                  succeeded: 'Done!',
                }}
                buttonProps={{ fullWidth: true }}
              />
              <Spacer />
              <TaskAssignmentDepositFetcher {...task} />
            </StyledActionWrapper>
          );
        },
      },
    },
    [TaskStatus.Assigned]: {
      [TaskParty.Requester]: {
        title: 'This translation task was assigned by a translator',
        description: [
          'You will be informed when the translation is delivered.',
          <FormattedRelativeDate
            key="next-steps"
            value={task.reviewTimeout}
            unit="second"
            render={({ formattedValue }) => (
              <>
                After this, it goes to the Review List for <strong>{formattedValue}</strong>.
              </>
            )}
          />,
          'During this time you can challenge the translation if you think it does not fulfill the quality requirements.',
        ],
        renderAction() {
          return (
            <StyledIllustrationWrapper>
              <TaskAssignedAvatar />
            </StyledIllustrationWrapper>
          );
        },
      },
      [TaskParty.Translator]: {
        title: 'Deliver the translation file in plain text (*.txt)',
        description: [
          <FormattedRelativeDate
            key="next-steps"
            value={task.reviewTimeout}
            unit="second"
            render={({ formattedValue }) => (
              <>
                After uploading the translation file, it goes to the Review List for <strong>{formattedValue}</strong>.
              </>
            )}
          />,
          'While in Review List, the translation can be challenged by the task requester or any other translator if they think it does not fulfill the quality requirements.',
        ],
        renderAction() {
          return (
            <StyledActionWrapper>
              <TaskDeadline {...task} />
              <Spacer />
              <TranslationUploadButton ID={task.ID} buttonProps={{ fullWidth: true }} />
              <Spacer />
            </StyledActionWrapper>
          );
        },
      },
      [TaskParty.Other]: {
        title: 'This translation task was assigned by a translator',
        description: [
          <FormattedRelativeDate
            key="next-steps"
            value={task.reviewTimeout}
            unit="second"
            render={({ formattedValue }) => (
              <>
                After the translation is submitted by the translator, it goes to the Review List for{' '}
                <strong>{formattedValue}</strong>.
              </>
            )}
          />,
          'During this time you can challenge the translation if you think it does not fulfill the quality requirements.',
        ],
        renderAction() {
          return (
            <StyledIllustrationWrapper>
              <TaskAssignedAvatar />
            </StyledIllustrationWrapper>
          );
        },
      },
    },
    [TaskStatus.AwaitingReview]: {
      [TaskParty.Requester]: {
        title: (
          <TaskDeadline
            {...task}
            render={({ value, formattedValue }) =>
              value > 0 ? (
                <>
                  Translation delivered. (In review for <strong>{formattedValue}</strong>)
                </>
              ) : (
                'Review period is over'
              )
            }
          />
        ),

        description:
          Task.remainingTimeForReview(task, { currentDate: new Date() }) > 0
            ? [
                'During review you can challenge the translation if you think it does not fulfill the quality requirements. To do so, you need to send a challenge deposit.',
                'If the jurors decide to not approve the translation you receive the escrow deposit back + the challenge deposit back + the deposit of the translator (minus arbitration fees).',
                'If the translation is approved by the jurors you lose the challenge deposit and the escrow payment goes to the translator.',
              ]
            : [
                'Since no one challenged the translation during the review period, the translator will be automatically paid in a few moments.',
                'If you want, you can send the payment to the translator right the way.',
              ],
        renderAction() {
          const remainingTime = Task.remainingTimeForReview(task, { currentDate: new Date() });

          return (
            <StyledActionWrapper>
              <TaskDeadline {...task} />
              <Spacer />

              {remainingTime === 0 ? (
                <TaskInteractionButton
                  ID={task.ID}
                  interaction={TaskInteractionButton.Interaction.Accept}
                  content={{
                    idle: 'Pay Translator',
                    pending: (
                      <>
                        <LoadingOutlined /> Sending...
                      </>
                    ),
                    succeeded: 'Done!',
                  }}
                  buttonProps={{ fullWidth: true }}
                />
              ) : (
                <TaskInteractionButton
                  ID={task.ID}
                  interaction={TaskInteractionButton.Interaction.Challenge}
                  content={{
                    idle: 'Challenge It',
                    pending: (
                      <>
                        <LoadingOutlined /> Sending...
                      </>
                    ),
                    succeeded: 'Done!',
                  }}
                  buttonProps={{ fullWidth: true }}
                />
              )}
            </StyledActionWrapper>
          );
        },
      },
      [TaskParty.Translator]: {
        title: (
          <TaskDeadline
            {...task}
            render={({ value, formattedValue }) =>
              value > 0 ? (
                <>
                  Translation delivered. (In review for <strong>{formattedValue}</strong>)
                </>
              ) : (
                'Review period is over'
              )
            }
          />
        ),
        description:
          Task.remainingTimeForReview(task, { currentDate: new Date() }) > 0
            ? [
                'During review time if someone challenge the translation a dispute is open and specialized jurors are drawn to decide the case. ',
                'If so, you will be asked to deposit the arbitration fee as well. But, if the translation is not challenged, the task is finished and you receive the escrow payment + your translation deposit back.',
              ]
            : [
                'Your payment and the deposit you made when assigned to this task will be automatically sent to your wallet in a few moments.',
                'If you do not want to wait, you can claim your payment + your deposit back now.',
              ],
        renderAction() {
          const remainingTime = Task.remainingTimeForReview(task, { currentDate: new Date() });
          return remainingTime === 0 ? (
            <StyledActionWrapper>
              <TaskDeadline {...task} />
              <Spacer />
              <TaskInteractionButton
                ID={task.ID}
                interaction={TaskInteractionButton.Interaction.Accept}
                content={{
                  idle: 'Claim Payment',
                  pending: (
                    <>
                      <LoadingOutlined /> Sending...
                    </>
                  ),
                  succeeded: 'Done!',
                }}
                buttonProps={{ fullWidth: true }}
              />
            </StyledActionWrapper>
          ) : (
            <StyledIllustrationWrapper>
              <TaskAwaitingReviewAvatar />
            </StyledIllustrationWrapper>
          );
        },
      },
      [TaskParty.Other]: {
        // TODO
      },
    },
  };

  return contentByStatusAndParty[task.status]?.[party] ?? { title: '', description: [], renderAction: () => null };
};

function TaskStatusDescription(task) {
  const { account } = useWeb3React();
  const { requester, parties } = task;

  const party = getCurrentParty({ account, requester, ...parties });
  const { title = null, description = [], renderAction = () => null } = getContent(task, party);

  const contentBlocked = !account;
  const content = (
    <ContentBlocker blocked={contentBlocked}>
      <StyledWrapper>
        <Row
          gutter={[32, 32]}
          css={`
            margin-bottom: -16px !important;
          `}
        >
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
    </ContentBlocker>
  );

  return (
    <RequiredWalletGateway
      message="To interact with this task you need an Ethereum wallet."
      error={content}
      missing={content}
    >
      {content}
    </RequiredWalletGateway>
  );
}

TaskStatusDescription.propTypes = {
  status: t.oneOf(Object.values(TaskStatus)).isRequired,
};

export default TaskStatusDescription;
