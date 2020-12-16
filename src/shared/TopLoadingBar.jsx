import React from 'react';
import { createPortal } from 'react-dom';
import t from 'prop-types';
import clsx from 'clsx';
import { Progress } from 'antd';
import styled from 'styled-components';

export default function TopLoadingBar({ show }) {
  return createPortal(<LocalTopLoadingBar show={show} />, document.querySelector('#top-loading-bar'));
}

TopLoadingBar.propTypes = {
  show: t.bool.isRequired,
};

export function LocalTopLoadingBar({ show }) {
  return (
    <StyledWrapper>
      <StyledProgress className={clsx({ show })} status="active" percent={100} showInfo={false} strokeWidth={5} />
    </StyledWrapper>
  );
}

LocalTopLoadingBar.propTypes = {
  show: t.bool.isRequired,
};

TopLoadingBar.propTypes = {
  show: t.bool.isRequired,
};

const StyledWrapper = styled.div`
  position: absolute;
  z-index: 10;
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
