import React from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';

const StyledSpin = styled(Spin)`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

function Spinner() {
  return <StyledSpin tip="Loading status information..." />;
}

export default Spinner;
