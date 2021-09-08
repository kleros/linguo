import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Divider, Popover as AntdPopover } from 'antd';

export default function Popover({ content, footer, ...props }) {
  return (
    <StyledPopover
      content={
        footer ? (
          <>
            {content}
            <StyledPopoverFooter>
              <StyledPopoverFooterDivider />
              {footer}
            </StyledPopoverFooter>
          </>
        ) : (
          content
        )
      }
      {...props}
    ></StyledPopover>
  );
}

Popover.propTypes = {
  content: t.node,
  footer: t.node,
};

Popover.defaultProps = {
  children: null,
  footer: null,
};

function BasePopover({ className, ...props }) {
  return <AntdPopover autoAdjustOverflow overlayClassName={className} {...props} />;
}

BasePopover.propTypes = {
  className: t.string,
};

Popover.defaultProps = {
  className: '',
};

const StyledPopover = styled(BasePopover)`
  z-index: 300;
  .ant-popover-arrow {
    transform: scale(2.5) translateY(-1px);
  }

  .ant-popover-inner {
    border-radius: 3px;
    padding: 1rem 2rem;
    box-shadow: 0 3px 6px 4px ${props => props.theme.color.shadow.default};
  }

  .ant-popover-title {
    border-bottom: none;
    font-size: ${props => props.theme.fontSize.xxl};
    font-weight: ${props => props.theme.fontWeight.semibold};
    text-align: center;
    padding: 0;
  }

  .ant-popover-inner-content {
    padding-left: 0;
    padding-right: 0;
  }

  @media (max-width: 575.98px) {
    width: 100%;

    .ant-popover-inner {
      border-radius: 0;
    }
  }
`;

const StyledPopoverFooterDivider = styled(Divider)`
  margin-bottom: 0.5rem;
`;

const StyledPopoverFooter = styled.footer`
  color: ${p => p.theme.color.secondary.default};
  font-size: ${p => p.theme.fontSize.sm};
  text-align: center;

  && {
    margin-bottom: -16px;
  }
`;
