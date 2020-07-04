import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import languages from '~/assets/fixtures/languages';
import getLanguageFlag from '~/shared/helpers/getLanguageFlag';

function TaskLanguages({ source, target, fullWidth }) {
  const SourceLanguageFlag = getLanguageFlag(source);
  const TargetLanguageFlag = getLanguageFlag(target);

  const Wrapper = fullWidth ? StyledTaskLanguages : StyledTaskLanguagesInline;

  return (
    <Wrapper>
      <span className="item source">
        <SourceLanguageFlag className="flag" />
        <span className="text">{getShortLanguageName(source)}</span>
      </span>
      <span className="separator">to</span>
      <span className="item target">
        <TargetLanguageFlag className="flag" />
        <span className="text">{getShortLanguageName(target)}</span>
      </span>
    </Wrapper>
  );
}

TaskLanguages.propTypes = {
  source: t.string.isRequired,
  target: t.string.isRequired,
  fullWidth: t.bool,
};

TaskLanguages.fullWidth = {
  fullWidth: false,
};

export default TaskLanguages;

const getShortLanguageName = code => {
  const { name = '<Unknown>' } = indexedLanguages[code] || {};

  return name.replace(/ ?\([\w\s]*\)$/, '');
};

const indexedLanguages = languages.reduce(
  (acc, current) =>
    Object.assign(acc, {
      [current.code]: current,
    }),
  {}
);

const StyledTaskLanguages = styled.span`
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
    flex: 1 0;
    display: flex;
    align-items: center;

    .flag {
      order: 0;
      flex: 1.5rem 0 0;
      max-height: 1.5rem;
    }

    .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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

const StyledTaskLanguagesInline = styled(StyledTaskLanguages)`
  display: inline-flex;

  .item {
    flex: 1;
  }
`;
