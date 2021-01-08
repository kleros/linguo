import Box from '3box';
import { getResolver } from '3id-resolver';
import { Resolver } from 'did-resolver';
import { indexBy, prop } from '~/shared/fp';

const MODERATOR_WALLET_ADDRESS = '0xceB4c079Dd21494E0bc99DA732EAdf220b727389';

export default async function createInstance({ web3 }) {
  async function synchronize(account) {
    const box = await Box.openBox(account, web3.currentProvider);
    const space = await box.openSpace('Linguo');
    return await space.syncDone;
  }

  async function getPosts(account, threadId) {
    const thread = await _getThread(account, threadId);

    const ipfs = await Box.getIPFS();
    const resolver = new Resolver(getResolver(ipfs));

    /**
     * FIXME: when the app connects to 3Box for the first time, getPosts might return an empty array,
     * even when there are comments in the thread.
     * As a workaround, we try to fetch once again after some delay.
     */
    let posts = await thread.getPosts();
    if (posts.length === 0) {
      await delay(5000);
      posts = await thread.getPosts();
    }

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
  }

  async function addPost(account, threadId, content) {
    const thread = await _getThread(account, threadId);
    return await thread.post(content);
  }

  async function _getThread(account, threadId) {
    const box = await Box.openBox(account, web3.currentProvider);
    const space = await box.openSpace('Linguo');
    await space.syncDone;

    return await space.joinThread(threadId, {
      firstModerator: MODERATOR_WALLET_ADDRESS,
      members: false,
    });
  }

  return {
    synchronize,
    getPosts,
    addPost,
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
