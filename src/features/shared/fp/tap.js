import curry from './curry';

const tap = (label, value) => {
  if (label) {
    console.log(`${label}:`, value);
  } else {
    console.log(value);
  }

  return value;
};

export default curry(tap);
