import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import styled from 'styled-components';
import { subscribeToUpdates, unsubscribeFromUpdates } from '~/features/tasks/tasksSlice';
import { selectAccount, selectChainId } from '~/features/web3/web3Slice';
import { selectLatestBlock } from '~/features/notifications/notificationsSlice';

export default function Content({ children }) {
  const account = useSelector(selectAccount);
  const chainId = useSelector(selectChainId);
  const latestBlock = useSelector(state => selectLatestBlock(state, { chainId, account }));

  const dispatch = useDispatch();

  const subscribe = React.useCallback(
    () => dispatch(subscribeToUpdates({ chainId, account, fromBlock: latestBlock + 1 })),
    [dispatch, account, chainId, latestBlock]
  );
  const unsubscribe = React.useCallback(() => dispatch(unsubscribeFromUpdates()), [dispatch]);

  React.useEffect(() => {
    if (account) {
      subscribe();
      // window.addEventListener('focus', subscribe);
      // window.addEventListener('blur', unsubscribe);

      return () => {
        unsubscribe();
        // window.removeEventListener('focus', subscribe);
        // window.removeEventListener('blur', unsubscribe);
      };
    }
  }, [dispatch, account, subscribe, unsubscribe]);

  return <StyledContent>{children}</StyledContent>;
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
