import React from 'react';
import KlerosFooter from '@kleros/react-components/dist/footer';
import styled from 'styled-components';

const StyledKlerosFooter = styled(KlerosFooter)`
  background-color: #0043c5;

  a {
    color: #fff;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
`;

function Footer() {
  return (
    <StyledKlerosFooter appName="Linguo" contractExplorerURL="#" repository="https://github.com/kleros" locale="en" />
  );
}

export default Footer;
