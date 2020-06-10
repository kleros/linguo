import styled, { css } from 'styled-components';
import { Spin } from 'antd';

const centeredStyles = css`
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const StyledSpin = styled(Spin)`
  ${p => p.$centered && centeredStyles}
`;

export default StyledSpin;
