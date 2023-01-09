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
  FileGifOutlined,
  FileUnknownFilled,
  FileWordFilled,
} from '@ant-design/icons';
import ReactBlockies from 'react-blockies';
import { composeRefs } from '~/adapters/react';
import EthAddress from '~/shared/EthAddress';
import FormattedDate from '~/shared/FormattedDate';
import { getFileUrl } from '~/features/evidences';
import { TaskParty } from '~/features/tasks';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import moment from 'moment';
import { useIPFSQuery } from '~/hooks/queries/useIPFSQuery';

export default function EvidenceTimeline({ data, lastItemRef, firstItemRef }) {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  return data.length === 0 ? (
    <StyledEmptyList>Wow, such empty!</StyledEmptyList>
  ) : (
    <StyledEvidenceList>
      {data.map(({ number, timestamp, party, URI }, index) => {
        const isLast = index === 0;
        const isFirst = index === data.length - 1;
        const ref = composeRefs(isLast ? lastItemRef : null, isFirst ? firstItemRef : null);
        const position = data.length - index;

        const role =
          party === task.challenger
            ? '(Challenger)'
            : party === task.translator
            ? '(Translator)'
            : party === task.requester
            ? '(Requester)'
            : '';

        return (
          <StyledEvidenceListItem key={number} ref={ref}>
            <EvidenceCard
              evidencePath={URI}
              position={position}
              submittedAt={timestamp}
              submittedBy={party}
              role={role}
            />
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

function EvidenceCard({ evidencePath, position, role, submittedAt, submittedBy }) {
  const { data, isLoading } = useIPFSQuery(evidencePath);
  if (isLoading || !data) return <></>;

  const { name, description, supportingSide, fileURI, fileTypeExtension } = data;
  const supportingSideText = textBySupportingSide[supportingSide];

  const submittedAtDate = moment.unix(submittedAt);
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
            <strong>#{position}</strong> submitted by <EthAddress address={submittedBy} />
            {role ? ` ${role}` : null} in favor of: <strong>{supportingSideText}</strong>
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
  evidencePath: t.string.isRequired,
  position: t.number.isRequired,
  role: t.string,
  submittedAt: t.oneOfType([t.string, t.number, t.instanceOf(Date)]).isRequired,
  submittedBy: t.string.isRequired,
};

EvidenceCard.defaultProps = {
  role: '',
};

const fileTypeIcons = {
  pdf: <FilePdfFilled />,
  txt: <FileTextFilled />,
  zip: <FileZipFilled />,
  gif: <FileGifOutlined />,
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
    font-weight: ${p => p.theme.fontWeight.regular};
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
  font-weight: ${p => p.theme.fontWeight.regular};
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
    font-weight: ${p => p.theme.fontWeight.semibold};
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
