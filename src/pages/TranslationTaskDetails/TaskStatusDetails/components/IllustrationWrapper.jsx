import styled from 'styled-components';

const StyledIllustrationWrapper = styled.div`
  display: flex;
  justify-content: flex-end;

  > svg {
    max-width: 10rem;
  }

  @media (max-width: 767.98px) {
    justify-content: center;
  }
`;

export default StyledIllustrationWrapper;
