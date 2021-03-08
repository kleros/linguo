import React from 'react';
import { Titled } from 'react-titled';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography } from 'antd';
import { FileTextOutlined, TranslationOutlined, LinkOutlined, PaperClipOutlined } from '@ant-design/icons';
import translationQualityTiers from '~/assets/fixtures/translationQualityTiers.json';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/shared/helpers/getLanguageFlag';
import { CalendarIcon } from '~/shared/icons';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import FormattedDate from '~/shared/FormattedDate';
import FormattedNumber from '~/shared/FormattedNumber';
import TranslationQualityDefinition from '~/shared/TranslationQualityDefinition';
import TaskInfoGrid from '~/features/tasks/TaskInfoGrid';
import TaskPrice from '~/features/tasks/TaskPrice';
import EthFiatValue from '~/features/tokens/EthFiatValue';
import DownloadLink from '~/shared/DownloadLink';
import { Task, TaskStatus, getFileUrl } from '~/features/tasks';
import useTask from './useTask';
import TaskStatusDetails from './TaskStatusDetails';
import Evidences from './Evidences';
import Comments from './Comments';
import useInterval from '~/shared/useInterval';
import AffixContainer from '~/shared/AffixContainer';

const _1_MINUTE_MS = 60 * 1000;

export default function TaskDetails() {
  const task = useTask();

  const {
    status,
    title,
    deadline,
    assignedPrice,
    expectedQuality,
    wordCount,
    sourceLanguage,
    targetLanguage,
    originalTextUrl,
    translatedTextUrl,
    version,
  } = task;

  const deprecatedOriginalText = version > 0 ? undefined : task.text;
  const deprecatedOriginalTextFile = version > 0 ? undefined : task.originalTextFile;
  const originalTextFileUrl = version > 0 ? task.originalTextFileUrl : undefined;

  const getCurrentPrice = React.useCallback(() => Task.currentPrice(task), [task]);
  const [currentPrice, setCurrentPrice] = React.useState(getCurrentPrice);

  const updateCurrentPrice = React.useCallback(() => {
    setCurrentPrice(getCurrentPrice());
  }, [getCurrentPrice, setCurrentPrice]);

  const interval = assignedPrice === undefined ? _1_MINUTE_MS : null;
  useInterval(updateCurrentPrice, interval);

  const actualPrice = assignedPrice ?? currentPrice;

  const pricePerWord = Task.currentPricePerWord({
    currentPrice: actualPrice,
    wordCount,
  });

  const { name = '', requiredLevel = '' } = translationQualityTiers[expectedQuality] || {};

  const showFootnote = status === TaskStatus.Created && !Task.isIncomplete(task);

  const taskInfo = [
    {
      title: 'Price per Word',
      content: <TaskPrice showTooltip value={pricePerWord} />,
      footer: <EthFiatValue amount={pricePerWord} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Word Count',
      content: <FormattedNumber value={wordCount} />,
    },
    {
      title: 'Total Price',
      content: <TaskPrice showTooltip showFootnoteMark={showFootnote} value={actualPrice} />,
      footer: <EthFiatValue amount={actualPrice} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Quality Tier',
      content: name,
      footer: `(${requiredLevel === 'C2' ? 'C2' : requiredLevel + '+'})`,
    },
  ];

  return (
    <Titled title={prev => `${title} | ${prev}`}>
      <div
        css={`
          @media (min-width: 576px) {
            &:only-child {
              margin-top: -2rem;
            }
          }
        `}
      >
        <AffixContainer position="top">
          <div>
            <StyledTaskTitle level={2}>{title}</StyledTaskTitle>
            <StyledDeadline>
              <StyledDefinitionTerm>
                <CalendarIcon /> Translation Deadline:{' '}
              </StyledDefinitionTerm>
              <StyledDefinitionDescription>
                <FormattedDate value={deadline} month="long" hour="2-digit" minute="2-digit" timeZoneName="short" />
              </StyledDefinitionDescription>
            </StyledDeadline>
          </div>
        </AffixContainer>
        <Spacer size={3} />
        <TaskInfoGrid
          data={taskInfo}
          css={`
            max-width: 30rem;
            margin: 0 auto;
          `}
        />
        {showFootnote && (
          <>
            <Spacer baseSize="xs" />
            <StyledFootnote>
              <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
            </StyledFootnote>
          </>
        )}
        <Spacer size={3} />
        <StyledLanguageInfoWrapper>
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
        </StyledLanguageInfoWrapper>
        <Spacer size={3} />
        <StyledExpectedQuality>
          <StyledDefinitionTerm>Expected Quality</StyledDefinitionTerm>
          <StyledDefinitionDescription>
            <TranslationQualityDefinition tierValue={expectedQuality} />
          </StyledDefinitionDescription>
        </StyledExpectedQuality>
        <Spacer size={3} />
        <StyledDownloadTextWrapper>
          <div className="col">
            <DownloadLink
              download={
                version > 0
                  ? {
                      url: originalTextFileUrl,
                    }
                  : {
                      content: deprecatedOriginalText,
                    }
              }
            >
              <JumboButton fullWidth={true} variant="filled" icon={<FileTextOutlined />}>
                Original Text
              </JumboButton>
            </DownloadLink>
            {(originalTextUrl || deprecatedOriginalTextFile) && (
              <>
                <Spacer size={1} />
                <StyledLinkList>
                  {originalTextUrl ? (
                    <StyledLinkListItem>
                      <a href={originalTextUrl} target="_blank" rel="noopener noreferrer external">
                        <LinkOutlined /> Source of the original text
                      </a>
                    </StyledLinkListItem>
                  ) : null}
                  {deprecatedOriginalTextFile ? (
                    <StyledLinkListItem>
                      <a
                        href={getFileUrl(deprecatedOriginalTextFile)}
                        target="_blank"
                        rel="noopener noreferrer external"
                      >
                        <PaperClipOutlined /> File of the original text
                      </a>
                    </StyledLinkListItem>
                  ) : null}
                </StyledLinkList>
              </>
            )}
          </div>
          {translatedTextUrl && (
            <div className="col">
              <DownloadLink
                download={{
                  url: translatedTextUrl,
                }}
              >
                <JumboButton fullWidth={true} variant="outlined" icon={<TranslationOutlined />}>
                  Translated Text
                </JumboButton>
              </DownloadLink>
            </div>
          )}
        </StyledDownloadTextWrapper>
        <Spacer size={3} />
        <TaskStatusDetails />
        <Spacer size={2} />
        <Comments />
        <Spacer size={2} />
        <Evidences />
      </div>
    </Titled>
  );
}

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
  font-size: ${p => p.theme.fontSize.md};
  font-weight: ${p => p.theme.fontWeight.regular};
  margin-bottom: 1rem;
