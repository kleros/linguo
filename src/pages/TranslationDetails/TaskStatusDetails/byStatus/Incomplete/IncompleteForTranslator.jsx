import React from 'react';
import TaskIgnoredAvatar from '~/assets/images/avatar-task-incomplete.svg';
import EthValue from '~/shared/EthValue';
import TaskStatusDetailsLayout from '../../components/TaskStatusDetailsLayout';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';

function IncompleteForTranslator() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  /*
   * A task which is Incomplete was not challenged, so the value of sumDeposit
   * is exactly the value of the Translator Deposit.
   */
  const translatorDeposit = task.sumDeposit;

  const title = 'You did not complete this translation in time';
  const illustration = <TaskIgnoredAvatar />;

  const props = task.isPending
    ? {
        title,
        illustration,
        description: [
          <EthValue
            key="warning"
            amount={translatorDeposit}
            suffixType="short"
            render={({ formattedValue, suffix }) =>
              `As a compensation to the requester, the value you deposited when assigned
               to this task (${formattedValue} ${suffix}) will be sent to the requester's address.`
            }
          />,
        ],
      }
    : {
        title,
        illustration,
        description: [
          <EthValue
            key="warning"
            amount={translatorDeposit}
            suffixType="short"
            render={({ formattedValue, suffix }) =>
              `As a compensation to the requester, the value you deposited when assigned
               to this task (${formattedValue} ${suffix}) was sent to the requester's address.`
            }
          />,
        ],
      };

  return <TaskStatusDetailsLayout {...props} />;
}

export default IncompleteForTranslator;
