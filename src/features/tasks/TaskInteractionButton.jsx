import React from 'react';
import t from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { CheckOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
import Button from '~/shared/Button';
import { selectAccount } from '~/features/web3/web3Slice';
import useStateMachine from '~/shared/useStateMachine';
import { approveTranslation, assignTranslator, reimburseRequester, withdrawAllFeesAndRewards } from './tasksSlice';

export default function TaskInteractionButton({ id, interaction, content, buttonProps, onSuccess, onFailure }) {
  const dispatch = useDispatch();
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
        const result = await dispatch(action);
        onSuccess(result);
        send('SUCCESS');
      } catch (err) {
        console.warn('Failed to submit:', err);
        onFailure(err);
        send('ERROR');
      }
    },
    [dispatch, action, send, onSuccess, onFailure]
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

const TaskInteraction = {
  Assign: 'assign',
  Approve: 'approve',
  Reimburse: 'reimburse',
  Withdraw: 'withdraw',
};

TaskInteractionButton.propTypes = {
  id: t.string.isRequired,
  interaction: t.oneOf(Object.values(TaskInteraction)).isRequired,
  content: t.shape({
    idle: contentItemShape,
    pending: contentItemShape,
    succeeded: contentItemShape,
  }),
  buttonProps: t.object,
  onSuccess: t.func,
  onFailure: t.func,
};

TaskInteractionButton.defaultProps = {
  buttonProps: {},
  content: {},
  onSuccess: () => {},
  onFailure: () => {},
};

TaskInteractionButton.Interaction = TaskInteraction;

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

const interactionToActionCreator = {
  [TaskInteraction.Assign]: assignTranslator,
  [TaskInteraction.Approve]: approveTranslation,
  [TaskInteraction.Reimburse]: reimburseRequester,
  [TaskInteraction.Withdraw]: withdrawAllFeesAndRewards,
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
