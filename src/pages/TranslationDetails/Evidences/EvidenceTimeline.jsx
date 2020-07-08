import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { Typography } from 'antd';
import {
  FilePdfFilled,
  FileTextFilled,
  FileZipFilled,
  FileImageFilled,
  FileExcelFilled,
  FileMarkdownFilled,
  FileGifFilled,
  FileUnknownFilled,
  FileWordFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ReactBlockies from 'react-blockies';
import { composeRefs } from '~/adapters/react/';
import EthAddress from '~/shared/EthAddress';
import FormattedDate from '~/shared/FormattedDate';
import { getFileUrl } from '~/features/evidences';
import { TaskParty } from '~/features/tasks';

export default function EvidenceTimeline({ data, lastItemRef, firstItemRef }) {
  /**
   * Evidences must be in descending order
   */
  const sortedData = [...data].sort((a, b) => b.submittedAt - a.submittedAt);

  return sortedData.length === 0 ? (
    <StyledEmptyList>Wow, such empty!</StyledEmptyList>
  ) : (
    <StyledEvidenceList>
      {sortedData.map(({ transactionHash, submittedAt, submittedBy, evidenceJSON }, index) => {
        const isLast = index === 0;
        const isFirst = index === data.length - 1;
        const ref = composeRefs(isLast ? lastItemRef : null, isFirst ? firstItemRef : null);

        const position = data.length - index;

        return (
          <StyledEvidenceListItem key={transactionHash} ref={ref}>
            <EvidenceCard {...evidenceJSON} position={position} submittedAt={submittedAt} submittedBy={submittedBy} />
          </StyledEvidenceListItem>
        );
      })}
    </StyledEvidenceList>
  );
}

EvidenceTimeline.propTypes = {
  data: t.arrayOf(t.object).isRequired,
  lastItemRef: t.shape({ current: t.any }),
  firstItemRef: t.shape({ current: t.any }),
};

function EvidenceCard({
  submittedAt,
  submittedBy,
  name,
  position,
  description,
  supportingSide,
  fileURI,
  fileTypeExtension,
}) {
  const supportingSideText = textBySupportingSide[supportingSide];

  const submittedAtDate = dayjs.unix(submittedAt);

  return (
    <StyledCardSurface>
      <StyledCardContent>
        <StyledCardTitle level={4}>{name}</StyledCardTitle>
        <StyledCardDescription>{description}</StyledCardDescription>
      </StyledCardContent>
      <StyledCardFooter>
        <StyledAvatar>
          <StyledReactBlockies seed={submittedBy} shape="round" size={8} scale={4} />
        </StyledAvatar>
        <StyledMetadata>
          <p>
            <strong>#{position}</strong> submitted by <EthAddress address={submittedBy} /> in favor of:{' '}
            <strong>{supportingSideText}</strong>
          </p>
          <time dateTime={submittedAtDate.toISOString()}>
            <FormattedDate
              value={submittedAtDate.toISOString()}
              month="short"
              hour="2-digit"
              minute="2-digit"
              timeZoneName="short"
            />
          </time>
        </StyledMetadata>
        {fileURI && (
          <StyledDownloadFile>
            <StyledDownloadFileButton href={getFileUrl(fileURI)} target="_blank" rel="noopener noreferrer">
              {fileTypeIcons[fileTypeExtension] ?? fileTypeIcons.default}
              <span className="sr-only">Download File</span>
            </StyledDownloadFileButton>
          </StyledDownloadFile>
        )}
      </StyledCardFooter>
    </StyledCardSurface>
  );
}

EvidenceCard.propTypes = {
  submittedAt: t.oneOfType([t.string, t.number, t.instanceOf(Date)]).isRequired,
  submittedBy: t.string.isRequired,
  position: t.number.isRequired,
  name: t.string.isRequired,
  description: t.string.isRequired,
  supportingSide: t.oneOf(Object.values(TaskParty)).isRequired,
  fileURI: t.string,
  fileTypeExtension: t.string,
};

const fileTypeIcons = {
  pdf: <FilePdfFilled />,
  txt: <FileTextFilled />,
  zip: <FileZipFilled />,
  gif: <FileGifFilled />,
  png: <FileImageFilled />,
  jpg: <FileImageFilled />,
  jpeg: <FileImageFilled />,
  webp: <FileImageFilled />,
  xlsx: <FileExcelFilled />,
  docx: <FileWordFilled />,
  md: <FileMarkdownFilled />,
  default: <FileUnknownFilled />,
};

const textBySupportingSide = {
  [TaskParty.Translator]: 'Accept the Translation',
  [TaskParty.Challenger]: 'Reject the Translation',
};

const StyledEmptyList = styled(Typography.Paragraph)`
  font-size: ${p => p.theme.fontSize.lg};
  color: ${p => p.theme.color.text.light};
  text-align: center;
  margin: 1rem 0;
`;

const StyledEvidenceList = styled.ol`
  list-style: none;
  padding: 0;
`;

const StyledEvidenceListItem = styled.li`
  & + & {
    margin-top: 1.5rem;
  }
`;

const StyledCardSurface = styled.div`
  background-color: ${props => props.theme.color.background.light};
  box-shadow: 0 0.375rem 2rem ${props => props.theme.color.shadow.light};
  border-radius: 0.75rem;
  overflow: hidden;
`;

const StyledCardContent = styled.main`
  padding: 1.5rem;
`;

const StyledCardTitle = styled(Typography.Title)`
  && {
    font-size: ${p => p.theme.fontSize.md};
  }
`;

const StyledCardDescription = styled(Typography.Paragraph)`
  && {
    font-size: ${p => p.theme.fontSize.sm};
    font-weight: 400;
    margin-bottom: 0;
    color: inherit;
    max-height: 50vh;
    overflow: hidden auto;
  }
`;

const StyledCardFooter = styled.footer`
  background-color: ${props => props.theme.color.background.default};
  color: ${props => props.theme.color.primary.default};
  display: flex;
  padding: 1rem 1.5rem;
  gap: 1rem;
  font-weight: 400;
  font-size: ${p => p.theme.fontSize.sm};
`;

const StyledAvatar = styled.div`
  display: flex;
  align-items: center;
`;

const StyledMetadata = styled.div`
  flex: 1;

  a,
  strong {
    font-weight: 500;
  }
`;

const StyledReactBlockies = styled(ReactBlockies)`
  border-radius: ${props => (props.shape === 'round' ? '100%' : 0)};
`;

const StyledDownloadFile = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const StyledDownloadFileButton = styled.a`
  && {
    display: block;
    width: 2rem;
    height: 2rem;
    position: relative;

    .anticon,
    svg {
      z-index: 1;
      width: 100%;
      height: 100%;
    }

    .sr-only {
      display: none;
    }

    @media (speech) {
      .sr-only {
        display: initial;
      }
    }
  }
`;
