const mapValues = (obj, fn) => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) =>
      Object.assign(acc, {
        [key]: fn(value, key, obj),
      }),
    {}
  );
};

export default mapValues;
