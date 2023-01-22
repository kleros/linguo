import React from 'react';
import t from 'prop-types';
import { useSelector } from 'react-redux';
import { Spin } from '~/adapters/antd';
import getErrorMessage from '~/adapters/web3-react/getErrorMessage';
import { selectError, selectHasError, selectIsConnecting } from '~/features/web3/web3Slice';
import { useWeb3 } from '~/hooks/useWeb3';
import { injected } from '~/connectors';

function RequiredWeb3Gateway({ children, missing, error, renderError }) {
  const hasWeb3Error = useSelector(selectHasError);
  const web3Error = useSelector(selectError);
  const isConnecting = useSelector(selectIsConnecting);
  const { active, chainId, connector } = useWeb3();

  const isConnected = active && chainId && connector.name === injected.name;

  return hasWeb3Error ? (
    error ?? renderError({ error: getErrorMessage(web3Error) })
  ) : (
    <Spin $centered spinning={isConnecting} tip="Loading Web3...">
      {isConnected ? children : missing}
    </Spin>
  );
}

RequiredWeb3Gateway.propTypes = {
  children: t.node,
  missing: t.node,
  error: t.node,
  renderError: t.func,
  render: t.func,
};

RequiredWeb3Gateway.defaultProps = {
  children: null,
  missing: null,
  error: null,
  renderError: () => null,
};

export default RequiredWeb3Gateway;
