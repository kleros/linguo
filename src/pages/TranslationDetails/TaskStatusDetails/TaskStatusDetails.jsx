import React from 'react';
import ContentBlocker from '~/shared/ContentBlocker';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import byStatus from './byStatus';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';

export default function TaskStatusDetails() {
  const { account, chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { isIncomplete, status } = task;

  const Component = isIncomplete ? byStatus.Incomplete : byStatus[status];
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
