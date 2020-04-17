import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { Alert } from 'antd';
import { InfoIcon } from '~/components/icons';

const StyledAlert = styled(Alert)`
  && {
    margin-bottom: 1rem;
  }
`;

const iconMap = {
  info: <InfoIcon />,
};

function WithRouteMessage({ children, render, type }) {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <>
      {message && <StyledAlert closable showIcon icon={iconMap[type]} message={message} type={type} />}
      {children || render({ message })}
    </>
  );
}

WithRouteMessage.propTypes = {
  children: t.node,
  render: t.func,
  type: t.oneOf(['info', 'alert', 'success', 'error']),
};

WithRouteMessage.defaultProps = {
  type: 'info',
  children: null,
  render: () => null,
};

export default WithRouteMessage;
