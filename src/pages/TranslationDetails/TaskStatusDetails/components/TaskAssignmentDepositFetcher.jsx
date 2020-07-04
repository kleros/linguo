import React from 'react';
import t from 'prop-types';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { withErrorBoundary } from '~/shared/ErrorBoundary';
import EthValue, { EthUnit } from '~/shared/EthValue';
import { compose } from '~/shared/fp';
import { getTranslatorDeposit } from '~/features/tasks/tasksSlice';
import useTask from '../../useTask';

function TaskAssignmentDepositFetcher() {
  const { id } = useTask();

  const [deposit, setDeposit] = React.useState(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(
      getTranslatorDeposit(
        { id },
        {
          meta: {
            thunk: { id },
          },
        }
      )
    )
      .then(({ data }) => setDeposit(data))
      .catch(err => {
        console.warn('Failed to get the deposit value:', err);
        throw new Error('Failed to get the deposit value.');
      });
  }, [dispatch, id]);

  return deposit ? (
    <TaskAssignmentDeposit amount={deposit} />
  ) : (
    <StyledWrapper>
      <span
        css={`
          color: ${p => p.theme.color.text.light};
        `}
      >
        <LoadingOutlined /> Calculating deposit value...
      </span>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: 400;
  color: ${p => p.theme.color.text.default};
`;

function TaskAssignmentDeposit({ amount }) {
  return (
    <StyledWrapper>
      <span>
        <EthValue amount={amount} unit={EthUnit.ether} suffixType="short" /> Deposit
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

export default compose(errorBoundaryEnhancer)(TaskAssignmentDepositFetcher);
