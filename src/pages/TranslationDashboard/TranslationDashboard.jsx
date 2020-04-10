import React from 'react';
import { useWeb3React } from '~/app/web3React';
import { useLinguoContract } from '~/api/linguo';
import MissingWalletWarning from '~/components/MissingWalletWarning';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskCardList from './TaskCardList';

function useAsyncState(getState, initialValue) {
  const [state, setState] = React.useState({
    data: initialValue,
    isLoading: false,
    error: '',
  });

  const fetch = React.useCallback(async () => {
    setState(tasks => ({
      ...tasks,
      isLoading: true,
    }));
    try {
      setState({
        data: await getState(),
        isLoading: false,
        error: '',
      });
    } catch (err) {
      setState({
        data: initialValue,
        isLoading: false,
        error: err.message,
      });
    }
  }, [initialValue, getState]);

  return [state, fetch];
}

const emptyTaskList = [];

function TranslationDashboard() {
  const { library: web3, chainId, account } = useWeb3React();
  const linguo = useLinguoContract({ web3, chainId });

  const [tasks, fetchTasks] = useAsyncState(
    React.useCallback(() => linguo.api.getOwnTasks(account), [linguo.api, account]),
    emptyTaskList
  );

  React.useEffect(() => {
    if (linguo.isReady && account) {
      fetchTasks();
    }
  }, [linguo.isReady, account, fetchTasks]);

  return (
    <MultiCardLayout>
      <MissingWalletWarning message="To view your requested translation tasks you need an Ethereum wallet." />
      {account && <TaskCardList {...tasks} />}
    </MultiCardLayout>
  );
}

export default TranslationDashboard;
