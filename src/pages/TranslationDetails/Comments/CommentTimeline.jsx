import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import clsx from 'clsx';
import { Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ReactBlockies from 'react-blockies';
import { composeRefs } from '~/adapters/react';
import { mapValues } from '~/shared/fp';
import EthAddress from '~/shared/EthAddress';
import FormattedDate from '~/shared/FormattedDate';
import { TaskParty } from '~/features/tasks';
import useTask from '../useTask';

export default function CommentTimeline({ data, lastItemRef, firstItemRef }) {
  const task = useTask();
  const normalizedParties = mapValues(address => String(address).toLowerCase(), task.parties);

  return data.length === 0 ? (
    <StyledEmptyList>Wow, such empty!</StyledEmptyList>
  ) : (
    <StyledCommentList>
      {data.map(({ postId, author, message, timestamp, pending }, index) => {
        const isLast = index === data.length - 1;
        const isFirst = index === 0;
        const ref = composeRefs(isLast ? lastItemRef : null, isFirst ? firstItemRef : null);
        const position = index + 1;

        const role =
          author.address === normalizedParties[TaskParty.Challenger]
            ? ' (Challenger)'
            : author.address === normalizedParties[TaskParty.Translator]
            ? ' (Translator)'
            : author.address === normalizedParties[TaskParty.Requester]
            ? ' (Requester)'
            : '';

        return (
          <StyledCommentListItem key={postId} ref={ref} className={clsx({ pending })}>
            <StyledCardSurface>
              <StyledCardContent>
                <StyledCardDescription>
                  {pending ? (
                    <>
                      <LoadingOutlined /> {message}
                    </>
                  ) : (
                    message
                  )}
                </StyledCardDescription>
              </StyledCardContent>
              <StyledCardFooter>
                <StyledAvatar>
                  <StyledReactBlockies seed={author.address} shape="round" size={8} scale={4} />
                </StyledAvatar>
                <StyledMetadata>
                  <p>
                    <strong>#{position}</strong> submitted by <EthAddress address={author.address} />
                    {role}
                  </p>
                  <time dateTime={new Date(timestamp * 1000).toISOString()}>
                    <FormattedDate
                      value={new Date(timestamp * 1000).toISOString()}
                      month="short"
                      hour="2-digit"
                      minute="2-digit"
                      timeZoneName="short"
                    />
                  </time>
                </StyledMetadata>
              </StyledCardFooter>
            </StyledCardSurface>
          </StyledCommentListItem>
        );
      })}
    </StyledCommentList>
  );
}

CommentTimeline.propTypes = {
  data: t.arrayOf(
    t.shape({
      postId: t.string.isRequired,
      author: t.shape({
        address: t.string.isRequired,
      }),
      message: t.string.isRequired,
      timestamp: t.number.isRequired,
    })
  ).isRequired,
  lastItemRef: t.shape({ current: t.any }),
  firstItemRef: t.shape({ current: t.any }),
};

const StyledEmptyList = styled(Typography.Paragraph)`
  font-size: ${p => p.theme.fontSize.lg};
  color: ${p => p.theme.color.text.light};
  text-align: center;
  margin: 1rem 0;
`;

const StyledCommentList = styled.ol`
  list-style: none;
  padding: 0;
`;

const StyledCommentListItem = styled.li`
  & + & {
    margin-top: 1.5rem;
  }

  &.pending {
    opacity: 0.5;
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
