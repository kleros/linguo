import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import styled from 'styled-components';
import { selectLatestBlock } from '~/features/notifications/notificationsSlice';
import { subscribeToUpdates, unsubscribeFromUpdates } from '~/features/tasks/tasksSlice';
import { subscribeToEthPrice, unsubscribeFromEthPrice } from '~/features/tokens/tokensSlice';
import { selectAccount, selectChainId } from '~/features/web3/web3Slice';

export default function Content({ children }) {
  useTaskUpdatesSubscription();
  useEthPricePolling();

  return <StyledContent>{children}</StyledContent>;
}

function useTaskUpdatesSubscription() {
  const dispatch = useDispatch();

  const account = useSelector(selectAccount);
  const chainId = useSelector(selectChainId);
  const latestBlock = useSelector(state => selectLatestBlock(state, { chainId, account }));

  const subscribe = React.useCallback(
    () => dispatch(subscribeToUpdates({ chainId, account, fromBlock: latestBlock + 1 })),
    [dispatch, account, chainId, latestBlock]
  );
  const unsubscribe = React.useCallback(() => dispatch(unsubscribeFromUpdates()), [dispatch]);

  React.useEffect(() => {
    if (account) {
      subscribe();

      window.addEventListener('focus', subscribe);
      window.addEventListener('blur', unsubscribe);

      return () => {
        unsubscribe();

        window.removeEventListener('focus', subscribe);
        window.removeEventListener('blur', unsubscribe);
      };
    }
  }, [dispatch, account, subscribe, unsubscribe]);
}

const _1_MINUTE = 60 * 1000;

function useEthPricePolling({ interval = _1_MINUTE } = {}) {
  const dispatch = useDispatch();

  const chainId = useSelector(selectChainId);

  const subscribe = React.useCallback(() => dispatch(subscribeToEthPrice({ chainId, interval, immediate: true })), [
    dispatch,
    chainId,
    interval,
  ]);

  const subscribeLazy = React.useCallback(
    () => dispatch(subscribeToEthPrice({ chainId, interval, immediate: false })),
    [dispatch, chainId, interval]
  );

  const unsubscribe = React.useCallback(() => dispatch(unsubscribeFromEthPrice({ chainId })), [dispatch, chainId]);

  React.useEffect(() => {
    subscribe();

    window.addEventListener('focus', subscribeLazy);
    window.addEventListener('blur', unsubscribe);

    return () => {
      unsubscribe();

      window.removeEventListener('focus', subscribeLazy);
      window.removeEventListener('blur', unsubscribe);
    };
  }, [dispatch, subscribe, subscribeLazy, unsubscribe]);
}

Content.propTypes = {
  children: t.node.isRequired,
};

const StyledContent = styled(Layout.Content)`
  height: 100%;
  /* Must account for both navbar and footer height */
  min-height: calc(100vh - 4rem - 4rem);
  background-color: ${p => p.theme.color.background.default};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
`;
