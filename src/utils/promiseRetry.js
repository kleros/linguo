export default async function promiseRetry(promise, { maxAttempts = 5, delay = 1000, shouldRetry = () => true } = {}) {
  let count = 0;
  let result;
  let succeeded = false;
  let anotherTry = true;

  const collectedErrors = [];

  while (count < maxAttempts && anotherTry === true) {
    try {
      result = await promise;
      succeeded = true;
      break;
    } catch (err) {
      collectedErrors.push(err);
      anotherTry = shouldRetry(err);
      count += 1;
      await new Promise(resolve => setTimeout(resolve, getDelay(delay, count)));
    }
  }

  if (!succeeded) {
    throw Object.create(new Error('Failed after many retries'), {
      code: {
        value: 'EPROMISERETRY',
      },
      cause: {
        value: collectedErrors,
        enumerable: true,
      },
    });
  }

  return result;
}

const getDelay = (delay, count) => {
  if (Array.isArray(delay)) {
    const latestIndex = delay.length - 1;
    return delay[Math.min(count, latestIndex)];
  }

  if (typeof delay === 'number') {
    return delay;
  }

  if (typeof delay === 'function') {
    return delay(count);
  }

  throw new Error('Unknown delay type');
};
