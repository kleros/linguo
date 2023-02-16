import languages from '~/assets/fixtures/languages';
import languageGroupPairs from './supportedLanguageGroupPairs';
import getLanguageGroup from './getLanguageGroup';

export default function getAvailableLanguagePairing(languageCode) {
  if (!languageCode) {
    return languages.filter(language => {
      const group = getLanguageGroup(language.code);
      return languageGroupPairs.some(lgp => lgp.contains(group));
    });
  }

  const group = getLanguageGroup(languageCode);

  const currentLanguageGroupPairs = languageGroupPairs.filter(lgp => lgp.contains(group));

  const currentLanguageGroups = new Set(currentLanguageGroupPairs.map(lgp => [...lgp]).flat());

  return languages.filter(language => {
    const innerGroup = getLanguageGroup(language.code);
    return group !== innerGroup && currentLanguageGroups.has(innerGroup);
  });
}
