import React from 'react';
import { Titled } from 'react-titled';
import styled, { css } from 'styled-components';
import { Divider } from 'antd';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import AffixContainer from '~/shared/AffixContainer';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListHeader from './TaskListHeader';
import TaskListFetcher from './TaskListFetcher';

export default function TranslatorDashboard() {
  return (
    <Titled title={title => `Translator Dashboard | ${title}`}>
      <MultiCardLayout>
        <AffixContainer
          position="top"
          css={`
            min-width: 384px;

            @media (max-width: 575.98px) {
              padding: 0;
            }
          `}
          wrapperCss={css`
            && {
              padding: 0 3rem;

              @media (max-width: 575.98px) {
                padding: 0;
              }
            }
          `}
        >
          <TaskListHeader />
        </AffixContainer>
        <StyledDivider />
        <StyledContentWrapper>
          <RequiredWalletGateway message="To view the available translation tasks you need an Ethereum Wallet.">
            <TaskListFetcher />
          </RequiredWalletGateway>
        </StyledContentWrapper>
      </MultiCardLayout>
    </Titled>
  );
}

const StyledDivider = styled(Divider)`
  border-top-color: ${props => props.theme.color.primary.default};
  margin: 1rem 0;

  @media (max-width: 575.98px) {
    border-top-color: transparent;
    margin: 0 0 1rem;
  }
`;

const StyledContentWrapper = styled.div`
  @media (max-width: 575.98px) {
    padding: 0 1.5rem;
  }
`;