`;

const StyledDefinitionDescription = styled.dd`
  font-size: inherit;
`;

const StyledDeadline = styled(StyledDefinitionList)`
  && {
    color: ${p => p.theme.color.text.lighter};
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: ${p => p.theme.fontWeight.regular};
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

const StyledLanguageInfoWrapper = styled(StyledDefinitionList)`
  text-align: center;
  display: flex;
  justify-content: center;

  .col {
    min-width: 0;
    max-width: 22rem;
    flex: 22rem 1 1;

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

const StyledExpectedQuality = styled(StyledDefinitionList)`
  ${StyledDefinitionTerm} {
    text-align: center;
  }
`;

const indexedLanguages = languages.reduce((acc, item) => Object.assign(acc, { [item.code]: item }), {});

function LanguageInfo({ language }) {
  const languageName = indexedLanguages[language]?.name || '<Unknown>';
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

const StyledLanguageDisplay = styled.div`
  padding: 1.25rem;
  border-radius: 9px;
  border: 1px solid ${p => p.theme.color.border.default};
  background-color: ${p => p.theme.color.background.default};
  color: ${p => p.theme.color.text.default};
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

const StyledDownloadTextWrapper = styled.div`
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 1rem;

  .col {
    min-width: 0;
    flex: 22rem 0 1;
  }

  @media (max-width: 991.98px) {
    flex-wrap: wrap;
    gap: 2rem;
  }
`;

const JumboButton = styled(Button)`
  font-size: ${p => p.theme.fontSize.xxl};
  height: 5rem;
  border-radius: 9px;
  padding: 0 2rem;
  border: 3px solid ${p => p.theme.color.border.default};
  max-width: 100%;

  &.ant-btn {
    :hover,
    :focus {
      border-color: ${p => p.theme.color.border.default};
    }
  }

  @media (max-width: 575.98px) {
    display: block;
    width: 100%;
  }
`;

const StyledLinkList = styled.ul`
  padding: 0;
  margin: 0;
`;

const StyledLinkListItem = styled.li`
  list-style: none;
  margin: 0;

  & + & {
    margin-top: 0.25rem;
  }
`;
