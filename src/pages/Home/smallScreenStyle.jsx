import { css } from 'styled-components';

export const smallScreenStyle = style => css`
  @media (max-width: 1250px) {
    ${style}
  }
`;
