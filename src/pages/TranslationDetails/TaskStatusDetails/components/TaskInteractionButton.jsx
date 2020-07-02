import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { CheckOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
import Button from '~/components/Button';
import { approveTranslation, assignTranslator, reimburseRequester } from '~/features/tasks/tasksSlice';
import { selectAccount } from '~/features/web3/web3Slice';
import useStateMachine from '~/hooks/useStateMachine';
import useTask from '../../useTask';

const buttonStateMachine = {
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'pending',
      },
    },
    pending: {
      on: {
        SUCCESS: 'succeeded',
        ERROR: 'idle',
      },
    },
    succeeded: {
      final: true,
    },
  },
};

const TaskInteraction = {
  Assign: 'assign',
  Approve: 'approve',
  Reimburse: 'reimburse',
};

const interactionToActionCreator = {
  [TaskInteraction.Assign]: assignTranslator,
  [TaskInteraction.Approve]: approveTranslation,
  [TaskInteraction.Reimburse]: reimburseRequester,
};

const defaultButtonContent = {
  idle: {
    text: 'Send',
    icon: <SendOutlined />,
  },
  pending: {
    text: 'Sending...',
    icon: <LoadingOutlined />,
  },
  succeeded: {
    text: 'Done!',
    icon: <CheckOutlined />,
  },
};

function TaskInteractionButton({ interaction, content, buttonProps }) {
  const dispatch = useDispatch();
  const { id } = useTask();
  const account = useSelector(selectAccount);

  const [state, send] = useStateMachine(buttonStateMachine);
  const actionCreator = interactionToActionCreator[interaction];

  const action = React.useMemo(
    () =>
      actionCreator(
        { id, account },
        {
          meta: {
            tx: { wait: 0 },
            thunk: { id },
          },
        }
      ),
    [actionCreator, id, account]
  );

  const handleClick = React.useCallback(
    async evt => {
      evt.preventDefault();

      send('START');
      try {
        await dispatch(action);
        send('SUCCESS');
      } catch (err) {
        console.warn('Failed to submit:', err);
        send('ERROR');
      }
    },
    [dispatch, action, send]
  );

  const disabled = state !== 'idle';
  const icon = content[state] ? content[state].icon ?? null : defaultButtonContent[state].icon;
  const text = content[state]?.text ?? defaultButtonContent[state].text;

  return (
    <Button {...buttonProps} icon={icon} disabled={disabled} onClick={handleClick}>
      {text}
    </Button>
  );
}

const contentItemShape = t.shape({
  text: t.node.isRequired,
  icon: t.node,
});

TaskInteractionButton.propTypes = {
  interaction: t.oneOf(Object.values(TaskInteraction)).isRequired,
  content: t.shape({
    idle: contentItemShape,
    pending: contentItemShape,
    succeeded: contentItemShape,
  }),
  buttonProps: t.object,
};

TaskInteractionButton.defaultProps = {
  buttonProps: {},
  content: {},
};

TaskInteractionButton.Interaction = TaskInteraction;

export default TaskInteractionButton;
