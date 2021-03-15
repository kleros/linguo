import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { BugFilled } from '@ant-design/icons';
import * as r from '~/app/routes';
import AntdButton from '~/adapters/antd/Button';
import { BookIcon, EthIcon, HelpIcon } from '~/shared/icons';
import Popover from '~/adapters/antd/Popover';
import SystemTrayButton from './SystemTrayButton';

export default function HelpNav() {
  return (
    <StyledPopover
      arrowPointAtCenter
      placement="bottomRight"
      trigger="click"
      content={
        <StyledNav>
          <Link to={r.FAQ} component={LinkButton} icon={<HelpIcon />}>
            FAQ
          </Link>
          <LinkButton
            icon={<BugFilled />}
            href="//github.com/kleros/linguo/issues"
            target="_blank"
            rel="noreferrer noopener"
          >
            Report a Bug
          </LinkButton>
          <LinkButton
            icon={<BookIcon />}
            href="//blog.kleros.io/linguo-decentralized-translation-platform/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Dapp Guide
          </LinkButton>
          <LinkButton
            icon={<EthIcon />}
            href="//blog.coinbase.com/a-beginners-guide-to-ethereum-46dd486ceecf"
            target="_blank"
            rel="noreferrer noopener"
          >
            Crypto Beginner&rsquo;s Guide
          </LinkButton>
        </StyledNav>
      }
    >
      <SystemTrayButton icon={<HelpIcon />}></SystemTrayButton>
    </StyledPopover>
  );
}

const StyledPopover = styled(Popover)`
  width: 16rem;
`;

const StyledNav = styled.nav`
  > a {
    display: block;
    text-align: left;
  }
`;

function LinkButton({ children, icon, ...rest }) {
  return (
    <StyledLinkButton {...rest} type="link" icon={icon}>
      <span className="btn-text">{children}</span>
    </StyledLinkButton>
  );
}

LinkButton.propTypes = {
  children: t.node.isRequired,
  icon: t.node.isRequired,
};

const StyledLinkButton = styled(AntdButton)`
  padding-left: 0;
  padding-right: 0;

  .btn-text {
    color: ${p => p.theme.color.text.default};
  }

  :hover,
  :focus {
    .btn-text {
      text-decoration: underline;
    }
  }
`;
