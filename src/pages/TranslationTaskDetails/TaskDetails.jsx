import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography } from 'antd';
import { Task, TaskStatus } from '~/api/linguo';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/components/helpers/getLanguageFlag';
import useSelfUpdatingState from '~/hooks/useSelfUpdatingState';
import { CalendarIcon } from '~/components/icons';
import FormattedDate from '~/components/FormattedDate';
import FormattedNumber from '~/components/FormattedNumber';
import TaskInfoGrid from './TaskInfoGrid';
import TaskPrice from './TaskPrice';

const StyledTitle = styled(Typography.Title)`
  && {
    font-size: ${props => props.theme.fontSize.xl};
    text-align: center;
  }
`;

const StyledDeadline = styled(Typography.Paragraph)`
  && {
    font-size: ${props => props.theme.fontSize.sm};
    text-align: center;
  }
`;

const StyledFootnote = styled(Typography.Paragraph)`
  && {
    margin: 0;
    font-size: ${props => props.theme.fontSize.sm};
  }
`;

const StyledLanguageInfoRow = styled.div`
  text-align: center;
  display: flex;
  justify-content: center;

  .col {
    min-width: 0;
    max-width: 20rem;
    flex: 20rem 1 1;

    &.target {
      margin-left: 1rem;
    }
  }

  @media (max-width: 767.98px) {
    flex-wrap: wrap;

    .col {
      &.target {
        margin-left: 0;
        margin-top: 2rem;
      }
    }
  }
`;

const StyledLanguageDisplay = styled.div`
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 5px solid ${p => p.theme.border.default};
  background-image: linear-gradient(
    122.98deg,
    ${p => p.theme.primary.default} 40.84%,
    ${p => p.theme.primary.dark} 89.37%
  );
  color: ${p => p.theme.text.inverted};
  font-size: ${p => p.theme.fontSize.xl};

  display: flex;
  justify-content: center;
  align-items: center;

  .flag {
    width: 2rem;
    height: 2rem;
  }

  .name {
    flex: auto 0 1;
    margin-left: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const indexedLanguages = languages.reduce((acc, item) => Object.assign(acc, { [item.code]: item }), {});

function LanguageInfo({ language }) {
  const languageName = indexedLanguages[language].name || '<Unknown>';
  const FlagIcon = getLanguageFlag(language);

  return (
    <StyledLanguageDisplay>
      <FlagIcon className="flag" />
      <span className="name">{languageName}</span>
    </StyledLanguageDisplay>
  );
}

LanguageInfo.propTypes = {
  language: t.string.isRequired,
};

const _1_MINUTE_IN_MILISECONDS = 60 * 1000;

function TaskDetails(task) {
  const {
    status,
    title,
    deadline,
    assignedPrice,
    maxPrice,
    expectedQuality,
    wordCount,
    sourceLanguage,
    targetLanguage,
  } = task;

  const { currentPrice, currentPricePerWord } = useSelfUpdatingState({
    updateIntervalMs: _1_MINUTE_IN_MILISECONDS,
    getState: () => {
      const currentDate = new Date();
      return {
        currentPrice: Task.currentPrice(task, { currentDate }),
        currentPricePerWord: Task.currentPricePerWord(task, { currentDate }),
      };
    },
    stopWhen: ({ currentPrice }) => !!assignedPrice || currentPrice === maxPrice,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const showFootnote = status === TaskStatus.Created && !Task.isIncomplete(task);

  const taskInfo = [
    {
      title: 'Price per word',
      content: <TaskPrice showTooltip value={currentPricePerWord} />,
    },
    {
      title: 'Number of words',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: <TaskPrice showTooltip showFootnoteMark={showFootnote} value={currentPrice} />,
    },
    {
      title: name,
      content: requiredLevel,
    },
  ];

  return (
    <div
      css={`
        margin-top: -2rem;
      `}
    >
      <StyledTitle level={2}>{title}</StyledTitle>
      <StyledDeadline>
        <CalendarIcon />
        <span> Translation Deadline: </span>
        <FormattedDate value={deadline} month="long" hour="2-digit" minute="2-digit" timeZoneName="short" />
      </StyledDeadline>
      <TaskInfoGrid data={taskInfo} />
      {showFootnote && (
        <StyledFootnote>
          <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
        </StyledFootnote>
      )}
      <StyledLanguageInfoRow>
        <div className="col source">
          <p className="col-title">Source Language</p>
          <LanguageInfo language={sourceLanguage} />
        </div>
        <div className="col target">
          <p className="col-title">Target Language</p>
          <LanguageInfo language={targetLanguage} />
        </div>
      </StyledLanguageInfoRow>
    </div>
  );
}

TaskDetails.propTypes = {
  ID: t.number.isRequired,
  status: t.oneOf(Object.values(TaskStatus)).isRequired,
  title: t.string.isRequired,
  deadline: t.oneOfType([t.string, t.instanceOf(Date)]).isRequired,
  maxPrice: t.string.isRequired,
  expectedQuality: t.oneOf(Object.keys(translationQualityTiers)).isRequired,
  wordCount: t.number.isRequired,
  assignedPrice: t.string,
};

export default TaskDetails;
