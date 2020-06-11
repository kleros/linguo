import styled, { css } from 'styled-components';
import { Spin } from 'antd';

export default styled(Spin).attrs(props => ({
  ...props,
  $centered: props.$centered ?? true,
}))`
  ${props => props.$centered && centeredStyles}
`;

const centeredStyles = css`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
