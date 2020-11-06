import React from 'react';
import { Titled } from 'react-titled';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Divider } from 'antd';
import { selectIsLoading } from '~/features/translator/translatorSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import TopLoadingBar from '~/shared/TopLoadingBar';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListControls from './TaskListControls';
import TaskListFetcher from './TaskListFetcher';

export default function TranslatorDashboard() {
  const account = useSelector(selectAccount);
  const isLoading = useSelector(state => selectIsLoading(state, { account }));

  return (
    <Titled title={title => `Translator Dashboard | ${title}`}>
      <MultiCardLayout>
        <TopLoadingBar show={isLoading} />
        <TaskListControls />
        <StyledDivider />
        <StyledContentWrapper>
          <TaskListFetcher />
        </StyledContentWrapper>
      </MultiCardLayout>
    </Titled>
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
