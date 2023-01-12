import { TaskParty } from '~/features/tasks';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useWeb3 } from '~/hooks/useWeb3';

const getCurrentParty = ({ account, requester, translator, challenger }) => {
  switch (account.toLowerCase()) {
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
  const { account, chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { challenger, requester, translator } = task;
  return getCurrentParty({ account, requester, translator, challenger });
}
