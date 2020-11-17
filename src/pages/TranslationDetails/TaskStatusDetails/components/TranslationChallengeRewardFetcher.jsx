import React from 'react';
import t from 'prop-types';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { subtract } from '~/adapters/big-number';
import { TaskStatus } from '~/features/tasks';
import { getArbitrationCost } from '~/features/tasks/tasksSlice';
import { withErrorBoundary } from '~/shared/ErrorBoundary';
import EthValue from '~/shared/EthValue';
import { compose } from '~/shared/fp';
import useTask from '../../useTask';
import EthFiatValue from '~/features/tokens/EthFiatValue';

function TranslationChallengeRewardFetcher() {
  const { id, status, sumDeposit } = useTask();

  const [reward, setReward] = React.useState(null);
  const dispatch = useDispatch();

  const doGetReward = React.useCallback(async () => {
    if (status !== TaskStatus.AwaitingReview) {
      return '0';
    }

    const { data: arbitrationCost } = await dispatch(
      getArbitrationCost(
        { id },
        {
          meta: {
            thunk: { id },
          },
        }
      )
    );

    return String(subtract(sumDeposit, arbitrationCost));
  }, [dispatch, id, sumDeposit, status]);

  React.useEffect(() => {
    async function updateReward() {
      setReward(await doGetReward());
    }

    updateReward();
  }, [doGetReward]);

  return reward ? (
    <TranslationChallengeReward amount={reward} />
  ) : (
    <StyledWrapper>
      <span
        css={`
          color: ${p => p.theme.color.text.light};
        `}
      >
        <LoadingOutlined /> Calculating reward value...
      </span>
    </StyledWrapper>
  );
}

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

export default compose(errorBoundaryEnhancer)(TranslationChallengeRewardFetcher);

function TranslationChallengeReward({ amount }) {
  return (
    <StyledAlert
      type="info"
      description={
        <>
          <p>You can win up to:</p>
          <p
            css={`
              margin: 0;
            `}
          >
            <strong>
              <EthValue amount={amount} suffixType="short" />
            </strong>{' '}
            <EthFiatValue
              amount={amount}
              render={({ formattedValue }) => `(${formattedValue})`}
              css={`
                font-size: ${p => p.theme.fontSize.xs};
              `}
            />
          </p>
        </>
      }
    />
  );
}

TranslationChallengeReward.propTypes = {
  amount: t.string.isRequired,
};

const StyledWrapper = styled.div`
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: ${p => p.theme.fontWeight.regular};
  color: ${p => p.theme.color.text.light};
`;

const StyledAlert = styled(Alert)`
  width: 100%;
`;
