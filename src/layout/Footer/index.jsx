import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import KlerosFooter from '@kleros/react-components/dist/footer';
import * as r from '~/app/routes';

export default function Footer() {
  return (
    <StyledKlerosFooter
      appName="Linguo"
      contractExplorerURL=""
      renderHelpLink={({ content, icon }) => (
        <Link to={r.FAQ}>
          {content} {icon}
        </Link>
      )}
      repository="https://github.com/kleros/linguo"
      locale="en"
    />
  );
}

const StyledKlerosFooter = styled(KlerosFooter)`
  && {
    background-color: ${p => p.theme.color.primary.default};
    a {
      color: ${p => p.theme.color.text.inverted};

      svg {
        transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
      }

      :hover,
      :focus,
      :active {
        color: ${p => p.theme.color.text.inverted};
        text-shadow: 0 0 5px ${p => p.theme.color.glow.default};
        transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

        svg {
          filter: drop-shadow(0 0 2px ${p => p.theme.color.glow.default});
        }
      }
    }
  }
`;
