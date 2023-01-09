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
import { getFileUrl } from '~/features/tasks';
import TaskStatusDetails from './TaskStatusDetails';
import Evidences from './Evidences';
import AffixContainer from '~/shared/AffixContainer';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useWeb3 } from '~/hooks/useWeb3';
import taskStatus from '~/consts/taskStatus';
import { useTask } from '~/hooks/useTask';

export default function TaskDetails() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const deprecatedOriginalText = task.__v > 0 ? undefined : ''; // task.text;
  const deprecatedOriginalTextFile = task.__v > 0 ? undefined : task.originalTextFile;
  const originalTextFileUrl = task.__v > 0 ? `https://ipfs.kleros.io${task.originalTextFile}` : undefined;
  const translatedTextUrl = task.translation ? `https://ipfs.kleros.io${task.translation}` : undefined;
  const { name = '', requiredLevel = '' } = translationQualityTiers[task.expectedQuality] || {};
  const showFootnote = task.status === taskStatus.Created && !task.isIncomplete;

  const taskInfo = [
    {
      title: 'Price per Word',
      content: <TaskPrice showTooltip value={task.pricePerWord} />,
      footer: <EthFiatValue amount={task.pricePerWord} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Word Count',
      content: <FormattedNumber value={task.wordCount} />,
    },
    {
      title: 'Total Price',
      content: <TaskPrice showTooltip showFootnoteMark={showFootnote} value={task.actualPrice} />,
      footer: <EthFiatValue amount={task.actualPrice} render={({ formattedValue }) => `(${formattedValue})`} />,
    },
    {
      title: 'Quality Tier',
      content: name,
      footer: `(${requiredLevel === 'C2' ? 'C2' : requiredLevel + '+'})`,
    },
  ];

  return (
    <Titled title={prev => `${task.title} | ${prev}`}>
      <div
        css={`
          @media (min-width: 576px) {
            &:only-child {
              margin-top: -1rem;
            }
          }
        `}
      >
        <AffixContainer position="top">
          <div>
            <StyledTaskTitle level={2}>{task.title}</StyledTaskTitle>
            <StyledDeadline>
              <StyledDefinitionTerm>
                <CalendarIcon /> Translation Deadline:{' '}
              </StyledDefinitionTerm>
              <StyledDefinitionDescription>
                <FormattedDate
                  value={task.deadline}
                  month="long"
                  hour="2-digit"
                  minute="2-digit"
                  timeZoneName="short"
                />
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
          <div
            css={`
              margin: 0 auto;
              max-width: 30rem;
              text-align: center;
            `}
          >
            <Spacer baseSize="xs" />
            <StyledFootnote>
              <sup>*</sup>Approximate value: the actual price is defined when a translator is assigned to the task.
            </StyledFootnote>
          </div>
        )}
        <Spacer size={3} />
        <StyledLanguageInfoWrapper>
          <div className="col source">
            <StyledDefinitionTerm>Source Language</StyledDefinitionTerm>
            <StyledDefinitionDescription>
              <LanguageInfo language={task.sourceLanguage} />
            </StyledDefinitionDescription>
          </div>
          <div className="col target">
            <StyledDefinitionTerm>Target Language</StyledDefinitionTerm>
            <StyledDefinitionDescription>
              <LanguageInfo language={task.targetLanguage} />
            </StyledDefinitionDescription>
          </div>
        </StyledLanguageInfoWrapper>
        <Spacer size={3} />
        <StyledExpectedQuality>
          <StyledDefinitionTerm>Expected Quality</StyledDefinitionTerm>
          <StyledDefinitionDescription>
            <TranslationQualityDefinition tierValue={task.expectedQuality} />
          </StyledDefinitionDescription>
        </StyledExpectedQuality>
        <Spacer size={3} />
        <StyledDownloadTextWrapper>
          <div className="col">
            <DownloadLink
              download={
                task.__v > 0
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
            {(task.originalTextUrl || deprecatedOriginalTextFile) && (
              <>
                <Spacer size={1} />
                <StyledLinkList>
                  {task.originalTextUrl ? (
                    <StyledLinkListItem>
                      <a href={task.originalTextUrl} target="_blank" rel="noopener noreferrer external">
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
          {task.translation && (
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
