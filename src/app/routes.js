import { compile } from 'path-to-regexp';

export const HOME = '/';
export const TRANSLATOR_DASHBOARD = '/translator';
export const TRANSLATOR_SETTINGS = '/translator/settings';
export const TRANSLATION_DASHBOARD = '/translation';
export const TRANSLATION_REQUEST = '/translation/new';
export const TRANSLATION_TASK_DETAILS = '/translation/:id(0x[\\da-f]{40}/\\d+)';

export const withParamSubtitution = route => {
  const toPath = compile(route);
  return params => toPath(params);
};
