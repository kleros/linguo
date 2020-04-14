import { useState, useEffect, useCallback } from 'react';

export default function useAsyncState(getState, initialValue, { runImmediately = false } = {}) {
  const [state, setState] = useState({
    tag: 'idle',
    data: initialValue,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(tasks => ({
      ...tasks,
      tag: 'loading',
      error: null,
    }));
    try {
      setState({
        tag: 'succeeded',
        data: await getState(),
        error: null,
      });
    } catch (err) {
      setState({
        tag: 'errored',
        data: initialValue,
        error: err,
      });
    }
  }, [initialValue, getState]);

  useEffect(() => {
    if (runImmediately) {
      fetch();
    }
  }, [runImmediately, fetch]);

  const { data, error } = state;

  return [
    {
      data,
      error,
      isIdle: state.tag === 'idle',
      isLoading: state.tag === 'loading',
      isSuccess: state.tag === 'succeeded',
      isError: state.tag === 'errored',
    },
    fetch,
  ];
}
