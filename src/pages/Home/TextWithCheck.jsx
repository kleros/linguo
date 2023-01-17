import React from 'react';
import styled from 'styled-components';
import t from 'prop-types';
import { Typography } from 'antd';
import CheckIcon from '~/assets/images/icon-check-circle.svg';

const TitleWithIcon = ({ text, className }) => (
  <Container {...{ className }}>
    <CheckIcon />
    <StyledText> {text} </StyledText>
  </Container>
);

TitleWithIcon.propTypes = {
  text: t.string.isRequired,
  className: t.string,
};

const Container = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  > svg {
    fill: white;
    height: 1.5rem;
    flex-shrink: 0;
  }
`;

const StyledText = styled(Typography.Text)`
  && {
    font-size: ${props => props.theme.fontSize.xxl};
    color: ${props => props.theme.color.text.inverted};
  }
`;

export default TitleWithIcon;
