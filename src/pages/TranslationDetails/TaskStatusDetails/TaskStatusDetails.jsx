import React from 'react';
import ContentBlocker from '~/components/ContentBlocker';
import { Task } from '~/features/tasks';
import { useWeb3React } from '~/features/web3';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import useTask from '../useTask';
import byStatus from './byStatus';

function TaskStatusDetails() {
  const task = useTask();
  const isIncomplete = Task.isIncomplete(task);

  const Component = isIncomplete ? byStatus.Incomplete : byStatus[task.status];

  const { account } = useWeb3React();
  const contentBlocked = !account;

  const content = <ContentBlocker blocked={contentBlocked}>{Component && <Component />}</ContentBlocker>;

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

export default TaskStatusDetails;
