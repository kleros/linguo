import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';

import { withErrorBoundary } from '~/shared/ErrorBoundary';
import EthValue from '~/shared/EthValue';
import { compose } from '~/shared/fp';
import EthFiatValue from '~/features/tokens/EthFiatValue';

import { useWeb3 } from '~/hooks/useWeb3';
import { useParamsCustom } from '~/hooks/useParamsCustom';
import { useTask } from '~/hooks/useTask';
import { useLinguoApi } from '~/hooks/useLinguo';

function TranslationChallengeDepositFetcher() {
  const { chainId } = useWeb3();
  const { id } = useParamsCustom(chainId);
  const { task } = useTask(id);

  const { getChallengeDeposit } = useLinguoApi();
  const deposit = getChallengeDeposit(task.taskID);

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
  font-size: ${p => p.theme.fontSize.xs};
  font-weight: ${p => p.theme.fontWeight.regular};
  color: ${p => p.theme.color.text.light};
`;

function TranslationChallengeDeposit({ amount }) {
  return (
    <StyledWrapper>
      <div>
        <EthValue amount={amount} suffixType="short" /> Deposit
      </div>
      <div>
        <EthFiatValue amount={amount} render={({ formattedValue }) => `(${formattedValue})`} />
      </div>
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
