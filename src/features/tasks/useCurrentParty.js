import { useSelector } from 'react-redux';
import { TaskParty } from '~/features/tasks';
import { selectAccount } from '~/features/web3/web3Slice';

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

export default function useCurrentParty(task) {
  const account = useSelector(selectAccount);

  const { requester, parties = {} } = task;
  const translator = parties[TaskParty.Translator];
  const challenger = parties[TaskParty.Challenger];

  return getCurrentParty({ account, requester, translator, challenger });
}
