import React from 'react';
import t from 'prop-types';
import { useWeb3React } from '@web3-react/core';
import { useSelector } from 'react-redux';
import Box from '3box';
import { getResolver } from '3id-resolver';
import { Resolver } from 'did-resolver';
import { indexBy, prop } from '~/shared/fp';
import { selectAccount } from '~/features/web3/web3Slice';

const CommentsContext = React.createContext({
  state: 'idle',
  space: null,
  resolver: null,
});

export const CommentsProvider = React.memo(function CommentsProvider({ children }) {
  const account = useSelector(selectAccount);
  const { library: web3 } = useWeb3React();
  const [info, setInfo] = React.useState({
    state: 'idle',
    space: null,
    resolver: null,
  });

  React.useEffect(() => {
    async function setup() {
      setInfo({
        state: 'initializing',
        space: null,
        resolver: null,
      });

      const box = await Box.openBox(account, web3.currentProvider);
      const space = await box.openSpace('Linguo');
      await space.syncDone;

      const ipfs = await Box.getIPFS();
      const resolver = new Resolver(getResolver(ipfs));

      setInfo({
        state: 'ready',
        space: space,
        resolver: resolver,
      });
    }

    if (account && web3) {
      setup();
    }
  }, [account, web3]);

  return <CommentsContext.Provider value={info}>{children}</CommentsContext.Provider>;
});

CommentsProvider.propTypes = {
  children: t.node,
};

CommentsProvider.defaultProps = {
  children: null,
};

const MODERATOR_WALLET_ADDRESS = '0xceB4c079Dd21494E0bc99DA732EAdf220b727389';

export function useThread(threadId) {
  const { state, space, resolver } = React.useContext(CommentsContext);

  const [thread, setThread] = React.useState(null);

  React.useEffect(() => {
    async function setupThread() {
      if (space !== null) {
        setThread(
          await space.joinThread(threadId, {
            firstModerator: MODERATOR_WALLET_ADDRESS,
            members: false,
          })
        );
      }
    }

    setupThread();
  }, [space, threadId]);

  const getPosts = React.useCallback(async () => {
    if (!thread) {
      return [];
    }

    const posts = await thread.getPosts();
    const uniqueUsers = await Promise.all(
      [...new Set(posts.map(x => x.author))].map(async did => {
        const resolvedId = await resolver.resolve(did);
        return {
          address: resolvedId.publicKey?.[2]?.ethereumAddress,
          did,
        };
      })
    );
    const usersByDid = indexBy(prop('did'), uniqueUsers);

    return posts.map(post => ({
      ...post,
      author: usersByDid[post.author],
    }));
  }, [thread, resolver]);

  const addPost = React.useCallback(
    async content => {
      if (!thread) {
        throw new Error('Thread is not ready');
      }

      return await thread.post(content);
    },
    [thread]
  );

  return {
    isReady: state === 'ready',
    isInitializing: state === 'initializing',
    getPosts,
    addPost,
  };
}
