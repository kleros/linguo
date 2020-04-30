import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import compose from '~/utils/fp/compose';
import { withSuspense } from '~/adapters/react';
import { useCacheCall } from '~/app/linguo';
import { withErrorBoundary } from '~/components/ErrorBoundary';
import EthValue from '~/components/EthValue';
import TaskContext from './TaskContext';

function TaskAssignmentDepositFetcher() {
  const { ID } = React.useContext(TaskContext);
  const [{ data }] = useCacheCall(['getTranslatorDeposit', ID], { suspense: true });

  return <TaskAssignmentDeposit amount={data} />;
}

TaskAssignmentDepositFetcher.propTypes = {
  ID: t.number.isRequired,
};

const StyledWrapper = styled.div`
  font-size: ${p => p.theme.fontSize.sm};
  color: ${p => p.theme.color.text.default};
`;

function TaskAssignmentDeposit({ amount }) {
  return (
    <StyledWrapper>
      <span>
        <EthValue amount={amount} suffixType="short" /> Deposit
      </span>
    </StyledWrapper>
  );
}

TaskAssignmentDeposit.propTypes = {
  amount: t.string.isRequired,
};

const errorBoundaryEnhancer = withErrorBoundary({
  renderFallback: function ErrorBoundaryFallback(error) {
    return (
      <StyledWrapper>
        <span
          css={`
            color: ${p => p.theme.color.danger.default};
          `}
        >
          {error.message}
        </span>
      </StyledWrapper>
    );
  },
});

const suspenseEnhancer = withSuspense({
  fallback: (
    <StyledWrapper>
      <span
        css={`
          color: ${p => p.theme.color.text.light};
        `}
      >
        <LoadingOutlined /> Calculating deposit value...
      </span>
    </StyledWrapper>
  ),
});

/**
 * ATTENTION: Order is important!
 * Since composition is evaluated right-to-left, `suspenseEnhancer` should be declared
 * **AFTER** `errorBoundaryEnhancer`
 */
export default compose(errorBoundaryEnhancer, suspenseEnhancer)(TaskAssignmentDepositFetcher);
