import React from 'react';
import t from 'prop-types';
import { useSelector } from 'react-redux';
import { Spin } from '~/adapters/antd';
import getErrorMessage from '~/adapters/web3React/getErrorMessage';
import { selectError, selectHasError, selectIsConnected, selectIsConnecting } from './web3Slice';

function RequiredWeb3Gateway({ children, missing, error, renderError }) {
  const hasWeb3Error = useSelector(selectHasError);
  const web3Error = useSelector(selectError);
  const isConnected = useSelector(selectIsConnected);
  const isConnecting = useSelector(selectIsConnecting);

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
