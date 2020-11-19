import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import { nanoid } from 'nanoid';
import { selectLatestBlock } from '~/features/notifications/notificationsSlice';
import { subscribeToUpdates, unsubscribeFromUpdates, updateTransientNotifications } from '~/features/tasks/tasksSlice';
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
    () => dispatch(subscribeToUpdates({ chainId, account, fromBlock: latestBlock + 1 }, { meta: { groupId } })),
    [dispatch, account, chainId, latestBlock]
  );
  const unsubscribe = React.useCallback(() => dispatch(unsubscribeFromUpdates({}, { meta: { groupId } })), [dispatch]);

  React.useEffect(() => {
    dispatch(updateTransientNotifications({ account, chainId }));
  }, [dispatch, account, chainId]);

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

const groupId = nanoid(10);
const _1_MINUTE = 60 * 1000;

function useEthPricePolling({ interval = _1_MINUTE } = {}) {
  const dispatch = useDispatch();

  const chainId = useSelector(selectChainId);

  const subscribe = React.useCallback(
    () => dispatch(subscribeToEthPrice({ chainId, interval, immediate: true }, { meta: { groupId } })),
    [dispatch, chainId, interval]
  );

  const subscribeLazy = React.useCallback(
    () => dispatch(subscribeToEthPrice({ chainId, interval, immediate: false }, { meta: { groupId } })),
    [dispatch, chainId, interval]
  );

  const unsubscribe = React.useCallback(() => dispatch(unsubscribeFromEthPrice({ chainId }, { meta: { groupId } })), [
    dispatch,
    chainId,
  ]);

  React.useEffect(() => {
    subscribe();
    return () => {
      unsubscribe();
    };
  }, [dispatch, subscribe, unsubscribe]);

  React.useEffect(() => {
    window.addEventListener('focus', subscribeLazy);
    window.addEventListener('blur', unsubscribe);

    return () => {
      window.removeEventListener('focus', subscribeLazy);
      window.removeEventListener('blur', unsubscribe);
    };
  }, [dispatch, subscribeLazy, unsubscribe]);
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
