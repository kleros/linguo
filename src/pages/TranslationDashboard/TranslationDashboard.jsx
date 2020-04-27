import React from 'react';
import styled from 'styled-components';
import { Divider } from 'antd';
import LinguoApiReadyGateway from '~/components/LinguoApiReadyGateway';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListControls from './TaskListControls';
import TaskListFetcher from './TaskListFetcher';

const StyledDivider = styled(Divider)`
  background: ${props => props.theme.color.primary.default};
  margin: 2.5rem 0;

  @media (max-width: 575.98px) {
    background: none;
    margin: 0 0 1rem;
  }
`;

const StyledContentWrapper = styled.div`
  @media (max-width: 575.98px) {
    padding: 0 1.5rem;
  }
`;

function TranslationDashboard() {
  return (
    <MultiCardLayout>
      <TaskListControls />
      <StyledDivider />
      <LinguoApiReadyGateway>
        <StyledContentWrapper>
          <RequiredWalletGateway message="To view your requested translation tasks you need an Ethereum wallet.">
            <TaskListFetcher />
          </RequiredWalletGateway>
        </StyledContentWrapper>
      </LinguoApiReadyGateway>
    </MultiCardLayout>
  );
}

export default TranslationDashboard;
