const SEPARATOR = '|';

/**
 * Creates a language group pair.
 *
 * **IMPORTANT: **Language groups are the the 'prefix' of languages, that is,
 * languages with distinct variations, such as `en-US` and `en-GB` form the
 * `en` language group.
 *
 * @param {string} first
 * @param {string} second
 * @return LanguageGroupPair
 */
export default function LanguageGroupPair(first, second) {
  if (!first || !second) {
    throw new Error(`Invalid language group pair (${first}, ${second})`);
  }

  if (first === second) {
    throw new Error('Language group pairs must contain different languages');
  }

  /**
   * Here we sort to make sure that both en-US|pt-BR and pt-BR|en-US are the same
   */
  const pair = [first, second].sort();

  return Object.create(null, {
    constructor: {
      value: LanguageGroupPair,
    },
    toString: {
      value: function toString() {
        return pair.join(SEPARATOR);
      },
    },
    toJSON: {
      value: function toJSON() {
        return pair.join(SEPARATOR);
      },
    },
    contains: {
      value: function contains(language) {
        return pair.includes(language);
      },
    },
    inspect: {
      value: function inspect() {
        return `LanguagePair {${pair[0]}, ${pair[1]}}`;
      },
    },
    [Symbol.toStringTag]: {
      value: function toString() {
        return `LanguagePair`;
      },
    },
    [Symbol.iterator]: {
      value: function* iterator() {
        yield* pair[Symbol.iterator]();
      },
    },
  });
}

Object.defineProperties(LanguageGroupPair, {
  fromString: {
    value: str => LanguageGroupPair(...String(str).split(SEPARATOR)),
  },
  fromJSON: {
    value: str => LanguageGroupPair(...String(str).split(SEPARATOR)),
  },
  fromArray: {
    value: ([first, second]) => LanguageGroupPair(first, second),
  },
});

/**
 * @typedef {object} LanguagePair
 * @prop {Function} constructor
 * @prop {() => string} toString
 * @prop {() => string} toJSON
 * @prop {() => string} [Symbol.toStringTag]
 * @prop {(other: string) => boolean} contains whether the pair contians a given language or not.
 */
