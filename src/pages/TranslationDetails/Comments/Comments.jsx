import React from 'react';
import styled from 'styled-components';
import produce from 'immer';
import { Alert, Spin } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import scrollIntoView from 'scroll-into-view-if-needed';
import { Task } from '~/features/tasks';
import RequiredWalletGateway from '~/features/web3/RequiredWalletGateway';
import { selectAccount, selectChainId } from '~/features/web3/web3Slice';
import CollapsibleSection from '~/shared/CollapsibleSection';
import Spacer from '~/shared/Spacer';
import { LocalTopLoadingBar } from '~/shared/TopLoadingBar';
import { useThread } from '~/features/comments';
import useTask from '../useTask';
import AddCommentForm from './AddCommentForm';
import CommentTimeline from './CommentTimeline';

export default function Comments() {
  const account = useSelector(selectAccount);
  const chainId = useSelector(selectChainId);
  const task = useTask();
  const taskId = task.id;
  const { isReady, isInitializing, getPosts, addPost } = useThread(`${chainId}/${taskId}`);
  const [data, setData] = React.useState({
    state: 'idle',
    posts: [],
    error: null,
  });

  const fetchPosts = React.useCallback(async () => {
    if (isReady && account) {
      setData(
        produce(data => {
          data.state = 'loading';
        })
      );
      try {
        const posts = await getPosts(taskId);
        setData(
          produce(data => {
            data.state = 'idle';
            data.posts = posts;
            data.error = null;
          })
        );
      } catch (err) {
        setData(
          produce(data => {
            data.state = 'error';
            data.error = err;
          })
        );
      }
    }
  }, [isReady, account, getPosts, taskId]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSubmitComment = React.useCallback(
    async values => {
      if (isReady) {
        setData(
          produce(data => {
            data.state = 'loading';
          })
        );
        try {
          await addPost(values.comment);
          await fetchPosts();
        } catch (err) {
          setData(
            produce(data => {
              data.state = 'error';
              data.error = err;
            })
          );
        }
      }
    },
    [isReady, addPost, fetchPosts]
  );

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

  return (
    <CollapsibleSection defaultOpen={true} title="Comments" titleLevel={3} tabIndex={110}>
      <LocalTopLoadingBar show={isInitializing || data.state === 'loading'} />
      <StyledContent>
        <RequiredWalletGateway message="To participate in the discussion, you need to be connected to a wallet.">
          {data.error ? (
            <>
              <Alert type="error" message={data.error.message} />
              <Spacer />
            </>
          ) : null}
          <Spin spinning={isInitializing} tip="Loading comments...">
            {data?.posts?.length > 0 ? (
              <>
                <StyledActionsContainer>
                  <StyledScrollAnchor href="#" onClick={handleScrollTo(lastItemRef)}>
                    <ArrowDownOutlined /> Scroll to latest comment
                  </StyledScrollAnchor>
                </StyledActionsContainer>
                <Spacer size={2.5} />
              </>
            ) : null}
            <CommentTimeline data={data.posts} firstItemRef={firstItemRef} lastItemRef={lastItemRef} />
            {data?.posts?.length > 0 ? (
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
            {!Task.isFinalized(task) ? (
              <AddCommentForm onFinish={handleSubmitComment} disabled={isInitializing || data.state === 'loading'} />
            ) : null}
          </Spin>
        </RequiredWalletGateway>
      </StyledContent>
    </CollapsibleSection>
  );
}

const StyledContent = styled.article`
  padding: 2rem;
  background-color: ${p => p.theme.color.background.default};

  @media (max-width: 767.98px) {
    padding: 2rem 0;
    background-color: transparent;
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
