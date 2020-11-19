import React from 'react';
import { Titled } from 'react-titled';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { Divider } from 'antd';
import { selectIsLoading } from '~/features/requester/requesterSlice';
import TopLoadingBar from '~/shared/TopLoadingBar';
import AffixContainer from '~/shared/AffixContainer';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import { selectAccount } from '~/features/web3/web3Slice';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListControls from './TaskListControls';
import TaskListFetcher from './TaskListFetcher';

function RequesterDashboard() {
  const account = useSelector(selectAccount);
  const isLoading = useSelector(state => selectIsLoading(state, { account }));

  return (
    <Titled title={title => `Requester Dashboard | ${title}`}>
      <MultiCardLayout>
        <TopLoadingBar show={isLoading} />
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
          <TaskListControls />
        </AffixContainer>
        <StyledDivider />
        <StyledContentWrapper>
          <RequiredWalletGateway message="To view your requested translation tasks you need an Ethereum wallet.">
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
  margin: 2.5rem 0;

  @media (max-width: 575.98px) {
    border-top-color: transparent;
    margin: 0 0 1rem;
  }
`;
