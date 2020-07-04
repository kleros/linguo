import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Divider } from 'antd';
import { selectIsLoading } from '~/features/translator/translatorSlice';
import TopLoadingBar from '~/shared/TopLoadingBar';
import { selectAccount } from '~/features/web3/web3Slice';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListControls from './TaskListControls';
import TaskListFetcher from './TaskListFetcher';

export default function TranslatorDashboard() {
  const account = useSelector(selectAccount);
  const isLoading = useSelector(selectIsLoading(account));

  return (
    <MultiCardLayout>
      <TopLoadingBar show={isLoading} />
      <TaskListControls />
      <StyledDivider />
      <StyledContentWrapper>
        <TaskListFetcher />
      </StyledContentWrapper>
    </MultiCardLayout>
  );
}

const StyledDivider = styled(Divider)`
  border-top-color: ${props => props.theme.color.primary.default};
  margin: 2.5rem 0;

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
