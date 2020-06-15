import serializerr from 'serializerr';

const normalizeErrorMiddleware = () => next => action => next(normalizeError(action));

export default normalizeErrorMiddleware;

const normalizeError = action => {
  const { payload } = action;

  if (payload instanceof Error) {
    return {
      ...action,
      payload: serializerr(payload),
      error: true,
    };
  }

  const { error } = action.payload ?? {};

  if (error) {
    return {
      ...action,
      payload: {
        ...payload,
        error: serializerr(error),
      },
      error: true,
    };
  }

  return action;
};
