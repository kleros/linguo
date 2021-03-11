import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Switch } from 'antd';

export default function TaskOwnershipFilter({ fullWidth, onChange, value, className }) {
  return (
    <StyledLabel $fullWidth={fullWidth} className={className}>
      <span className="switch-button">
        <Switch checked={value === options.AllTasks} onChange={onChange} />
      </span>
      <span className="switch-label">{value === options.AllTasks ? 'All Tasks' : 'My Tasks'}</span>
    </StyledLabel>
  );
}

const options = {
  AllTasks: true,
  MyTasks: false,
};

TaskOwnershipFilter.propTypes = {
  fullWidth: t.bool,
  onChange: t.func,
  value: t.oneOf(Object.values(options)),
  className: t.string,
};

TaskOwnershipFilter.defaultProps = {
  fullWidth: false,
  onChange: () => {},
  value: options.MyTasks,
  className: '',
};

TaskOwnershipFilter.Options = options;

const StyledLabel = styled.label`
  display: ${p => (p.$fullWidth ? 'flex' : 'inline-flex')};
  width: ${p => (p.$fullWidth ? '100%' : 'auto')};
  align-items: center;
  gap: 0.75rem;
  font-weight: ${p => p.theme.fontWeight.regular};
  font-size: ${p => p.theme.fontSize.sm};
  white-space: nowrap;
`;
