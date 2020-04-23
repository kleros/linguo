import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { useLinguo } from '~/app/linguo';
import useAsyncState from '~/hooks/useAsyncState';
import EthValue from '~/components/EthValue';

const StyledWrapper = styled.div`
  font-size: ${p => p.theme.fontSize.sm};
  color: ${p => p.theme.color.text.default};
`;

const StyledErrorMessage = styled.span`
  color: ${p => p.theme.color.danger.default};
`;

const StyledLoadingMessage = styled.span`
  color: ${p => p.theme.color.text.light};
`;

function TaskAssignmentDeposit(task) {
  const { ID } = task;
  const linguo = useLinguo();

  const [{ data, error, isLoading, isError, isSuccess }] = useAsyncState(
    React.useCallback(async () => linguo.api.getTranslatorDeposit({ ID }), [linguo.api, ID]),
    '0',
    { runImmediately: true }
  );

  return (
    <StyledWrapper>
      {isLoading && (
        <StyledLoadingMessage>
          <LoadingOutlined /> Calculating deposit value...
        </StyledLoadingMessage>
      )}
      {isError && <StyledErrorMessage>{error.message}</StyledErrorMessage>}
      {isSuccess && (
        <span>
          <EthValue amount={data} suffixType="short" /> Deposit
        </span>
      )}
    </StyledWrapper>
  );
}

TaskAssignmentDeposit.propTypes = {
  ID: t.number.isRequired,
};

export default TaskAssignmentDeposit;
