import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography } from 'antd';

const StyledDescription = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    color: ${props => props.theme.color.text.default};
    margin: 0;

    & + & {
      margin-top: 1rem;
    }
  }
`;

function StatusDescription({ items, className }) {
  return items.map((paragraph, index) => (
    <StyledDescription key={index} className={className}>
      {paragraph}
    </StyledDescription>
  ));
}

StatusDescription.propTypes = {
  items: t.arrayOf(t.node),
  className: t.string,
};

StatusDescription.defaultProps = {
  items: [],
  className: '',
};

export default StatusDescription;
