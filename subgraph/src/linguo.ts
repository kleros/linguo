import {
  AppealContribution as AppealContributionEvent,
  Dispute as DisputeEvent,
  Evidence as EvidenceEvent,
  HasPaidAppealFee as HasPaidAppealFeeEvent,
  MetaEvidence as MetaEvidenceEvent,
  Ruling as RulingEvent,
  TaskAssigned as TaskAssignedEvent,
  TaskCreated as TaskCreatedEvent,
  TaskResolved as TaskResolvedEvent,
  TranslationChallenged as TranslationChallengedEvent,
  TranslationSubmitted as TranslationSubmittedEvent
} from "../generated/Linguo_de_en/Linguo"
import {
  AppealContribution,
  Dispute,
  Evidence,
  HasPaidAppealFee,
  Ruling,
  TaskAssigned,
  Task,
  TaskResolved,
  TranslationChallenged,
  TranslationSubmitted
} from "../generated/schema"

import { log, Address } from "@graphprotocol/graph-ts"

export function handleAppealContribution(event: AppealContributionEvent): void {
  let entity = new AppealContribution(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._taskID = event.params._taskID
  entity._party = event.params._party
  entity._contributor = event.params._contributor
  entity._amount = event.params._amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDispute(event: DisputeEvent): void {
  let entity = new Dispute(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._arbitrator = event.params._arbitrator
  entity._disputeID = event.params._disputeID
  entity._metaEvidenceID = event.params._metaEvidenceID
  entity._evidenceGroupID = event.params._evidenceGroupID

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEvidence(event: EvidenceEvent): void {
  let entity = new Evidence(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._arbitrator = event.params._arbitrator
  entity._evidenceGroupID = event.params._evidenceGroupID
  entity._party = event.params._party
  entity._evidence = event.params._evidence

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleHasPaidAppealFee(event: HasPaidAppealFeeEvent): void {
  let entity = new HasPaidAppealFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._taskID = event.params._taskID
  entity._party = event.params._party

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}


export function handleMetaEvidence(event: MetaEvidenceEvent): void {
  const lang = getLangFromAddress(event.address)
  // Assemblyscript compiler yells if lang is null, so I set it to a special string instead
  if (lang === 'null'){
    log.error('Language for linguo deployment not found. {}',[event.address.toHexString()]);
    return;
  }
  let task = new Task(
    lang.concat(event.params._metaEvidenceID.toHexString())
  )
  task._evidence = event.params._evidence
  task._lang = lang
  task._taskID = event.params._metaEvidenceID
  task._timestamp = event.block.timestamp

  task.save()
}

export function handleRuling(event: RulingEvent): void {
  let entity = new Ruling(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._arbitrator = event.params._arbitrator
  entity._disputeID = event.params._disputeID
  entity._ruling = event.params._ruling

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTaskAssigned(event: TaskAssignedEvent): void {
  let entity = new TaskAssigned(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._taskID = event.params._taskID
  entity._translator = event.params._translator
  entity._price = event.params._price
  entity._timestamp = event.params._timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

function getLangFromAddress(address: Address): string{
  if (address.equals(Address.fromHexString("0xc3162705af0e10108ff837e450a14669b2711129")))
    return 'de|en'
  else if (address.equals(Address.fromHexString("0xa2bfff0553de7405781fe0c39c04a383f04b9c80")))
    return "en|es"
  else if (address.equals(Address.fromHexString("0x464c84c41f3C25Ba5a75B006D8B20600A8777306")))
    return "en|fr"
  else if (address.equals(Address.fromHexString("0x852550982e0984F9CCeF18a7276D35AFDc30242c")))
    return "en|ja"
  else if (address.equals(Address.fromHexString("0xd67c12734dc12240a6324db63ccd426964b71fe7")))
    return "en|ko"
  else if (address.equals(Address.fromHexString("0xfe721dd8ac8e47a4228a6147a25c65136f213eaa")))
    return "en|pt"
  else if (address.equals(Address.fromHexString("0x44863f5b7aab7cee181c0d84e244540125ef7af7")))
    return "en|ru"
  else if (address.equals(Address.fromHexString("0x1d48a279966f37385b4ab963530c6dc813b3a8df")))
    return "en|tr"
  else if (address.equals(Address.fromHexString("0x0b928165a67df8254412483ae8c3b8cc7f2b4d36")))
    return "en|zh"
  else //Assemblyscript compiler yells if lang is null, so I set it to a special string instead
    return 'null'
}

export function handleTaskCreated(event: TaskCreatedEvent): void {
  const lang = getLangFromAddress(event.address)
  // Assemblyscript compiler yells if lang is null, so I set it to a special string instead
  if (lang === 'null'){
    log.error('Language for linguo deployment not found. {}',[event.address.toHexString()]);
    return;
  }
  let task = Task.load(
    lang.concat(event.params._taskID.toHexString())
  )
  if (!task){
    log.error('Task not found. {}',[event.address.toHexString()]);
    return;
  }
  task._requester = event.params._requester
  task.save()
}

export function handleTaskResolved(event: TaskResolvedEvent): void {
  let entity = new TaskResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._taskID = event.params._taskID
  entity._reason = event.params._reason
  entity._timestamp = event.params._timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTranslationChallenged(
  event: TranslationChallengedEvent
): void {
  let entity = new TranslationChallenged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._taskID = event.params._taskID
  entity._challenger = event.params._challenger
  entity._timestamp = event.params._timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTranslationSubmitted(
  event: TranslationSubmittedEvent
): void {
  let entity = new TranslationSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._taskID = event.params._taskID
  entity._translator = event.params._translator
  entity._translatedText = event.params._translatedText
  entity._timestamp = event.params._timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
