import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { LinkOutlined, PaperClipOutlined } from '@ant-design/icons';
import { getFileUrl } from '~/api/linguo';

const StyledList = styled.ul`
  padding: 0;
  margin: 0;
`;

const StyledListItem = styled.li`
  list-style: none;
  margin: 0;

  & + & {
    margin-top: 0.25rem;
  }
`;

function OriginalTextAttachments({ originalTextUrl, originalTextFile, className }) {
  return (
    <StyledList className={className}>
      {originalTextUrl ? (
        <StyledListItem>
          <a href={originalTextUrl} target="_blank" rel="noopener noreferrer external">
            <LinkOutlined /> Source of the original text
          </a>
        </StyledListItem>
      ) : null}
      {originalTextFile ? (
        <StyledListItem>
          <a href={getFileUrl(originalTextFile)} target="_blank" rel="noopener noreferrer external">
            <PaperClipOutlined /> File of the original text
          </a>
        </StyledListItem>
      ) : null}
    </StyledList>
  );
}

OriginalTextAttachments.propTypes = {
  originalTextUrl: t.string,
  originalTextFile: t.string,
  className: t.string,
};

OriginalTextAttachments.defaultProps = {
  className: '',
};

export default OriginalTextAttachments;
