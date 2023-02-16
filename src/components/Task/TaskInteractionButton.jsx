import React from 'react';
import t from 'prop-types';
import { CheckOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons';
import Button from '~/shared/Button';
import { useLinguoApi } from '~/hooks/useLinguo';
import { useTransactionState, STATE } from '~/hooks/useTransactionState';

export default function TaskInteractionButton({ id, interaction, content, buttonProps }) {
  const { getTranslatorDeposit, assignTask, acceptTranslation, reimburseRequester, withdrawAllFeesAndRewards } =
    useLinguoApi();

  const deposit = getTranslatorDeposit(id);
  const interactionToActionMap = {
    [TaskInteraction.Assign]: () => assignTask(id, deposit),
    [TaskInteraction.Accept]: () => acceptTranslation(id),
    [TaskInteraction.Reimburse]: () => reimburseRequester(id),
    [TaskInteraction.Withdraw]: () => withdrawAllFeesAndRewards(id),
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
    [STATE.DEFAULT]: contentItemShape,
    [STATE.PENDING]: contentItemShape,
    [STATE.SUCCESS]: contentItemShape,
  }),
  buttonProps: t.object,
};

TaskInteractionButton.defaultProps = {
  buttonProps: {},
  content: {},
};

TaskInteractionButton.Interaction = TaskInteraction;

const defaultButtonContent = {
  [STATE.DEFAULT]: {
    text: 'Send',
    icon: <SendOutlined />,
  },
  [STATE.PENDING]: {
    text: 'Sending...',
    icon: <LoadingOutlined />,
  },
  [STATE.SUCCESS]: {
    text: 'Done!',
    icon: <CheckOutlined />,
  },
};
