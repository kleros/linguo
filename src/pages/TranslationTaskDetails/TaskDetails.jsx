import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Row, Col, Typography } from 'antd';
import { Task, TaskStatus, useCacheCall } from '~/app/linguo';

import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/components/helpers/getLanguageFlag';
import { CalendarIcon } from '~/components/icons';
import Spacer from '~/components/Spacer';
import FormattedDate from '~/components/FormattedDate';
import FormattedNumber from '~/components/FormattedNumber';
import TranslationQualityDefinition from '~/components/TranslationQualityDefinition';
import TaskInfoGrid from './TaskInfoGrid';
import TaskPrice from './TaskPrice';
import OriginalTextAttachments from './OriginalTextAttachments';
import TaskStatusDescription from './TaskStatusDescription';
import DownloadTextButton from './DownloadTextButton';

const StyledTaskTitle = styled(Typography.Title)`
  && {
    font-size: ${p => p.theme.fontSize.xxl};
    text-align: center;
  }
`;

const StyledDefinitionList = styled.dl`
  display: block;
  margin: 0;
`;

const StyledDefinitionTerm = styled.dt`
  font-size: ${p => p.theme.fontSize.lg};
  margin-bottom: 1rem;
`;

const StyledDefinitionDescription = styled.dd`
  font-size: inherit;
`;

const StyledDeadline = styled(StyledDefinitionList)`
  && {
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: 400;
    text-align: center;

    ${StyledDefinitionTerm} {
      font-size: inherit;
      font-weight: inherit;
      margin: 0;
    }

    ${StyledDefinitionTerm},
    ${StyledDefinitionDescription} {
      display: inline;
    }
  }
`;

const StyledFootnote = styled(Typography.Paragraph)`
  && {
    margin: 0;
    font-size: ${p => p.theme.fontSize.sm};
  }
`;

const StyledLanguageInfo = styled(StyledDefinitionList)`
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
  border: 5px solid ${p => p.theme.color.border.default};
  background-image: linear-gradient(
    122.98deg,
    ${p => p.theme.color.primary.default} 40.84%,
    ${p => p.theme.color.primary.dark} 89.37%
  );
  color: ${p => p.theme.color.text.inverted};
  font-size: ${p => p.theme.fontSize.xxl};

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

const StyledExpectedQuality = styled(StyledDefinitionList)`
  ${StyledDefinitionTerm} {
    text-align: center;
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

const StyledOriginalTextAttachments = styled(OriginalTextAttachments)`
  text-align: center;
`;

const _1_MINUTE_IN_MILLISECONDS = 60 * 1000;

function TaskDetails(task) {
  const {
    ID,
    status,
    title,
    deadline,
    assignedPrice,
    expectedQuality,
    wordCount,
    sourceLanguage,
    targetLanguage,
    originalTextUrl,
    originalTextFile,
  } = task;

  const refreshInterval = !!assignedPrice || Task.isIncomplete(task) ? 0 : _1_MINUTE_IN_MILLISECONDS;
  const [{ data: currentPrice }] = useCacheCall(['getTaskPrice', ID], {
    initialData: Task.currentPrice(task),
    refreshInterval,
  });

  const currentPricePerWord = Task.currentPricePerWord({ currentPrice, wordCount });

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
      <StyledTaskTitle level={2}>{title}</StyledTaskTitle>
      <StyledDeadline>
        <StyledDefinitionTerm>
          <CalendarIcon /> Translation Deadline:{' '}
        </StyledDefinitionTerm>
        <StyledDefinitionDescription>
          <FormattedDate value={deadline} month="long" hour="2-digit" minute="2-digit" timeZoneName="short" />
        </StyledDefinitionDescription>
      </StyledDeadline>
      <Spacer span={3} />
      <TaskInfoGrid data={taskInfo} />
      {showFootnote && (
        <>
          <Spacer baseSize="xs" />
          <StyledFootnote>
            <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
          </StyledFootnote>
        </>
      )}
      <Spacer span={3} />
      <StyledLanguageInfo>
        <div className="col source">
          <StyledDefinitionTerm>Source Language</StyledDefinitionTerm>
          <StyledDefinitionDescription>
            <LanguageInfo language={sourceLanguage} />
          </StyledDefinitionDescription>
        </div>
        <div className="col target">
          <StyledDefinitionTerm>Target Language</StyledDefinitionTerm>
          <StyledDefinitionDescription>
            <LanguageInfo language={targetLanguage} />
          </StyledDefinitionDescription>
        </div>
      </StyledLanguageInfo>
      <Spacer span={3} />
      <StyledExpectedQuality>
        <StyledDefinitionTerm>Expected Quality</StyledDefinitionTerm>
        <StyledDefinitionDescription>
          <TranslationQualityDefinition tierValue={expectedQuality} />
        </StyledDefinitionDescription>
      </StyledExpectedQuality>
      <Spacer span={3} />
      <Row justify="center">
        <Col>
          <DownloadTextButton {...task} />
        </Col>
      </Row>
      <Spacer span={1} />
      <StyledOriginalTextAttachments originalTextUrl={originalTextUrl} originalTextFile={originalTextFile} />
      <Spacer span={3} />
      <TaskStatusDescription {...task} />
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
