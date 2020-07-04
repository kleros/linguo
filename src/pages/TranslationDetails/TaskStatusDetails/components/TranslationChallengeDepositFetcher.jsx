import React from 'react';
import t from 'prop-types';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { withErrorBoundary } from '~/shared/ErrorBoundary';
import EthValue, { EthUnit } from '~/shared/EthValue';
import { compose } from '~/shared/fp';
import { getChallengerDeposit } from '~/features/tasks/tasksSlice';
import useTask from '../../useTask';

function TranslationChallengeDepositFetcher() {
  const { id } = useTask();

  const [deposit, setDeposit] = React.useState(null);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(
      getChallengerDeposit(
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
    <TranslationChallengeDeposit amount={deposit} />
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
  color: ${p => p.theme.color.text.default};
`;

function TranslationChallengeDeposit({ amount }) {
  return (
    <StyledWrapper>
      <span>
        <EthValue amount={amount} unit={EthUnit.ether} suffixType="short" /> Deposit
      </span>
    </StyledWrapper>
  );
}

TranslationChallengeDeposit.propTypes = {
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

export default compose(errorBoundaryEnhancer)(TranslationChallengeDepositFetcher);
