import styled from 'styled-components';

const BoxWrapper = styled.div`
  border-radius: 9px;
  padding: 2rem;
  border: 1px solid ${p => p.theme.color.border.default};
  background-color: ${p => p.theme.color.background.default};
`;

export default BoxWrapper;
