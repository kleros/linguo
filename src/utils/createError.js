export default function createError(message, { cause } = {}) {
  const propDescriptors = [cause].map(value => ({
    configurable: false,
    enumerable: true,
    writable: false,
    value,
  }));

  return Object.defineProperties(new Error(message), propDescriptors);
}
