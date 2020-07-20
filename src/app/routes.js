import { compile } from 'path-to-regexp';

export const ROOT = '/';
export const HOME = '/home';
export const FAQ = '/faq';
export const TRANSLATOR_DASHBOARD = '/translator';
export const TRANSLATOR_SETTINGS = '/translator/settings';
export const REQUESTER_DASHBOARD = '/requester';
export const TRANSLATION_REQUEST = '/translation/new';
export const TRANSLATION_TASK_DETAILS = '/translation/:id(0x[\\da-f]{40}/\\d+)';

export const withParamSubtitution = route => {
  const toPath = compile(route);
  return params => toPath(params);
};
