import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import Spacer from '~/shared/Spacer';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import * as r from '~/app/routes';
import { selectAllSkills } from '~/features/translator/translatorSlice';
import ContentBlocker from '~/shared/ContentBlocker';
import Button from '~/shared/Button';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';
import ContextAwareTaskInteractionButton from '../../components/ContextAwareTaskInteractionButton';
import TaskDeadline from '../../components/TaskDeadline';
import TaskAssignmentDepositFetcher from '../../components/TaskAssignmentDepositFetcher';
import useTask from '../../../useTask';

export default function CreatedForOther() {
  const { sourceLanguage, targetLanguage, expectedQuality } = useTask();
  const minimumLevel = minimumLevelByQuality[expectedQuality];
  const skills = useShallowEqualSelector(selectAllSkills);

  const hasSkill = React.useMemo(() => {
    const hasSourceLanguageSkill = skills.some(
      ({ language, level }) => sourceLanguage === language && level >= minimumLevel
    );
    const hasTargetLanguageSkill = skills.some(
      ({ language, level }) => targetLanguage === language && level >= minimumLevel
    );

    return hasSourceLanguageSkill && hasTargetLanguageSkill;
  }, [targetLanguage, sourceLanguage, minimumLevel, skills]);

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
        <ContentBlocker blocked={!hasSkill} contentBlur={0}>
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
