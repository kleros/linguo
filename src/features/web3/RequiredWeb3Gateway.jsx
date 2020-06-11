import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Alert, Spin } from 'antd';
import { useWeb3React, getErrorMessage } from '~/features/web3';

const StyledAlert = styled(Alert)`
  margin-bottom: 2rem;
`;

const StyledSpin = styled(Spin)`
  &&.ant-spin {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

function Web3ErrorAlert({ web3Error, error, renderError }) {
  const message = getErrorMessage(web3Error);

  return (
    <>
      <StyledAlert type="error" message={message} />
      {error || renderError({ error: message })}
    </>
  );
}

Web3ErrorAlert.propTypes = {
  web3Error: t.instanceOf(Error).isRequired,
  error: t.node,
  renderError: t.func,
};

Web3ErrorAlert.defaultProps = {
  error: null,
  renderError: () => null,
};

function RequiredWeb3Gateway({ children, missing, error, render, renderMissing, renderError }) {
  const { active, activatingConnector, error: web3Error, library } = useWeb3React();
  const hasActivatingConnector = !!activatingConnector;
  const hasError = !!web3Error;

  return (
    <>
      {hasError ? (
        <Web3ErrorAlert web3Error={web3Error} error={error} renderError={renderError} />
      ) : (
        <StyledSpin spinning={hasActivatingConnector} tip="Loading Web3...">
          {active ? children || render({ library }) : missing || renderMissing()}
        </StyledSpin>
      )}
    </>
  );
}

RequiredWeb3Gateway.propTypes = {
  children: t.node,
  missing: t.node,
  error: t.node,
  render: t.func,
  renderMissing: t.func,
  renderError: t.func,
};

RequiredWeb3Gateway.defaultProps = {
  children: null,
  missing: null,
  error: null,
  render: () => null,
  renderMissing: () => null,
  renderError: () => null,
};

export default RequiredWeb3Gateway;
