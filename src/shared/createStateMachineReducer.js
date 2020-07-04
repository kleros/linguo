export default function createStateMachineReducer(stateMachine, createContextReducer) {
  const contextReducer = createContextReducer(stateMachine.context);

  return (
    stateWrapper = {
      state: stateMachine.initial,
      context: stateMachine.context,
    },
    action
  ) => {
    const { state, context } = stateWrapper;

    const next = stateMachine.states[stateWrapper.state]?.on?.[action.type];

    if (!next) {
      return { state, context };
    }

    if (typeof next === 'string') {
      return {
        state: next,
        context: contextReducer(context, action),
      };
    }

    if (isPlainObject(next)) {
      const { target, guard = allPass } = next;

      if (!guard({ state, context, action })) {
        return { state, context };
      }

      return {
        target,
        context: contextReducer(context, action),
      };
    }

    if (Array.isArray(next)) {
      const transition = next.find(({ guard = allPass }, index, array) => {
        const isLast = index === array.length - 1;
        if (!isLast && guard === allPass) {
          console.warn(`Error in state machine "${stateMachine.name}":
            Transition from "${state}" has multiple transitions for "${action}".
            If the \`guard\` property is omitted in a transition which is not the last one in the array, this transition will ALWAYS be executed.
            This is likely a bug.`);
        }

        return guard({ state, context, action });
      });
      if (!transition) {
        return { state, context };
      }

      return {
        state: transition.target,
        context: contextReducer(context, action),
      };
    }

    throw new Error('State transition descriptor must be a plain object.');
  };
}

const allPass = () => true;

const isPlainObject = obj => Object(obj) === obj && obj.constructor === Object;
