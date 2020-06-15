import Web3 from 'web3';
const { toBN } = Web3.utils;

// 2**256 - 1
export const NON_PAYABLE_VALUE = toBN('2').pow(toBN('256')).sub(toBN('1')).toString();

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
