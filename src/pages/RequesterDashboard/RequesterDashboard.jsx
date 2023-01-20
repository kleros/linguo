import React from 'react';
import { Titled } from 'react-titled';
import styled, { css } from 'styled-components';
import { Divider } from 'antd';
import AffixContainer from '~/shared/AffixContainer';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import MultiCardLayout from '../../layout/MultiCardLayout';
import TaskListFetcher from './TaskListFetcher';
import { TasksFilterProvider } from '~/context/TasksFilterProvider';
import TaskStatusFilterContainer from '~/components/Task/TaskStatusFilterContainer';
import TaskListHeader from '~/components/Task/TaskListHeader';

function RequesterDashboard() {
  return (
    <Titled title={title => `Requester Dashboard | ${title}`}>
      <MultiCardLayout>
        <TasksFilterProvider>
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
            <TaskListHeader title="Requester">
              <StyledTaskFilterWrapper>
                <TaskStatusFilterContainer />
              </StyledTaskFilterWrapper>
            </TaskListHeader>
          </AffixContainer>
          <StyledDivider />
          <StyledContentWrapper>
            <RequiredWalletGateway message="To view your requested translation tasks you need an Ethereum Wallet.">
              <TaskListFetcher />
            </RequiredWalletGateway>
          </StyledContentWrapper>
        </TasksFilterProvider>
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

const StyledTaskFilterWrapper = styled.div`
  flex: 14rem 1 1;
  min-width: 8rem;
  max-width: 14rem;
}`;

const StyledDivider = styled(Divider)`
  border-top-color: ${props => props.theme.color.primary.default};
  margin: 1rem 0;

  @media (max-width: 575.98px) {
    border-top-color: transparent;
    margin: 0 0 1rem;
  }
`;
