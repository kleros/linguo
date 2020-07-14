export default function createApiPlaceholder() {
  return new Proxy(
    {},
    {
      get: () => new Proxy(() => {}, methodHandler),
    }
  );
}
const methodHandler = {
  apply: (target, thisArg, argumentList) => {
    return methodPlaceholder(argumentList);
  },
};

const methodPlaceholder = async () => {
  throw new Error(`Linguo API not properly initialized.`);
};
