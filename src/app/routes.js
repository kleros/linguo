export const HOME = '/';
export const TRANSLATOR_DASHBOARD = '/translator';
export const TRANSLATOR_SETTINGS = '/translator/settings';
export const TRANSLATION_DASHBOARD = '/translation';
export const TRANSLATION_CREATION = '/translation/new';
export const TRANSLATION_TASK_DETAILS = '/translation/:id';

export const withParamSubtitution = route => params =>
  Object.entries(params).reduce((partialRoute, [name, value]) => partialRoute.replace(`:${name}`, value), route);
