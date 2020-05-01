import loadable from '@loadable/component';

/**
 * Since the contents are the same as for the requester, we are just re-sxportingthe component.
 *
 * For some reason plain re-export doesn't play nice with @loadable/component from index.js
 * so we are doing it through @loadable/component itself.
 */
export default loadable(async () => {
  const AwaitingReviewForRequester = await import('./AwaitingReviewForRequester.jsx');

  const AwaitingReviewForOther = AwaitingReviewForRequester;
  AwaitingReviewForOther.displayName = 'AwaintingReviewForOther';

  return AwaitingReviewForOther;
});
