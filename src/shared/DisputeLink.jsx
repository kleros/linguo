import React from 'react';
import t from 'prop-types';

import KlerosLogoOutlined from '~/assets/images/logo-kleros-outlined.svg';
import { useWeb3 } from '~/hooks/useWeb3';

export default function DisputeLink({ disputeID }) {
  const { chainId } = useWeb3();

  return chainId === 1 ? (
    <a
      key="dispute-link"
      target="_blank"
      rel="noreferrer noopener"
      href={`https://court.kleros.io/cases/${disputeID}`}
      css={`
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      `}
    >
      See case #{disputeID} on{' '}
      <KlerosLogoOutlined
        css={`
          height: ${p => p.theme.fontSize.lg};
        `}
      />{' '}
      Kleros
    </a>
  ) : (
    <span>Case #{disputeID}</span>
  );
}

DisputeLink.propTypes = {
  disputeID: t.string.isRequired,
};
