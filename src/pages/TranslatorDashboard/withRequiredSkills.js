import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import * as r from '~/app/routes';

import { useTranslatorSkills } from '~/context/TranslatorSkillsProvider';

export const withRequiredSkills = WrappedComponent => {
  const WithRequiredSkills = props => {
    const history = useHistory();
    const { state } = useTranslatorSkills();

    useEffect(() => {
      if (!state.ids.length) {
        history.push({
          pathname: r.TRANSLATOR_SETTINGS,
          state: { message: 'Please set your skills first.' },
        });
      }
    }, [state, history]);

    return <WrappedComponent {...props} />;
  };
  WithRequiredSkills.displayName = `withAuthCheck(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithRequiredSkills;
};
