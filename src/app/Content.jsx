import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Layout } from 'antd';
import { nanoid } from 'nanoid';

import { subscribeToEthPrice, unsubscribeFromEthPrice } from '~/features/tokens/tokensSlice';
import { useWeb3 } from '~/hooks/useWeb3';
import { useDispatch } from 'react-redux';

export default function Content({ children }) {
  useEthPricePolling();

  return <StyledContent>{children}</StyledContent>;
}

const groupId = nanoid(10);
const _1_MINUTE = 60 * 1000;

function useEthPricePolling({ interval = _1_MINUTE } = {}) {
  const { chainId } = useWeb3();
  const dispatch = useDispatch();

  const subscribe = React.useCallback(
    () => dispatch(subscribeToEthPrice({ chainId, interval, immediate: true }, { meta: { groupId } })),
    [dispatch, chainId, interval]
  );

  const subscribeLazy = React.useCallback(
    () => dispatch(subscribeToEthPrice({ chainId, interval, immediate: false }, { meta: { groupId } })),
    [dispatch, chainId, interval]
  );

  const unsubscribe = React.useCallback(
    () => dispatch(unsubscribeFromEthPrice({ chainId }, { meta: { groupId } })),
    [dispatch, chainId]
  );

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
