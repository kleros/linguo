import { Address, BigInt } from '@graphprotocol/graph-ts';

export const STATUS_ERROR = 'Error';
export const ZERO = BigInt.fromI32(0);
export const ONE = BigInt.fromI32(1);
export const TWO = BigInt.fromI32(2);
export const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000');

export enum Ruling {
  None,
  Accept,
  Reject,
}

export enum Status {
  Created,
  Assigned,
  AwaitingReview,
  DisputeCreated,
  Resolved,
}

export enum Party {
  None,
  Translator,
  Challenger,
}

export const partyMap = new Map<Party, string>();
partyMap.set(Party.None, 'None');
partyMap.set(Party.Translator, 'Translator');
partyMap.set(Party.Challenger, 'Challenger');

export const statusMap = new Map<Status, string>();
statusMap.set(Status.Created, 'Created');
statusMap.set(Status.Assigned, 'Assigned');
statusMap.set(Status.AwaitingReview, 'AwaitingReview');
statusMap.set(Status.DisputeCreated, 'DisputeCreated');
statusMap.set(Status.Resolved, 'Resolved');
