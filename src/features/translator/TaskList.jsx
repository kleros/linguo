import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';

import { Col, Row, Tooltip, Typography } from 'antd';
import Spacer from '~/shared/Spacer';
import TaskCard from '~/features/tasks/TaskCard';
import { TaskCardFooterInfoDisplay } from '../tasks/TaskCardFooter';

import taskStatus from '~/consts/taskStatus';
import { useTranslatorSkills } from '~/context/TranslatorSkillsProvider';
import { useMetaEvidenceQuery } from '~/hooks/queries/useMetaEvidenceQuery';

export default function TaskList({ data, showFootnote }) {
  return data.length === 0 ? (
    <StyledEmptyListText>Wow, such empty! There are currently no tasks.</StyledEmptyListText>
  ) : (
    <>
      <StyledTaskCountText>
        Showing{' '}
        <strong>
          {data.length} {pluralize(data.length, { single: 'task', many: 'tasks' })}
        </strong>
      </StyledTaskCountText>
      <StyledListWrapper>
        <StyledRow
          gutter={[
            { xs: 0, sm: 32 },
            { xs: 16, sm: 32 },
          ]}
        >
          {data.map(task => {
            return (
              <Col key={task.id} xs={24} sm={24} md={12} lg={8}>
                <TranslatorTaskCard {...task} />
              </Col>
            );
          })}
        </StyledRow>
      </StyledListWrapper>
      {showFootnote && (
        <>
          <Spacer />
          <StyledFootnote>
            <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
          </StyledFootnote>
        </>
      )}
    </>
  );
}

TaskList.propTypes = {
  data: t.arrayOf(t.object).isRequired,
  showFootnote: t.bool,
};

TaskList.defaultProps = {
  showFootnote: false,
};

const minimumLevelByQuality = {
  costEffective: 'B2',
  standard: 'C1',
  professional: 'C2',
};

function TranslatorTaskCard(props) {
  const { metadata } = useMetaEvidenceQuery(props.metaEvidence.URI);
  const minimumLevel = minimumLevelByQuality[metadata?.expectedQuality];

  const { state, selectors } = useTranslatorSkills();
  const { selectAllSkills } = selectors;
  const skills = selectAllSkills(state);

  const hasSkill = React.useMemo(() => {
    const hasSourceLanguageSkill = skills.some(
      ({ language, level }) => metadata?.sourceLanguage === language && level >= minimumLevel
    );
    const hasTargetLanguageSkill = skills.some(
      ({ language, level }) => metadata?.targetLanguage === language && level >= minimumLevel
    );

    return hasSourceLanguageSkill && hasTargetLanguageSkill;
  }, [metadata?.targetLanguage, metadata?.sourceLanguage, minimumLevel, skills]);
  return (
    <Tooltip title={!hasSkill ? "You don't have the required skills for this task" : ''}>
      {metadata?.title && (
        <TaskCard
          data={props}
          metadata={metadata}
          footerProps={{
            rightSideContent: (
              <TaskCardFooterInfoDisplay
                title="Skills Match"
                content={hasSkill ? 'Yes' : 'No'}
                color={hasSkill ? 'success' : 'danger'}
              />
            ),
          }}
        />
      )}
    </Tooltip>
  );
}

TranslatorTaskCard.propTypes = {
  metaEvidence: t.shape({ URI: t.string.isRequired }),
  status: t.oneOf(Object.values(taskStatus)).isRequired,
};

const pluralize = (quantity, { single, many }) => (quantity === 1 ? single : many);

const StyledListWrapper = styled.div`
  @media (max-width: 575.98px) {
    margin: 0 -1.5rem;
  }
`;

const StyledRow = styled(Row)`
  // make cards in the same row to have the same height
  align-items: stretch;
`;

const StyledFootnote = styled(Typography.Paragraph)`
  && {
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};

    @media (max-width: 575.98px) {
      margin: 1rem 0 2rem;
    }
  }
`;

const StyledEmptyListText = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.xl};
    text-align: center;
    margin: 2rem 0;
  }
`;

const StyledTaskCountText = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    text-align: right;
    margin: 0 0 1rem;
  }
`;
