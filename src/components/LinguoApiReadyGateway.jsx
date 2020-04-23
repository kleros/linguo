import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Spin, Alert } from 'antd';
import { useLinguo } from '~/app/linguo';

const StyledSpin = styled(Spin)`
  &&.ant-spin {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const StyledAlert = styled(Alert)`
  margin-bottom: 2rem;
`;

function LinguoApiReadyGateway({ children }) {
  const { tag, error } = useLinguo();
  const isLoading = tag === 'uninitialized';
  const isError = tag === 'error';
  const isReady = tag === 'ready';

  return (
    <StyledSpin spinning={isLoading} tip="Loading Linguo metadata...">
      {!!isError && <StyledAlert type="error" message={error?.message ?? error} />}
      {isReady && children}
    </StyledSpin>
  );
}

LinguoApiReadyGateway.propTypes = {
  children: t.node,
};

LinguoApiReadyGateway.defaultProps = {
  children: null,
};

export default LinguoApiReadyGateway;
