import styled, { css } from 'styled-components';
import { Spin } from 'antd';

export default styled(Spin).attrs(props => ({
  ...props,
  $centered: props.$centered ?? true,
}))`
  ${props => props.$centered && centeredStyles}
  animation: fadeIn 0.25s cubic-bezier(0.77, 0, 0.175, 1);

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const centeredStyles = css`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
