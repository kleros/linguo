import { filter } from '~/shared/fp';

export default function getRelevantSkills(skills) {
  return filter(({ level = 'A1' }) => level >= 'B2', skills);
}
