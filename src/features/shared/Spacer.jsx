import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';

const StyledVerticalSpacer = styled.div`
  display: block;
  clear: both;
  height: calc(${p => p.theme.fontSize[p.baseSize] || '1rem'} * ${p => p.size});
`;

const StyledHorizontalSpacer = styled.div`
  display: inline-block;
  width: calc(${p => p.theme.fontSize[p.baseSize] || '1rem'} * ${p => p.size});
`;

function Spacer({ baseSize, size, orientation, className }) {
  const Component = orientation === 'vertical' ? StyledVerticalSpacer : StyledHorizontalSpacer;
  return <Component className={className} baseSize={baseSize} size={size} />;
}

Spacer.propTypes = {
  baseSize: t.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
  size: t.number,
  orientation: t.oneOf(['vertical', 'horizontal']),
  className: t.string,
};

Spacer.defaultProps = {
  baseSize: 'md',
  size: 1,
  orientation: 'vertical',
  className: '',
};

export default Spacer;
