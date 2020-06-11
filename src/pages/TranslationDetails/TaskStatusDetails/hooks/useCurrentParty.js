import { useContext } from 'react';
import { TaskParty } from '~/app/linguo';
import { useWeb3React } from '~/features/web3';
import TaskContext from '../../TaskContext';

const getCurrentParty = ({ account, requester, translator, challenger }) => {
  switch (account) {
    /**
     * The requester could also be the challenger.
     * If that happens, the role he should assume is the one
     * of challenger, so he can better informed of next steps.
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

export default function useCurrentParty() {
  const { account } = useWeb3React();

  const { requester, parties = {} } = useContext(TaskContext);
  const translator = parties[TaskParty.Translator];
  const challenger = parties[TaskParty.Challenger];

  return getCurrentParty({ account, requester, translator, challenger });
}
