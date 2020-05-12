import React from 'react';
import t from 'prop-types';
import styled from 'styled-components';
import EthValue from '~/components/EthValue';

const StyledWrapper = styled.div`
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: 400;
  color: ${p => p.theme.color.text.default};
`;

function AppealDeposit({ amount }) {
  return (
    <StyledWrapper>
      <span>
        <EthValue amount={amount} suffixType="short" /> Deposit
      </span>
    </StyledWrapper>
  );
}

AppealDeposit.propTypes = {
  amount: t.string.isRequired,
};

export default AppealDeposit;
