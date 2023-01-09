import React from 'react';

import { useTaskQuery } from './queries/useTaskQuery';
import { useIPFSQuery } from './queries/useIPFSQuery';

import useInterval from '~/shared/useInterval';

import { useWeb3 } from './useWeb3';

import Task from '~/utils/task';
import taskStatus from '~/consts/taskStatus';
import { _1_MINUTE_MS } from '~/consts/time';

export const useTask = id => {
  const { account } = useWeb3();
  const { task, isLoading, isError } = useTaskQuery(id);
  const { data } = useIPFSQuery(task?.metaEvidence?.URI);

  const {
    challenger,
    lastInteraction,
    numberOfRounds,
    requester,
    requesterDeposit,
    translation,
    translator,
    status,
    submissionTimeout,
  } = task;

  const { minPrice, maxPrice, wordCount } = data?.metadata;

  const latestRoundId = `${id}-${Number(numberOfRounds) - 1}`;
  const [currentPrice, setCurrentPrice] = React.useState(
    Task.getCurrentPrice(minPrice, maxPrice, lastInteraction, submissionTimeout, status)
  );

  const updateCurrentPrice = React.useCallback(() => {
    const value = Task.getCurrentPrice(minPrice, maxPrice, lastInteraction, submissionTimeout, status);
    setCurrentPrice(value);
  }, [lastInteraction, maxPrice, minPrice, status, submissionTimeout]);

  const interval = requesterDeposit === undefined ? _1_MINUTE_MS : null;
  useInterval(updateCurrentPrice, interval);

  const actualPrice = status === taskStatus.Assigned ? requesterDeposit : currentPrice;
  const pricePerWord = Task.getCurrentPricePerWord(actualPrice, wordCount);
  const isIncomoplete = Task.isIncomplete(status, translation, lastInteraction, submissionTimeout);

  const currentParty = Task.getCurrentParty(account, requester, translator, challenger);

  return {
    task: {
      ...task,
      ...data?.metadata,
      actualPrice,
      currentPrice,
      pricePerWord,
      currentParty,
      latestRoundId,
      isLoading,
      isIncomoplete,
    },
    isLoading,
    isError,
  };
};
