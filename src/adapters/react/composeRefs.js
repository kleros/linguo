export default function composeRefs(first, ...rest) {
  if (rest.length === 1) {
    return composeTwoRefs(first, rest[0]) ?? null;
  }

  const composedRef = rest.reduce((acc, ref) => composeTwoRefs(acc, ref), first);

  return composedRef ?? null;
}

const composedRefCache = new WeakMap();

function composeTwoRefs(ref1, ref2) {
  if (ref1 && ref2) {
    const ref1Cache = composedRefCache.get(ref1) ?? new WeakMap();
    composedRefCache.set(ref1, ref1Cache);

    const composedRef =
      ref1Cache.get(ref2) ??
      (instance => {
        updateRef(ref1, instance);
        updateRef(ref2, instance);
      });

    ref1Cache.set(ref2, composedRef);

    return composedRef;
  }

  if (!ref1) {
    return ref2;
  } else {
    return ref1;
  }
}

function updateRef(ref, instance) {
  if (typeof ref === 'function') {
    ref(instance);
  } else {
    ref.current = instance;
  }
}
