import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { InfoIcon, WarningIcon } from '~/shared/icons';
import { dismissAlert, selectAlertIsVisible } from './uiSlice';

export default function DismissableAlert({ id, type, showIcon, banner, message, description, className }) {
  const dispatch = useDispatch();

  const handleDismiss = React.useCallback(() => {
    dispatch(dismissAlert({ id }));
  }, [dispatch, id]);

  const isVisible = useSelector(selectAlertIsVisible(id));

  return isVisible ? (
    <StyledAlert
      closable
      banner={banner}
      onClose={handleDismiss}
      showIcon={showIcon}
      className={className}
      message={message}
      description={description}
      icon={!showIcon ? null : typeToIconMap[type]}
      type={type}
    />
  ) : null;
}

DismissableAlert.propTypes = {
  className: t.string,
  banner: t.bool,
  description: t.node,
  id: t.string.isRequired,
  message: t.node.isRequired,
  showIcon: t.bool,
  type: t.oneOf(['info', 'warning', 'error', 'success']),
};

DismissableAlert.defaultProps = {
  className: '',
  description: null,
  showIcon: true,
  banner: false,
  type: 'info',
};

const typeToIconMap = {
  info: <InfoIcon />,
  warning: <WarningIcon />,
  error: <CloseCircleOutlined />,
  success: <CheckCircleOutlined />,
};

const StyledAlert = styled(Alert)`
  & + & {
    margin-top: 1rem;
  }
`;
