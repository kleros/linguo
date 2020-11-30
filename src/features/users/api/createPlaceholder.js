export default function createPlaceholder() {
  const placeholder = async () => {
    throw new Error('E-mail Preferences API not properly initialized.');
  };

  return {
    update: placeholder,
    get: placeholder,
  };
}
