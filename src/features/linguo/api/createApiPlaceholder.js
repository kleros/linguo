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
  throw new Error(`API not properly initialized.
    Did you forget to wrap the calling component into a <LinguoApiReadyGateway> component?`);
};
