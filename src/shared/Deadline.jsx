import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import styled from 'styled-components';
import RemainingTime from './RemainingTime';
import { HourGlassIcon } from './icons';

const StyledDeadline = styled.div`
  color: ${p => p.theme.color.text.default};
  font-size: ${p => p.theme.fontSize.lg};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.ending-soon {
    color: ${p => p.theme.color.danger.default};
  }
`;

function Deadline({ seconds, className, icon, render }) {
  return (
    <RemainingTime
      initialValueSeconds={seconds}
      render={({ endingSoon, formattedValue }) => render({ endingSoon, formattedValue, className, icon })}
    />
  );
}

Deadline.propTypes = {
  seconds: t.number.isRequired,
  icon: t.element,
  className: t.string,
  render: t.func,
};

Deadline.defaultProps = {
  className: '',
  icon: <HourGlassIcon />,
  render: DefaultDeadlineRender,
};

function DefaultDeadlineRender({ endingSoon, formattedValue, className, icon }) {
  return (
    <StyledDeadline
      className={clsx(className, {
        'ending-soon': endingSoon,
      })}
    >
      {icon !== null && <>{icon} </>}
      <span>{formattedValue}</span>
    </StyledDeadline>
  );
}

DefaultDeadlineRender.propTypes = {
  endingSoon: t.bool.isRequired,
  formattedValue: t.string.isRequired,
  className: t.string,
  icon: t.element,
};

DefaultDeadlineRender.defaultProps = {
  className: '',
  icon: null,
};

export default Deadline;
