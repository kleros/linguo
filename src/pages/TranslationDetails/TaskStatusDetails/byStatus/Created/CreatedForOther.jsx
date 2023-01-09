import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import * as r from '~/app/routes';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { selectAllSkills } from '~/features/translator/translatorSlice';

import Button from '~/shared/Button';
import ContentBlocker from '~/shared/ContentBlocker';
import Spacer from '~/shared/Spacer';

import { Tooltip } from 'antd';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';
import TaskAssignmentDepositFetcher from '../../components/TaskAssignmentDepositFetcher';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';

export default function CreatedForOther() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const minimumLevel = minimumLevelByQuality[task.expectedQuality];
  const skills = useShallowEqualSelector(selectAllSkills);

  const hasSkill = React.useMemo(() => {
    const hasSourceLanguageSkill = skills.some(
      ({ language, level }) => task.sourceLanguage === language && level >= minimumLevel
    );
    const hasTargetLanguageSkill = skills.some(
      ({ language, level }) => task.targetLanguage === language && level >= minimumLevel
    );

    return hasSourceLanguageSkill && hasTargetLanguageSkill;
  }, [task.targetLanguage, task.sourceLanguage, minimumLevel, skills]);

  const props = {
    title: 'Translate this text',
    description: [
      'In order to self-assign this task you need to send a Translator Deposit. The value will be reimbursed when the task is finished and approved after the review time.',
      'In case your translation is not delivered in time or not approved, it will be used as a compensation to the task requester or challenger.',
    ],
    interaction: (
      <>
        <TaskDeadline />
        <Spacer />
        <ContextAwareTaskInteractionButton
          interaction={ContextAwareTaskInteractionButton.Interaction.Assign}
          content={{
            idle: { text: 'Translate It' },
          }}
          buttonProps={{ fullWidth: true }}
        />
        <Spacer size={0.5} />
        <TaskAssignmentDepositFetcher />
      </>
    ),
  };

  return (
    <Tooltip
      title={
        !hasSkill ? (
          <>
            You don&rsquo;t have the required skills for this task.{' '}
            <Link to={r.TRANSLATOR_SETTINGS} component={StyledTooltipButtonLink} variant="link">
              Update your skills
            </Link>
            .
          </>
        ) : (
          ''
        )
      }
    >
      <div>
        <ContentBlocker blocked={false} contentBlur={0}>
          <TaskStatusDetailsLayout {...props} />
        </ContentBlocker>
      </div>
    </Tooltip>
  );
}

const minimumLevelByQuality = {
  costEffective: 'B2',
  standard: 'C1',
  professional: 'C2',
};

const StyledTooltipButtonLink = styled(Button)`
  color: ${p => p.theme.color.text.inverted};
`;
