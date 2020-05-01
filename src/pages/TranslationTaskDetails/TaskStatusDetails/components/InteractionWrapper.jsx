import styled from 'styled-components';

const StyledInteractionWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;

  @media (max-width: 767.98px) {
    width: 50%;
    margin: 0 auto;
  }
`;

export default StyledInteractionWrapper;
