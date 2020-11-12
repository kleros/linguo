import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';

function ContentBlocker({ children, blocked, contentBlur, overlayColor, overlayText, className }) {
  return (
    <StyledOverlayWrapper>
      <StyledContentWrapper disabled={blocked} contentBlur={contentBlur} className={className}>
        {children}
      </StyledContentWrapper>
      <StyledOverlay visible={blocked} $overlayColor={overlayColor} />
      {blocked && overlayText && <StyledOverlayText>{overlayText}</StyledOverlayText>}
    </StyledOverlayWrapper>
  );
}

ContentBlocker.propTypes = {
  children: t.node,
  blocked: t.bool,
  contentBlur: t.number,
  overlayColor: t.string,
  overlayText: t.node,
  className: t.string,
};

ContentBlocker.defaultProps = {
  children: null,
  blocked: false,
  contentBlur: 1,
  overlayText: null,
  className: '',
};

export default ContentBlocker;

const StyledOverlayWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const StyledContentWrapper = styled.div`
  filter: ${props => (props.disabled ? `blur(${props.contentBlur}px)` : 'none')};
`;

const StyledOverlay = styled.div`
  display: ${props => (props.visible ? 'block' : 'none')};
  background-color: ${props => props.$overlayColor ?? props.theme.hexToRgba('#fff', 0.5)};
  cursor: not-allowed;
  position: absolute;
  top: -3px;
  right: -3px;
  bottom: -3px;
  left: -3px;
  z-index: 100;
`;

const StyledOverlayText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 101;
  font-weight: ${p => p.theme.fontWeight.medium};
  font-size: ${p => p.theme.fontSize.xl};
  pointer-events: none;
`;
