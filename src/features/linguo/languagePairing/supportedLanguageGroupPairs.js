import LanguageGroupPair from './LanguageGroupPair';

const fromEnv = process.env.AVAILABLE_LANGUAGE_GROUP_PAIRS;

if (!fromEnv) {
  throw new Error('Missing AVAILABLE_LANGUAGE_GROUP_PAIRS environment variable.');
}

let languageGroupPairs = [];

try {
  languageGroupPairs = JSON.parse(fromEnv).map(LanguageGroupPair.fromJSON);
} catch (err) {
  throw new Error('AVAILABLE_LANGUAGE_GROUP_PAIRS environment variable must be a valid JSON');
}

export default languageGroupPairs;

export function isSupportedLanguageGroupPair(langGroupPairLike) {
  if (!langGroupPairLike) {
    return false;
  }

  const langGroupPair =
    langGroupPairLike.constructor === LanguageGroupPair ? langGroupPairLike : LanguageGroupPair.of(langGroupPairLike);

  return languageGroupPairs.some(item => item.equals(langGroupPair));
}
