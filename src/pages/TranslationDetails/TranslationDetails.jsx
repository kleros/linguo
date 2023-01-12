import React from 'react';
import styled from 'styled-components';
import { Titled } from 'react-titled';
import { Spin } from 'antd';

import TopLoadingBar from '~/shared/TopLoadingBar';
import SingleCardLayout from '../layouts/SingleCardLayout';
import TaskDetails from './TaskDetails';

import { useTaskQuery } from '~/hooks/queries/useTaskQuery';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useWeb3 } from '~/hooks/useWeb3';
import { useIPFSQuery } from '~/hooks/queries/useIPFSQuery';

import Task from '~/utils/task';
import { taskStatusToProps } from '~/utils/task/taskStatusToProps';

export default function TranslationDetails() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task, isLoading } = useTaskQuery(id);
  const { data } = useIPFSQuery(task?.metaEvidence?.URI);

  const metadata = data?.metadata;
  if (!task || !metadata) return <></>;

  const { status, translation, lasttInteraction, submissionTimeout } = task;
  const cardProps = Task.isIncomplete(status, translation, lasttInteraction, submissionTimeout)
    ? taskStatusToProps.incomplete
    : taskStatusToProps[status];

  return (
    <>
      <Spin
        tip="Getting task details..."
        spinning={isLoading && !metadata}
        css={`
          width: 100%;
        `}
      />
      <Titled title={title => `Translation Details | ${title}`}>
        <StyledSingleCardLayout
          $colorKey={cardProps.colorKey}
          title={cardProps.title}
          beforeContent={<TopLoadingBar show={isLoading} />}
        >
          <TaskDetails />
        </StyledSingleCardLayout>
      </Titled>
    </>
  );
}

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
