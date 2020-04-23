import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';

const StyledOverlayWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledOverlay = styled.div`
  display: ${props => (props.visible ? 'block' : 'none')};
  background-color: ${props => props.theme.hexToRgba('#fff', 0.5)};
  cursor: not-allowed;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
`;

const StyledContentWrapper = styled.div`
  filter: ${props => (props.disabled ? 'blur(1px)' : 'none')};
`;

function ContentBlocker({ children, blocked }) {
  return (
    <StyledOverlayWrapper>
      <StyledContentWrapper disabled={blocked}>{children}</StyledContentWrapper>
      <StyledOverlay visible={blocked} />
    </StyledOverlayWrapper>
  );
}

ContentBlocker.propTypes = {
  children: t.node,
  blocked: t.bool,
};

ContentBlocker.defaultProps = {
  children: null,
  blocked: false,
};

export default ContentBlocker;
