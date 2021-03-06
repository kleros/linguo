import React from 'react';
import { Titled } from 'react-titled';
import styled, { css } from 'styled-components';
import { Divider } from 'antd';
import AffixContainer from '~/shared/AffixContainer';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListHeader from './TaskListHeader';
import TaskListFetcher from './TaskListFetcher';

function RequesterDashboard() {
  return (
    <Titled title={title => `Requester Dashboard | ${title}`}>
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
          <RequiredWalletGateway message="To view your requested translation tasks you need an Ethereum Wallet.">
            <TaskListFetcher />
          </RequiredWalletGateway>
        </StyledContentWrapper>
      </MultiCardLayout>
    </Titled>
  );
}

export default RequesterDashboard;

const StyledContentWrapper = styled.div`
  @media (max-width: 575.98px) {
    padding: 0 1.5rem;
  }
`;

const StyledDivider = styled(Divider)`
  border-top-color: ${props => props.theme.color.primary.default};
  margin: 1rem 0;

  @media (max-width: 575.98px) {
    border-top-color: transparent;
    margin: 0 0 1rem;
  }
`;
