import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import KlerosFooter from '@kleros/react-components/dist/footer';
import * as r from '~/app/routes';
import { selectChainId } from '~/features/web3/web3Slice';
import { selectAllAddresses } from '~/features/linguo/linguoSlice';
import { useShallowEqualSelector } from '~/adapters/react-redux';

export default function Footer() {
  const chainId = useSelector(selectChainId);
  const addresses = useShallowEqualSelector(selectAllAddresses);
  const address = getRandomElement(addresses);

  const explorerBaseUrl = chainId === 42 ? 'kovan.etherscan.io' : 'etherscan.io';

  return (
    <StyledKlerosFooter
      appName="Linguo"
      contractExplorerURL={`//${explorerBaseUrl}/address/${address}`}
      renderHelpLink={({ content, icon }) => (
        <Link to={r.FAQ}>
          {content} {icon}
        </Link>
      )}
      repository="https://github.com/kleros/linguo"
      locale="en"
    />
  );
}

function getRandomElement(arr) {
  return arr[getRandomInt(0, arr.length - 1)] ?? '0x0000000000000000000000000000000000000000';
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const StyledKlerosFooter = styled(KlerosFooter)`
  && {
    background-color: #0043c5;
    a {
      color: ${p => p.theme.color.text.inverted};

      svg {
        transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);
      }

      :hover,
      :focus,
      :active {
        color: ${p => p.theme.color.text.inverted};
        text-shadow: 0 0 5px ${p => p.theme.color.glow.default};
        transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

        svg {
          filter: drop-shadow(0 0 2px ${p => p.theme.color.glow.default});
        }
      }
    }
  }
`;
