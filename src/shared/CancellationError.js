import { mapValues } from './fp';

const cancellationErrorType = Symbol('@@cancellation-error');

export default function CancellationError(message, rest = {}) {
  const restDescriptors = mapValues(
    value => ({
      value,
      enumerable: true,
    }),
    rest
  );

  return Object.create(new Error(message), {
    ...restDescriptors,
    name: {
      value: CancellationError.name,
    },
    type: {
      value: cancellationErrorType,
    },
  });
}

Object.defineProperty(CancellationError, Symbol.hasInstance, {
  value: obj => {
    return obj.type === cancellationErrorType;
  },
});
