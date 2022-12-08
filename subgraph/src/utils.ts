import { Address, BigInt } from '@graphprotocol/graph-ts';
import { ONE, Ruling, STATUS_ERROR, TWO, ZERO } from './constants';
import { Round } from '../generated/schema';

export function getLangFromAddress(address: Address): string {
  if (address.equals(Address.fromHexString('0xc3162705af0e10108ff837e450a14669b2711129'))) return 'de|en';
  else if (address.equals(Address.fromHexString('0xa2bfff0553de7405781fe0c39c04a383f04b9c80'))) return 'en|es';
  else if (address.equals(Address.fromHexString('0x464c84c41f3C25Ba5a75B006D8B20600A8777306'))) return 'en|fr';
  else if (address.equals(Address.fromHexString('0x852550982e0984F9CCeF18a7276D35AFDc30242c'))) return 'en|ja';
  else if (address.equals(Address.fromHexString('0xd67c12734dc12240a6324db63ccd426964b71fe7'))) return 'en|ko';
  else if (address.equals(Address.fromHexString('0xfe721dd8ac8e47a4228a6147a25c65136f213eaa'))) return 'en|pt';
  else if (address.equals(Address.fromHexString('0x44863f5b7aab7cee181c0d84e244540125ef7af7'))) return 'en|ru';
  else if (address.equals(Address.fromHexString('0x1d48a279966f37385b4ab963530c6dc813b3a8df'))) return 'en|tr';
  else if (address.equals(Address.fromHexString('0x0b928165a67df8254412483ae8c3b8cc7f2b4d36'))) return 'en|zh';
  // Assemblyscript compiler yells if lang is null, so I set it to a special string instead
  else return 'null';
}

export function createNewRound(roundId: string, taskId: string, timestamp: BigInt): Round {
  const newRound = new Round(roundId);

  newRound.task = taskId;
  newRound.hasPaidTranslator = false;
  newRound.hasPaidChallenger = false;
  newRound.amountPaidTranslator = ZERO;
  newRound.amountPaidChallenger = ZERO;
  newRound.feeRewards = ZERO;
  newRound.rulingTime = ZERO;
  newRound.ruling = getRuling(BigInt.fromI32(Ruling.None));
  newRound.creationTime = timestamp;
  newRound.numberOfContributions = ZERO;
  newRound.appealed = false;
  newRound.appealedAt = ZERO;
  newRound.appealPeriodStart = ZERO;
  newRound.appealPeriodEnd = ZERO;

  return newRound;
}

export function getRuling(ruling: BigInt): string {
  if (ruling.equals(ZERO)) return 'None';
  if (ruling.equals(ONE)) return 'Accept';
  if (ruling.equals(TWO)) return 'Reject';
  return STATUS_ERROR;
}
