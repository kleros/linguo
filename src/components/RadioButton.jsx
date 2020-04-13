import { Radio } from 'antd';
import styled from 'styled-components';

export default styled(Radio.Button)`
  && {
    min-width: 0;
    padding-left: 1rem;
    padding-right: 1rem;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: ${props => props.theme.fontSize.xs};
    color: ${props => props.theme.primary.default};
    border: 1px solid ${props => props.theme.primary.default};
    border-radius: 1rem;
    background-color: ${props => props.theme.background.light};
    fill: currentColor;
    transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

    ::before,
    ::after {
      display: none;
    }

    :active,
    :focus,
    :hover {
      color: ${props => props.theme.primary.default};
      background-color: ${props => props.theme.background.default};
      border-color: currentColor;
    }

    &.ant-radio-button-wrapper-checked:not([class*=' ant-radio-button-wrapper-disabled']).ant-radio-button-wrapper:first-child {
      border-color: ${props => props.theme.primary.default};
    }

    &.ant-radio-button-wrapper-disabled,
    &.ant-radio-button-wrapper-disabled:hover {
      background-color: #e9e9e9;
      color: #999;
      border-color: currentColor;
    }

    &.ant-radio-button-wrapper-checked {
      color: ${props => props.theme.text.inverted};
      background-color: ${props => props.theme.primary.default};
      border-color: ${props => props.theme.primary.default};
    }

    &.ant-radio-button-wrapper-checked.ant-radio-button-wrapper-disabled,
    &.ant-radio-button-wrapper-checked.ant-radio-button-wrapper-disabled:hover {
      background-color: #999;
      border-color: #999;
      color: #e9e9e9;
    }

    &.ant-radio-button-wrapper-checked:focus-within {
      box-shadow: none;
    }
  }
`;
