import { serializeError } from 'serialize-error';

const normalizeErrorMiddleware = () => next => action => next(normalizeError(action));

export default normalizeErrorMiddleware;

const normalizeError = action => {
  const { payload } = action;

  if (payload instanceof Error) {
    return {
      ...action,
      payload: serializeError(payload),
      error: true,
    };
  }

  const { error, ...rest } = payload ?? {};

  if (error) {
    return {
      ...action,
      payload: {
        ...rest,
        error: serializeError(error),
      },
      error: true,
    };
  }

  return action;
};
