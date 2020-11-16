const minimumLevelByQuality = {
  costEffective: 'B2',
  standard: 'C1',
  professional: 'C2',
};

export function createSkillsTaskMatcher(skills = []) {
  const cache = {};

  return ({ id, sourceLanguage, targetLanguage, expectedQuality }) => {
    if (cache[id] === undefined) {
      const minimumLevel = minimumLevelByQuality[expectedQuality];

      const hasSourceLanguageSkill = skills.some(
        ({ language, level }) => sourceLanguage === language && level >= minimumLevel
      );
      const hasTargetLanguageSkill = skills.some(
        ({ language, level }) => targetLanguage === language && level >= minimumLevel
      );

      cache[id] = hasSourceLanguageSkill && hasTargetLanguageSkill;
    }

    return cache[id];
  };
}
