import React from 'react';
import styled from 'styled-components';
import { Task, TaskParty } from '~/app/linguo';
import { useWeb3React } from '~/app/web3React';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import ContentBlocker from '~/components/ContentBlocker';
import TaskContext from './TaskContext';
import status from './status';

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

const StyledWrapper = styled.div`
  border: 1px solid ${p => p.theme.color.primary.default};
  border-radius: 0.75rem;
  padding: 2rem;
`;

function TaskStatusDescription() {
  const task = React.useContext(TaskContext);
  const isIncomplete = Task.isIncomplete(task);
  const { requester, parties } = task;
  const { account } = useWeb3React();

  const party = getCurrentParty({ account, requester, ...parties });

  const Component = isIncomplete ? status.Incomplete[party] : status?.[task.status]?.[party];

  const contentBlocked = !account;
  const content = (
    <ContentBlocker blocked={contentBlocked}>
      <StyledWrapper>{Component && <Component />}</StyledWrapper>
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

export default TaskStatusDescription;
