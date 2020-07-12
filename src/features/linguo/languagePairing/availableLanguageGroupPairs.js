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
