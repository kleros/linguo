import { TaskParty } from '~/features/tasks';
import filters from './filters';

const secondLevelFilters = {
  [filters.inReview]: {
    toReview: 'toReview',
    myTranslations: 'myTranslations',
  },
};

export default secondLevelFilters;

const allPass = () => true;

export function hasSecondLevelFilters(firstLevelFilterName) {
  return secondLevelFilters[firstLevelFilterName] !== undefined;
}

export function getSecondLevelFilter(firstLevelFilterName, filterName, { account }) {
  const filterMap = {
    [filters.inReview]: {
      toReview: ({ parties }) => parties[TaskParty.Translator] !== account,
      myTranslations: ({ parties }) => parties[TaskParty.Translator] === account,
    },
  };

  return filterMap[firstLevelFilterName]?.[filterName] ?? allPass;
}
