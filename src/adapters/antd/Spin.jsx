import React from 'react';
import t from 'prop-types';
import styled, { css } from 'styled-components';
import { Spin as BaseSpin } from 'antd';

export default function Spin({ $centered, ...props }) {
  return <StyledSpin $centered={$centered} {...props} />;
}

Spin.propTypes = {
  $centered: t.bool,
};

Spin.defaultProps = {
  $centered: false,
};

const StyledSpin = styled(BaseSpin)`
  ${props => props.$centered && centeredStyles}
  animation: fadeIn 0.25s cubic-bezier(0.77, 0, 0.175, 1);
  width: 100%;

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
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%);
`;
