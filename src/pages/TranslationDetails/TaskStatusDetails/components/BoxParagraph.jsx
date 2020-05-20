import styled from 'styled-components';
import { Typography } from 'antd';

const StyledBoxParagraph = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    font-weight: 400;
    color: ${props => props.theme.color.text.default};
    margin: 0;

    & + & {
      margin-top: 1rem;
    }
  }
`;

export default StyledBoxParagraph;
