import styled, { css } from 'styled-components';

const outlinedStyles = css`
  border: 1px solid ${p => p.theme.color.primary.default};
`;

const filledStyles = css`
  background: ${p => p.theme.color.background.default};
`;

const BoxWrapper = styled.div`
  border-radius: 0.75rem;
  padding: 2rem;
  ${p => (p.variant === 'outlined' ? outlinedStyles : filledStyles)}
`;

export default BoxWrapper;
