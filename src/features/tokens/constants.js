import Web3 from 'web3';

const { BN } = Web3.utils;

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const MAX_UINT256 = String(new BN(2).pow(new BN(256)).sub(new BN(1)));
