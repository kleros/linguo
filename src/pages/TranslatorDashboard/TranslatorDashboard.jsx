import React from 'react';
import { Titled } from 'react-titled';
import styled, { css } from 'styled-components';
import { Divider } from 'antd';

import AffixContainer from '~/shared/AffixContainer';
import MultiCardLayout from '~/layout/MultiCardLayout';
import TaskListFetcher from './TaskListFetcher';

import { withRequiredSkills } from './withRequiredSkills';
import { TasksFilterProvider } from '~/context/TasksFilterProvider';

import TaskListHeader from '~/components/Task/TaskListHeader';
import TaskStatusFilterContainer from '~/components/Task/TaskStatusFilterContainer';
import TaskOwnershipFilterContainer from '~/components/Task/TaskOwnershipFilterContainer';

const WrappedTranslatorDashboard = () => {
  return (
    <Titled title={title => `Translator Dashboard | ${title}`}>
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
            <TaskListHeader title="Translator">
              <StyledTaskOwnershipFilterWrapper>
                <TaskOwnershipFilterContainer />
              </StyledTaskOwnershipFilterWrapper>
              <StyledTaskFilterWrapper>
                <TaskStatusFilterContainer />
              </StyledTaskFilterWrapper>
            </TaskListHeader>
          </AffixContainer>
          <StyledDivider />
          <StyledContentWrapper>
            <TaskListFetcher />
          </StyledContentWrapper>
        </TasksFilterProvider>
      </MultiCardLayout>
    </Titled>
  );
};

const TranslatorDashboard = withRequiredSkills(WrappedTranslatorDashboard);
export default TranslatorDashboard;

const StyledDivider = styled(Divider)`
  border-top-color: ${props => props.theme.color.primary.default};
  margin: 1rem 0;

  @media (max-width: 575.98px) {
    border-top-color: transparent;
    margin: 0 0 1rem;
  }
`;

const StyledTaskFilterWrapper = styled.div`
  flex: 14rem 1 1;
  min-width: 8rem;
  max-width: 14rem;
}`;

const StyledTaskOwnershipFilterWrapper = styled.div`
  flex: 8rem 0 0;
  min-width: 8rem;
  max-width: 8rem;
  
  :empty {
    display: none;
  }
}`;

const StyledContentWrapper = styled.div`
  @media (max-width: 575.98px) {
    padding: 0 1.5rem;
  }
`;
