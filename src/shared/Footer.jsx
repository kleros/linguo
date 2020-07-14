import React from 'react';
import KlerosFooter from '@kleros/react-components/dist/footer';
import styled from 'styled-components';

const StyledKlerosFooter = styled(KlerosFooter)`
  background-color: #0043c5;

  a {
    color: ${p => p.theme.color.text.inverted};

    &:hover {
      color: ${p => p.theme.color.text.inverted};
      text-shadow: 0 0 5px ${p => p.theme.hexToRgba(p.theme.color.text.inverted, 0.25)};
    }
  }
`;

function Footer() {
  return (
    <StyledKlerosFooter appName="Linguo" contractExplorerURL="#" repository="https://github.com/kleros" locale="en" />
  );
}

export default Footer;
