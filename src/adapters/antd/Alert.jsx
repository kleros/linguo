import styled from 'styled-components';
import { Alert as BaseAlert } from 'antd';

const StyledAlert = styled(BaseAlert)`
  &.ant-alert {
    .ant-alert-message {
      color: ${p => p.theme.hexToRgba(p.theme.color.text.default, 0.85)};
    }

    .ant-alert-description {
      color: ${p => p.theme.hexToRgba(p.theme.color.text.default, 0.65)};

      p + p {
        margin-top: 0;
      }
    }

    :not(.ant-alert-banner) {
      background-color: ${p => p.theme.color.background.light};
      border-radius: 3px;
    }

    &.ant-alert-with-description {
      .anticon {
        transform: translateY(1px);
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
