import React from 'react';
import t from 'prop-types';
import { mutate } from 'swr';
import { SendOutlined, LoadingOutlined, CheckOutlined } from '@ant-design/icons';
import { Task, useLinguo } from '~/app/linguo';
import { useWeb3React } from '~/app/web3React';
import useStateMachine from '~/hooks/useStateMachine';
import wrapWithNotification from '~/utils/wrapWithNotification';
import Button from '~/components/Button';
import TaskContext from '../../TaskContext';

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
  Challenge: 'challenge',
  Approve: 'approve',
  Reimburse: 'reimburse',
};

const interactionToApiMethodMap = {
  [TaskInteraction.Assign]: 'assignTask',
  [TaskInteraction.Challenge]: 'challengeTranslation',
  [TaskInteraction.Approve]: 'approveTranslation',
  [TaskInteraction.Reimburse]: 'reimburseRequester',
};

const interactionToMutationMap = {
  [TaskInteraction.Assign]: ({ account }) => task => Task.registerAssignment(task, { account }),
  [TaskInteraction.Challenge]: ({ account }) => task => Task.registerChallenge(task, { account }),
  [TaskInteraction.Approve]: () => task => Task.registerApproval(task),
  [TaskInteraction.Reimburse]: () => task => Task.registerReimbursement(task),
};

const defaultButtonContent = {
  idle: (
    <>
      <SendOutlined /> Send
    </>
  ),
  pending: (
    <>
      <LoadingOutlined /> Sending...
    </>
  ),
  succeeded: (
    <>
      <CheckOutlined /> Done!
    </>
  ),
};

const withNotification = wrapWithNotification({
  errorMessage: 'Failed to submit the transaction',
  successMessage: 'Transaction submitted sucessfuly',
  duration: 10,
});

function TaskInteractionButton({ interaction, content, buttonProps }) {
  const { ID } = React.useContext(TaskContext);
  const linguo = useLinguo();
  const { account } = useWeb3React();
  const [state, dispatch] = useStateMachine(buttonStateMachine);

  const apiMethod = interactionToApiMethodMap[interaction];
  const updateTaskParams = interactionToMutationMap[interaction]({ account });

  const disabled = state !== 'idle';

  const handleClick = React.useCallback(
    withNotification(async evt => {
      evt.preventDefault();

      try {
        dispatch('START');
        const result = await linguo.api[apiMethod]({ ID }, { from: account });
        await mutate(['getTaskById', ID], updateTaskParams);
        dispatch('SUCCESS');
        return result;
      } catch (err) {
        console.log(err);
        dispatch('ERROR');
        throw err;
      } finally {
      }
    }),
    [dispatch, linguo.api, apiMethod, ID, account, history, location]
  );

  return (
    <Button {...buttonProps} disabled={disabled} onClick={handleClick}>
      {content[state] ?? defaultButtonContent[state]}
    </Button>
  );
}

TaskInteractionButton.propTypes = {
  interaction: t.oneOf(Object.values(TaskInteraction)).isRequired,
  content: t.shape({
    idle: t.node,
    pending: t.node,
    succeeded: t.node,
  }),
  buttonProps: t.object,
};

TaskInteractionButton.defaultProps = {
  buttonProps: {},
  content: {},
};

TaskInteractionButton.Interaction = TaskInteraction;

export default TaskInteractionButton;
