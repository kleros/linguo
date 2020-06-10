import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Divider } from 'antd';
import * as r from '~/app/routes';
import LinguoApiReadyGateway from '~/components/LinguoApiReadyGateway';
import { selectAllSkillLanguages } from '~/features/translator/translatorSlice';
import MultiCardLayout from '../layouts/MultiCardLayout';
import TaskListControls from './TaskListControls';
import TaskListFetcher from './TaskListFetcher';

export default function TranslatorDashboard() {
  const languages = useSelector(selectAllSkillLanguages);

  return languages.length === 0 ? (
    <Redirect
      to={{
        pathname: r.TRANSLATOR_SETTINGS,
        state: {
          message: 'Please set your language skills first.',
        },
      }}
    />
  ) : (
    <MultiCardLayout>
      <TaskListControls />
      <StyledDivider />
      <LinguoApiReadyGateway>
        <StyledContentWrapper>
          <TaskListFetcher />
        </StyledContentWrapper>
      </LinguoApiReadyGateway>
    </MultiCardLayout>
  );
}

const StyledDivider = styled(Divider)`
  border-top-color: ${props => props.theme.color.primary.default};
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
