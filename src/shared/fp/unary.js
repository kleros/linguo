const unary =
  fn =>
  (first, ...ignored) =>
    fn(first);

export default unary;
