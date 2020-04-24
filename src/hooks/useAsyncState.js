import { useState, useEffect, useCallback } from 'react';

export default function useAsyncState(getState, initialValue) {
  const [state, setState] = useState({
    tag: 'idle',
    data: initialValue,
    error: null,
  });

  const [rerenderControl, setRerenderControl] = useState();

  const refetch = useCallback(() => {
    setRerenderControl(1 + Math.random());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      setState(state => ({
        ...state,
        tag: 'loading',
        error: null,
      }));

      try {
        const data = await getState();
        if (!cancelled) {
          setState({ tag: 'succeeded', data, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ tag: 'errored', data: initialValue, error: err });
        }
      }
    };

    doFetch();

    return () => {
      cancelled = true;
    };
  }, [getState, initialValue, rerenderControl]);

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
    refetch,
  ];
}
