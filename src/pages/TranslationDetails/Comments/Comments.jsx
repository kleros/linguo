import React from 'react';
import styled from 'styled-components';
import { Alert, Spin } from '~/adapters/antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import scrollIntoView from 'scroll-into-view-if-needed';

import { useShallowEqualSelector } from '~/adapters/react-redux';
import RequiredWalletGateway from '~/components/RequiredWalletGateway';
import CollapsibleSection from '~/shared/CollapsibleSection';
import Spacer from '~/shared/Spacer';
import { LocalTopLoadingBar } from '~/shared/TopLoadingBar';
import AddCommentForm from './AddCommentForm';
import CommentTimeline from './CommentTimeline';
import {
  selectThreadComments,
  selectThreadError,
  selectThreadIsLoading,
  getComments,
  addComment,
} from '~/features/comments/commentsSlice';
import { useTask } from '~/hooks/useTask';
import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import Task from '~/utils/task';

export default function Comments() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const task = useTask(id);
  const taskId = task.taskID;

  const isLoading = useSelector(state => selectThreadIsLoading(state, { chainId, taskId }));

  return (
    <CollapsibleSection lazy title="Comments" titleLevel={3} tabIndex={110}>
      <LocalTopLoadingBar show={isLoading} />
      <StyledContent>
        <CommentsFetcher />
      </StyledContent>
    </CollapsibleSection>
  );
}

const selectSortedThreadComments = createSelector([selectThreadComments], comments =>
  [...comments].sort((a, b) => a.timestamp - b.timestamp)
);

function CommentsFetcher() {
  const dispatch = useDispatch();

  const { account, chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const task = useTask(id);
  const taskId = task.taskID;

  const isLoading = useSelector(state => selectThreadIsLoading(state, { chainId, taskId }));
  const error = useSelector(state => selectThreadError(state, { chainId, taskId }));
  const data = useShallowEqualSelector(state => selectSortedThreadComments(state, { chainId, taskId }));

  const firstItemRef = React.useRef();
  const lastItemRef = React.useRef();
  const handleScrollTo = ref => evt => {
    evt.preventDefault();

    if (ref.current) {
      scrollIntoView(ref.current, {
        scrollMode: 'if-needed',
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  };

  React.useEffect(() => {
    if (account) {
      dispatch(getComments({ account, chainId, taskId }));
    }
  }, [dispatch, account, chainId, taskId]);

  const handleSubmitComment = React.useCallback(
    async values => {
      const comment = {
        postId: nanoid(),
        author: {
          // Addresses in 3Box are lower case.
          address: String(account).toLowerCase(),
        },
        message: values.comment,
        timestamp: Math.floor(new Date().getTime() / 1000),
        pending: true,
      };

      if (account) {
        try {
          await dispatch(
            addComment({ account, chainId, taskId, comment }, { meta: { thunk: { id: `${chainId}/${taskId}` } } })
          );
          dispatch(getComments({ account, chainId, taskId }));
        } catch (err) {
          console.warn('Failed to add comment', err.error);
        }
      }
    },
    [dispatch, account, chainId, taskId]
  );

  const { status, translation, lastInteraction, submissionTimeout } = task;
  const isFinalized = Task.isFinalized(status, translation, lastInteraction, submissionTimeout);
  return (
    <RequiredWalletGateway message="To participate in the discussion, you need to be connected to a wallet.">
      {error ? (
        <>
          <Alert type="error" message={error.message} />
          <Spacer />
        </>
      ) : null}
      <Spin $centered spinning={isLoading && data.length === 0} tip="Loading comments...">
        {data.length > 0 ? (
          <>
            <StyledActionsContainer>
              <StyledScrollAnchor href="#" onClick={handleScrollTo(lastItemRef)}>
                <ArrowDownOutlined /> Scroll to latest comment
              </StyledScrollAnchor>
            </StyledActionsContainer>
            <Spacer size={2.5} />
          </>
        ) : null}
        <CommentTimeline data={data} firstItemRef={firstItemRef} lastItemRef={lastItemRef} />
        {data.length > 0 ? (
          <>
            <Spacer size={2.5} />
            <StyledActionsContainer>
              <StyledScrollAnchor href="#" onClick={handleScrollTo(firstItemRef)}>
                <ArrowUpOutlined /> Scroll to 1st comment
              </StyledScrollAnchor>
            </StyledActionsContainer>
          </>
        ) : null}
        <Spacer />
        {!isFinalized ? <AddCommentForm onFinish={handleSubmitComment} /> : null}
      </Spin>
    </RequiredWalletGateway>
  );
}

const StyledContent = styled.article`
  padding: 2rem;

  @media (max-width: 767.98px) {
    padding: 2rem 0;
  }
`;

const StyledActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const StyledScrollAnchor = styled.a`
  margin-left: auto;
  text-align: right;
`;
