import { useReducer } from 'react';
import useCallbackIfMounted from './useCallbackIfMounted';

const createReducer =
  (machine, { warnOnError, throwOnError }) =>
  (state, event) => {
    if (!machine.states[state]) {
      const message = `Machine ${machine.name || '<unnamed>'} does not have a definition for state ${state}.`;

      if (warnOnError) {
        console.warn(message);
      }
      if (throwOnError) {
        throw new Error(message);
      }
    }

    if (!machine.states[state].on || !machine.states[state].on[event]) {
      const message = `Machine ${
        machine.name || '<unnamed>'
      } does not have a definition for event ${event} on state ${state}.`;

      if (warnOnError) {
        console.warn(message);
      }

      if (throwOnError) {
        throw new Error(message);
      }
    }

    return machine.states[state].on[event] ?? state;
  };

export default function useStateMachine(
  machine,
  { warnOnError = process.env.NODE_ENV !== 'production', throwOnError = false } = {}
) {
  const [state, dispatch] = useReducer(createReducer(machine, { warnOnError, throwOnError }), machine.initial);

  return [state, useCallbackIfMounted(dispatch)];
}
