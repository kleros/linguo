import { combination as originalCombination } from 'js-combinatorics';

export default function combination(arr, size) {
  return {
    *[Symbol.iterator]() {
      const cmb = originalCombination(arr, size);

      let item;
      while ((item = cmb.next())) {
        yield item;
      }
    },
  };
}
