import React from 'react';
import t from 'prop-types';
import { useSelector } from 'react-redux';
import KlerosLogo from '~/assets/images/logo-kleros.svg';
import { selectChainId } from '~/features/web3/web3Slice';

export default function DisputeLink({ disputeID }) {
  const chainId = useSelector(selectChainId);

  return chainId === 1 ? (
    <a
      key="dispute-link"
      target="_blank"
      rel="noreferrer noopener"
      href={`https://court.kleros.io/cases/${disputeID}`}
      css={`
        display: inline-flex;
        align-content: center;
        font-size: ${p => p.theme.fontSize.lg};
      `}
    >
      <KlerosLogo
        css={`
          width: 1.5rem;
        `}
      />
      <span
        css={`
          display: inline-block;
          margin-left: 0.375rem;
        `}
      >
        See case #{disputeID} on Kleros
      </span>
    </a>
  ) : (
    <span
      css={`
        font-size: ${p => p.theme.fontSize.lg};
      `}
    >
      Case #{disputeID}
    </span>
  );
}

DisputeLink.propTypes = {
  disputeID: t.number.isRequired,
};
