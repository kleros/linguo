import styled from 'styled-components';
import { Card } from 'antd';

const StyledCard = styled(Card)`
  &.ant-card {
    border: none;
    border-radius: 0.625rem;
    box-shadow: 0 0.375rem 2rem ${props => props.theme.shadow.default};
    font-size: 1rem;
    color: ${props => props.theme.text.default};
  }

  .ant-card-head {
    background-color: ${props => props.theme.primary.default};
    color: ${props => props.theme.text.inverted};
    border: none;
    border-top-left-radius: 0.625rem;
    border-top-right-radius: 0.625rem;
  }

  .ant-card-head-wrapper {
    height: 3.75rem;
  }

  .ant-card-head-title {
    text-align: center;
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

export { StyledCard as default };
