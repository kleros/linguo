import React from 'react';
import styled from 'styled-components';
import { Titled } from 'react-titled';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Badge } from 'antd';
import TopLoadingBar from '~/shared/TopLoadingBar';
import { Task, TaskStatus } from '~/features/tasks';
import { selectIsLoadingById } from '~/features/tasks/tasksSlice';
import { selectIsLoadingByTaskId } from '~/features/disputes/disputesSlice';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import KlerosLogoOutlined from '~/assets/images/logo-kleros-outlined.svg';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TaskFetcher from './TaskFetcher';
import TaskDetails from './TaskDetails';

export default function TranslationDetails() {
  const { id } = useParams();
  const isTaskLoading = useSelector(selectIsLoadingById(id));
  const isDisputeLoading = useSelector(selectIsLoadingByTaskId(id));
  const isLoading = isTaskLoading || isDisputeLoading;

  return (
    <TaskFetcher>
      {task => {
        const cardProps = Task.isIncomplete(task) ? taskStatusToProps.incomplete : taskStatusToProps[task.status];

        return (
          <Titled title={title => `Translation Details | ${title}`}>
            <StyledSingleCardLayout
              $colorKey={cardProps.colorKey}
              title={cardProps.title}
              beforeContent={<TopLoadingBar show={isLoading} />}
            >
              <RequiredWalletGateway message="To view the details of this translation task you need an Ethereum Wallet.">
                <TaskDetails />
              </RequiredWalletGateway>
            </StyledSingleCardLayout>
          </Titled>
        );
      }}
    </TaskFetcher>
  );
}

const taskStatusToProps = {
  [TaskStatus.Created]: {
    title: <Badge status="default" text="Open Task" />,
    colorKey: 'open',
  },
  [TaskStatus.Assigned]: {
    title: <Badge status="default" text="In Progress" />,
    colorKey: 'inProgress',
  },
  [TaskStatus.AwaitingReview]: {
    title: <Badge status="default" text="In Review" />,
    colorKey: 'inReview',
  },
  [TaskStatus.DisputeCreated]: {
    title: (
      <>
        <Badge status="default" text="In Dispute" />
        <KlerosLogoOutlined
          css={`
            width: 1.5rem;
          `}
        />
      </>
    ),
    colorKey: 'inDispute',
  },
  [TaskStatus.Resolved]: {
    title: <Badge status="default" text="Finished" />,
    colorKey: 'finished',
  },
  incomplete: {
    title: <Badge status="default" text="Incomplete" />,
    colorKey: 'incomplete',
  },
};

const StyledSingleCardLayout = styled(SingleCardLayout)`
  .card-header {
    background-color: ${p => p.theme.hexToRgba(p.theme.color.status[p.$colorKey], '0.06')};
    color: ${p => p.theme.color.status[p.$colorKey]};
    border: none;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border-top: 5px solid;
    padding-top: calc(1rem - 2.5px);
  }

  .ant-badge-status-dot {
    background-color: ${p => p.theme.color.status[p.$colorKey]};
  }

  .ant-badge-status-text,
  .card-header-title {
    font-size: ${p => p.theme.fontSize.md};
    font-weight: ${p => p.theme.fontWeight.regular};
    color: inherit;
    text-align: left;
  }

  .card-header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    svg {
      fill: currentColor;
    }
  }
`;
