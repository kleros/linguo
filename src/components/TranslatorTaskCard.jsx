import React from 'react';
import t from 'prop-types';

import { Tooltip } from 'antd';
import { useTranslatorSkills } from '~/context/TranslatorSkillsProvider';
import TaskCard from '~/features/tasks/TaskCard';
import { useMetaEvidenceQuery } from '~/hooks/queries/useMetaEvidenceQuery';
import { TaskCardFooterInfoDisplay } from '~/features/tasks/TaskCardFooter';

const minimumLevelByQuality = {
  costEffective: 'B2',
  standard: 'C1',
  professional: 'C2',
};

const TranslatorTaskCard = props => {
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
};

export default TranslatorTaskCard;

TranslatorTaskCard.propTypes = {
  metaEvidence: t.shape({ URI: t.string.isRequired }),
};
