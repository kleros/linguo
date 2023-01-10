import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { indexBy, map, prop } from '~/shared/fp';
import allLanguages from '~/assets/fixtures/languages';
import useLocalStorage from '~/hooks/useLocalStorage';

const allLanguageCodes = allLanguages.map(({ code }) => code);
const STORAGE_KEY = 'persist-state/translatorSkills';

export const EMPTY_SKILL = {
  language: undefined,
  level: undefined,
};

const initialState = {
  ids: [],
  entities: {},
};

const TranslatorSkillsContext = createContext({
  state: initialState,
  actions: {
    updateSkills: () => {},
    clearSkills: () => {},
  },
  selectors: {
    selectAllSkillLanguages: () => [],
    selectAllSkills: () => [],
  },
});

const TranslatorSkillsProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [storedValue, setStoreValue] = useLocalStorage(STORAGE_KEY, initialState);

  useEffect(() => {
    if (!isEmpty(storedValue)) {
      setState(storedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setStoreValue(state);
  }, [setStoreValue, state]);

  const updateSkills = skills => {
    const getLanguage = prop('language');
    const newEntities = indexBy(getLanguage, skills);
    const newIds = map(getLanguage, skills);
    setState({ ...state, entities: newEntities, ids: newIds });
  };

  const clearSkills = () => {
    setState(initialState);
  };

  const selectAllSkillLanguages = state => state.ids.filter(code => allLanguageCodes.includes(code)) ?? null;

  const selectAllSkills = state => {
    const allSkills = selectAllSkillLanguages(state).map(language => state.entities[language]);
    return allSkills.length > 0 ? allSkills : [EMPTY_SKILL];
  };

  const actions = { updateSkills, clearSkills };
  const selectors = { selectAllSkillLanguages, selectAllSkills };

  return (
    <TranslatorSkillsContext.Provider value={{ state, actions, selectors }}>
      {children}
    </TranslatorSkillsContext.Provider>
  );
};

export default TranslatorSkillsProvider;

export const useTranslatorSkills = () => {
  const context = useContext(TranslatorSkillsContext);
  if (context === undefined) {
    throw new Error('useTranslatorSkills must be used within a TranslatorSkillsProvider');
  }
  return context;
};

TranslatorSkillsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const isEmpty = obj => Object.entries(obj).every(([_, value]) => !value);
