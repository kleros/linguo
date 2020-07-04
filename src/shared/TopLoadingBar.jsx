import React from 'react';
import t from 'prop-types';
import clsx from 'clsx';
import { Progress } from 'antd';
import styled from 'styled-components';

export default function TopLoadingBar({ show }) {
  return (
    <StyledWrapper>
      <StyledProgress className={clsx({ show })} status="active" percent={99.9999} showInfo={false} strokeWidth={5} />
    </StyledWrapper>
  );
}

TopLoadingBar.propTypes = {
  show: t.bool.isRequired,
};

const StyledWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

const StyledProgress = styled(Progress)`
  display: block;
  line-height: 0;
  opacity: 0;
  transition: opacity 0.25s cubic-bezier(0.77, 0, 0.175, 1);

  &.show {
    opacity: 1;
  }

  .ant-progress-inner {
    border-radius: 0;
  }

  .ant-progress-bg {
    border-radius: 0;
    background-color: ${p => p.theme.color.secondary.default};
  }
`;
