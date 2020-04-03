import React from 'react';
import { useWeb3React } from '~/app/web3React';
import { useLinguoContract } from '~/api/linguo';

function Inner() {
  const { library: web3, chainId, account } = useWeb3React();
  const linguo = useLinguoContract({ web3, chainId });
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(() => {
    const it = linguo?.api?.watchTaskCreated({ account }) || [];

    async function runEffect() {
      for await (const data of it) {
        setTasks(state => [...state, data]);
      }
    }

    if (linguo.isReady) {
      runEffect();

      return () => {
        it.next({ cancel: true });
      };
    }
  }, [account, linguo, linguo.api, linguo.isReady]);

  console.log(tasks);
  return 'Translation Dashboard';
}

function TranslationDashboard() {
  const { library: web3, chainId, account } = useWeb3React();
  const linguo = useLinguoContract({ web3, chainId });
  const isReady = !!web3 && !!account && linguo.isReady;

  return <div>{isReady ? <Inner /> : 'Translation Dashboard'}</div>;
}

export default TranslationDashboard;
