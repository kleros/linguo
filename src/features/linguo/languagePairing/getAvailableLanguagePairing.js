import languages from '~/assets/fixtures/languages';
import languageGroupPairs from './availableLanguageGroupPairs';

export default function getAvailableLanguagePairing(languageCode) {
  if (!languageCode) {
    return languages;
  }

  const group = getLanguageGroup(languageCode);

  const currentLanguageGroupPairs = languageGroupPairs.filter(lgp => lgp.contains(group));

  const currentLanguageGroups = new Set(currentLanguageGroupPairs.map(lgp => [...lgp]).flat());

  return languages.filter(language => {
    const innerGroup = getLanguageGroup(language.code);
    return group !== innerGroup && currentLanguageGroups.has(innerGroup);
  });
}

const getLanguageGroup = language => String(language).split('-')[0];
