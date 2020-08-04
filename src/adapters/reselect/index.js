import { createSelector } from '@reduxjs/toolkit';
import { uncurry } from '~/shared/fp';

export const createCurriedSelector = curriedFn => (...selectors) => createSelector(...selectors, uncurry(curriedFn));
