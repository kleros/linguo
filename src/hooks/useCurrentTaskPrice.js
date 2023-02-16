import React from 'react';

import taskStatus from '~/consts/taskStatus';
import useInterval from '~/hooks/useInterval';
import Task from '~/utils/task';

import { _1_MINUTE_MS } from '~/consts/time';

export const useCurrentTaskPrice = (
  status,
  minPrice,
  maxPrice,
  assignedPrice,
  wordCount,
  lastInteraction,
  submissionTimeout
) => {
  const [currentPrice, setCurrentPrice] = React.useState(
    Task.getCurrentPrice(assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout)
  );

  const updateCurrentValue = React.useCallback(() => {
    const value = Task.getCurrentPrice(assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout);
    setCurrentPrice(value);
  }, [assignedPrice, minPrice, maxPrice, lastInteraction, submissionTimeout]);

  const interval = status === taskStatus.Created ? _1_MINUTE_MS : null;
  useInterval(updateCurrentValue, interval);

  const pricePerWord = Task.getCurrentPricePerWord(currentPrice, wordCount);

  return { currentPrice, pricePerWord };
};
