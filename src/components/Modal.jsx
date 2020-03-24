import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Modal as BaseModal } from 'antd';
import { createCustomIcon } from '~/adapters/antd';
import _RemoveIcon from '~/assets/images/icon-remove.svg';

const StyledRemoveIcon = styled(createCustomIcon(_RemoveIcon))`
  width: 1.75rem;
  height: 1.75rem;

  svg {
    width: 100%;
    height: auto;
  }
`;

const StyledModal = styled(BaseModal)`
  && {
    .ant-modal-content {
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .ant-modal-header {
      background-color: ${props => props.theme.primary.default};
    }

    .ant-modal-title,
    .ant-modal-close {
      color: ${props => props.theme.text.inverted};
    }

    .ant-modal-close-x {
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

      :hover {
        filter: drop-shadow(0 0 2px ${({ theme }) => theme.glow.default});
      }
    }
  }
`;

function Modal({ centered, ...props }) {
  return <StyledModal {...props} centered={centered} closeIcon={<StyledRemoveIcon />} />;
}

Modal.propTypes = {
  centered: t.bool,
};

Modal.defaultProps = {
  centered: false,
};

export default Modal;
