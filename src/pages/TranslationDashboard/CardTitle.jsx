import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/components/helpers/getLanguageFlag';

const StyledCardTitle = styled.span`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-size: ${props => props.theme.fontSize.md};

  .separator {
    flex: 0;
    margin: 0 0.75rem;
    font-size: ${props => props.theme.fontSize.sm};
  }

  .item {
    flex: 1;
    display: flex;
    align-items: center;

    .flag {
      order: 0;
      flex: 1.5rem 0 0;
      max-height: 1.5rem;
    }

    .text {
      flex: 1;
      order: 1;
      text-align: left;
      margin-left: 0.5rem;
    }

    &.source {
      .flag {
        order: 1;
      }

      .text {
        text-align: right;
        order: 0;
        margin-left: 0;
        margin-right: 0.5rem;
      }
    }
  }
`;

const indexedLanguages = languages.reduce(
  (acc, current) =>
    Object.assign(acc, {
      [current.code]: current,
    }),
  {}
);

const getShortLanguageName = code => {
  const { name = '<Unknown>' } = indexedLanguages[code] || {};

  return name.replace(/ ?\(\w*\)$/, '');
};

function CardTitle({ sourceLanguage, targetLanguage }) {
  const SourceLanguageFlag = getLanguageFlag(sourceLanguage);
  const TargetLanguageFlag = getLanguageFlag(targetLanguage);

  return (
    <StyledCardTitle>
      <span className="item source">
        <SourceLanguageFlag className="flag" />
        <span className="text">{getShortLanguageName(sourceLanguage)}</span>
      </span>
      <span className="separator">to</span>
      <span className="item target">
        <TargetLanguageFlag className="flag" />
        <span className="text">{getShortLanguageName(targetLanguage)}</span>
      </span>
    </StyledCardTitle>
  );
}

CardTitle.propTypes = {
  sourceLanguage: t.string.isRequired,
  targetLanguage: t.string.isRequired,
};

export default CardTitle;
