import React from 'react';
import t from 'prop-types';
import { CheckOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
import Button from '~/shared/Button';
import { useLinguoApi } from '~/hooks/useLinguo';
import { useTransactionState } from '~/hooks/useTransactionState';

export default function TaskInteractionButton({ id, interaction, content, buttonProps }) {
  const linguo = useLinguoApi();

  const interactionToActionMap = {
    [TaskInteraction.Assign]: () => linguo.assignTask(id),
    [TaskInteraction.Accept]: () => linguo.acceptTranslation(id),
    [TaskInteraction.Reimburse]: () => linguo.reimburseRequester(id),
    [TaskInteraction.Withdraw]: () => linguo.withdrawAllFeesAndRewards(id),
  };

  const taskAction = interactionToActionMap[interaction];

  const { state, handleTransaction } = useTransactionState(taskAction);

  const disabled = state !== 'idle';
  const icon = content[state] ? content[state].icon ?? null : defaultButtonContent[state].icon;
  const text = content[state]?.text ?? defaultButtonContent[state].text;

  return (
    <Button {...buttonProps} icon={icon} disabled={disabled} onClick={handleTransaction}>
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
  Accept: 'accept',
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
};

TaskInteractionButton.Interaction = TaskInteraction;

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
