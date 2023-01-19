import React from 'react';
import styled, { css } from 'styled-components';
import { smallScreenStyle } from './smallScreenStyle';
import t from 'prop-types';
import { Typography } from 'antd';

const TitleWithIcon = ({ title, icon: Icon }) => (
  <Container>
    <Icon />
    <StyledTitle> {title} </StyledTitle>
  </Container>
);

TitleWithIcon.propTypes = {
  title: t.string.isRequired,
  icon: t.func.isRequired,
  className: t.string,
};

const Container = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  > svg {
    height: 5rem;
    flex-shrink: 0;
  }
  ${smallScreenStyle(css`
    flex-wrap: wrap;
    justify-content: center;
  `)}
`;

const StyledTitle = styled(Typography.Title)`
  && {
    margin: 0;
    font-size: 3rem;
    font-weight: ${p => p.theme.fontWeight.semibold};
    color: ${props => props.theme.color.text.inverted};
  }
`;

export default TitleWithIcon;
