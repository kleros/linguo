import styled, { css } from 'styled-components';
import { Popover } from '~/adapters/antd';

export { Popover };

const iconStyles = css`
  width: 100%;
  height: 100%;

  svg {
    width: 100%;
    height: 100%;
    fill: ${props => props.theme.color.text.inverted};
    color: ${props => props.theme.color.text.inverted};
  }
`;

export const withToolbarStylesIcon = IconComponent => styled(IconComponent)`
  ${iconStyles}
`;
