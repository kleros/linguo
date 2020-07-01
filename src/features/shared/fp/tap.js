import curry from './curry';

const tap = (label, value) => {
  if (label) {
    console.debug(`${label}:`, value);
  } else {
    console.debug(value);
  }

  return value;
};

export default curry(tap);
