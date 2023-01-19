import { useTaskQuery } from './queries/useTaskQuery';
import { useMetaEvidenceQuery } from './queries/useMetaEvidenceQuery';

import { useWeb3 } from './useWeb3';
import { useCurrentTaskPrice } from './useCurrentTaskPrice';

import Task from '~/utils/task';

export const useTask = id => {
  const { account } = useWeb3();
  const { task, isLoading, isError } = useTaskQuery(id);
  const { metadata, isLoading: isMetadataLoading } = useMetaEvidenceQuery(task?.metaEvidence?.URI);

  const {
    assignedPrice,
    challenger,
    lastInteraction,
    numberOfRounds,
    requester,
    translation,
    translator,
    status,
    submissionTimeout,
  } = task;

  const { minPrice, maxPrice, wordCount } = metadata;

  const latestRoundId = `${id}-${Number(numberOfRounds) - 1}`;
  const isPending = Task.isPending(status);
  const isIncomplete = Task.isIncomplete(status, translation, lastInteraction, submissionTimeout);

  const { currentPrice, pricePerWord } = useCurrentTaskPrice(
    status,
    minPrice,
    maxPrice,
    assignedPrice,
    wordCount,
    lastInteraction,
    submissionTimeout
  );

  const currentParty = Task.getCurrentParty(account?.toLowerCase(), requester, translator, challenger);

  return {
    task: {
      ...task,
      ...metadata,
      currentPrice,
      pricePerWord,
      currentParty,
      latestRoundId,
      isLoading,
      isIncomplete,
      isPending,
    },
    isLoading: isLoading || isMetadataLoading,
    isError,
  };
};
