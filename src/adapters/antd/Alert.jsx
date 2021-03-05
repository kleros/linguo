import styled from 'styled-components';
import { Alert as BaseAlert } from 'antd';

const StyledAlert = styled(BaseAlert)`
  &.ant-alert {
    background-color: ${p => p.theme.color.background.light};
    border-radius: 3px;

    > .anticon {
      top: 50%;
      transform: translateY(-50%);
    }

    > .ant-alert-description {
      p + p {
        margin-top: 0;
      }
    }

    &.ant-alert-info {
      border-color: ${p => p.theme.color.info.default};

      > .ant-alert-icon,
      > .ant-alert-message {
        color: ${p => p.theme.color.info.default};
      }
    }

    &.ant-alert-warning {
      border-color: ${p => p.theme.color.warning.default};

      > .ant-alert-icon,
      > .ant-alert-message {
        color: ${p => p.theme.color.warning.default};
      }
    }

    &.ant-alert-error {
      border-color: ${p => p.theme.color.danger.default};

      > .ant-alert-icon,
      > .ant-alert-message {
        color: ${p => p.theme.color.danger.default};
      }
    }

    &.ant-alert-success {
      border-color: ${p => p.theme.color.success.light};

      > .ant-alert-icon,
      > .ant-alert-message {
        color: ${p => p.theme.color.success.light};
      }
    }
  }
`;

export default StyledAlert;
