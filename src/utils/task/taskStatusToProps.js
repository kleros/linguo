import React from 'react';
import { Badge } from 'antd';

import taskStatus from '~/consts/taskStatus';
import KlerosLogoOutlined from '~/assets/images/logo-kleros-outlined.svg';

export const taskStatusToProps = {
  [taskStatus.Created]: {
    title: <Badge status="default" text="Open Task" />,
    colorKey: 'open',
  },
  [taskStatus.Assigned]: {
    title: <Badge status="default" text="In Progress" />,
    colorKey: 'inProgress',
  },
  [taskStatus.AwaitingReview]: {
    title: <Badge status="default" text="In Review" />,
    colorKey: 'inReview',
  },
  [taskStatus.DisputeCreated]: {
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
  [taskStatus.Resolved]: {
    title: <Badge status="default" text="Finished" />,
    colorKey: 'finished',
  },
  incomplete: {
    title: <Badge status="default" text="Incomplete" />,
    colorKey: 'incomplete',
  },
};
