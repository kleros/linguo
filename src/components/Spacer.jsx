import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';

const StyledVerticalSpacer = styled.div`
  display: block;
  clear: both;
  height: calc(${p => p.theme.fontSize[p.baseSize] || '1rem'} * ${p => p.span});
`;

const StyledHorizontalSpacer = styled.div`
  display: inline-block;
  width: calc(${p => p.theme.fontSize[p.baseSize] || '1rem'} * ${p => p.span});
`;

function Spacer({ baseSize, span, orientation }) {
  const Component = orientation === 'vertical' ? StyledVerticalSpacer : StyledHorizontalSpacer;
  return <Component baseSize={baseSize} span={span} />;
}

Spacer.propTypes = {
  baseSize: t.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
  span: t.number,
  orientation: t.oneOf(['vertical', 'horizontal']),
};

Spacer.defaultProps = {
  baseSize: 'md',
  span: 1,
  orientation: 'vertical',
};

export default Spacer;
