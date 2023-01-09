import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from '~/adapters/antd';
import { withErrorBoundary } from '~/shared/ErrorBoundary';
import EthValue from '~/shared/EthValue';
import { compose } from '~/shared/fp';
import EthFiatValue from '~/features/tokens/EthFiatValue';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useLinguo } from '~/hooks/useLinguo';
import { useTask } from '~/hooks/useTask';

import taskStatus from '~/consts/taskStatus';
import { BigNumber } from 'ethers';

function TranslationChallengeRewardFetcher() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);
  const linguo = useLinguo();

  let reward;
  const arbitrationCost = linguo.getArbitrationCost();

  if (task.status !== taskStatus.AwaitingReview) {
    reward = 0;
  } else {
    reward = arbitrationCost ? BigNumber.from(task.sumDeposit).sub(arbitrationCost).toString() : 0;
  }

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
      showIcon
      type="info"
      message={
        <>
          You can win up to:{' '}
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
  text-align: left;
`;
