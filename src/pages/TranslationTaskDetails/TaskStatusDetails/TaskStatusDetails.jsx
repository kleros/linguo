import React from 'react';
import { Task, TaskParty } from '~/app/linguo';
import { useWeb3React } from '~/app/web3React';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import ContentBlocker from '~/components/ContentBlocker';
import TaskContext from '../TaskContext';
import byStatus from './byStatus';

const getCurrentParty = ({ account, requester, translator, challenger }) => {
  switch (account) {
    /**
     * The requester could also be the challenger.
     * If that happens, the role he should assume is the one of challenger,
     * so he can further participate in the flow.
     * That's why challenger is matched before requester here.
     */
    case challenger:
      return TaskParty.Challenger;
    case requester:
      return TaskParty.Requester;
    case translator:
      return TaskParty.Translator;
    default:
      return TaskParty.Other;
  }
};

function TaskStatusDetails() {
  const task = React.useContext(TaskContext);
  const isIncomplete = Task.isIncomplete(task);
  const { requester, parties } = task;
  const { account } = useWeb3React();

  const party = getCurrentParty({ account, requester, ...parties });

  const Component = isIncomplete ? byStatus.Incomplete[party] : byStatus?.[task.status]?.[party];

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
