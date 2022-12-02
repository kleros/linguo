import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  AppealContribution,
  Dispute,
  Evidence,
  HasPaidAppealFee,
  MetaEvidence,
  Ruling,
  TaskAssigned,
  TaskCreated,
  TaskResolved,
  TranslationChallenged,
  TranslationSubmitted
} from "../generated/Linguo/Linguo"

export function createAppealContributionEvent(
  _taskID: BigInt,
  _party: i32,
  _contributor: Address,
  _amount: BigInt
): AppealContribution {
  let appealContributionEvent = changetype<AppealContribution>(newMockEvent())

  appealContributionEvent.parameters = new Array()

  appealContributionEvent.parameters.push(
    new ethereum.EventParam(
      "_taskID",
      ethereum.Value.fromUnsignedBigInt(_taskID)
    )
  )
  appealContributionEvent.parameters.push(
    new ethereum.EventParam(
      "_party",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_party))
    )
  )
  appealContributionEvent.parameters.push(
    new ethereum.EventParam(
      "_contributor",
      ethereum.Value.fromAddress(_contributor)
    )
  )
  appealContributionEvent.parameters.push(
    new ethereum.EventParam(
      "_amount",
      ethereum.Value.fromUnsignedBigInt(_amount)
    )
  )

  return appealContributionEvent
}

export function createDisputeEvent(
  _arbitrator: Address,
  _disputeID: BigInt,
  _metaEvidenceID: BigInt,
  _evidenceGroupID: BigInt
): Dispute {
  let disputeEvent = changetype<Dispute>(newMockEvent())

  disputeEvent.parameters = new Array()

  disputeEvent.parameters.push(
    new ethereum.EventParam(
      "_arbitrator",
      ethereum.Value.fromAddress(_arbitrator)
    )
  )
  disputeEvent.parameters.push(
    new ethereum.EventParam(
      "_disputeID",
      ethereum.Value.fromUnsignedBigInt(_disputeID)
    )
  )
  disputeEvent.parameters.push(
    new ethereum.EventParam(
      "_metaEvidenceID",
      ethereum.Value.fromUnsignedBigInt(_metaEvidenceID)
    )
  )
  disputeEvent.parameters.push(
    new ethereum.EventParam(
      "_evidenceGroupID",
      ethereum.Value.fromUnsignedBigInt(_evidenceGroupID)
    )
  )

  return disputeEvent
}

export function createEvidenceEvent(
  _arbitrator: Address,
  _evidenceGroupID: BigInt,
  _party: Address,
  _evidence: string
): Evidence {
  let evidenceEvent = changetype<Evidence>(newMockEvent())

  evidenceEvent.parameters = new Array()

  evidenceEvent.parameters.push(
    new ethereum.EventParam(
      "_arbitrator",
      ethereum.Value.fromAddress(_arbitrator)
    )
  )
  evidenceEvent.parameters.push(
    new ethereum.EventParam(
      "_evidenceGroupID",
      ethereum.Value.fromUnsignedBigInt(_evidenceGroupID)
    )
  )
  evidenceEvent.parameters.push(
    new ethereum.EventParam("_party", ethereum.Value.fromAddress(_party))
  )
  evidenceEvent.parameters.push(
    new ethereum.EventParam("_evidence", ethereum.Value.fromString(_evidence))
  )

  return evidenceEvent
}

export function createHasPaidAppealFeeEvent(
  _taskID: BigInt,
  _party: i32
): HasPaidAppealFee {
  let hasPaidAppealFeeEvent = changetype<HasPaidAppealFee>(newMockEvent())

  hasPaidAppealFeeEvent.parameters = new Array()

  hasPaidAppealFeeEvent.parameters.push(
    new ethereum.EventParam(
      "_taskID",
      ethereum.Value.fromUnsignedBigInt(_taskID)
    )
  )
  hasPaidAppealFeeEvent.parameters.push(
    new ethereum.EventParam(
      "_party",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(_party))
    )
  )

  return hasPaidAppealFeeEvent
}

export function createMetaEvidenceEvent(
  _metaEvidenceID: BigInt,
  _evidence: string
): MetaEvidence {
  let metaEvidenceEvent = changetype<MetaEvidence>(newMockEvent())

  metaEvidenceEvent.parameters = new Array()

  metaEvidenceEvent.parameters.push(
    new ethereum.EventParam(
      "_metaEvidenceID",
      ethereum.Value.fromUnsignedBigInt(_metaEvidenceID)
    )
  )
  metaEvidenceEvent.parameters.push(
    new ethereum.EventParam("_evidence", ethereum.Value.fromString(_evidence))
  )

  return metaEvidenceEvent
}

export function createRulingEvent(
  _arbitrator: Address,
  _disputeID: BigInt,
  _ruling: BigInt
): Ruling {
  let rulingEvent = changetype<Ruling>(newMockEvent())

  rulingEvent.parameters = new Array()

  rulingEvent.parameters.push(
    new ethereum.EventParam(
      "_arbitrator",
      ethereum.Value.fromAddress(_arbitrator)
    )
  )
  rulingEvent.parameters.push(
    new ethereum.EventParam(
      "_disputeID",
      ethereum.Value.fromUnsignedBigInt(_disputeID)
    )
  )
  rulingEvent.parameters.push(
    new ethereum.EventParam(
      "_ruling",
      ethereum.Value.fromUnsignedBigInt(_ruling)
    )
  )

  return rulingEvent
}

export function createTaskAssignedEvent(
  _taskID: BigInt,
  _translator: Address,
  _price: BigInt,
  _timestamp: BigInt
): TaskAssigned {
  let taskAssignedEvent = changetype<TaskAssigned>(newMockEvent())

  taskAssignedEvent.parameters = new Array()

  taskAssignedEvent.parameters.push(
    new ethereum.EventParam(
      "_taskID",
      ethereum.Value.fromUnsignedBigInt(_taskID)
    )
  )
  taskAssignedEvent.parameters.push(
    new ethereum.EventParam(
      "_translator",
      ethereum.Value.fromAddress(_translator)
    )
  )
  taskAssignedEvent.parameters.push(
    new ethereum.EventParam("_price", ethereum.Value.fromUnsignedBigInt(_price))
  )
  taskAssignedEvent.parameters.push(
    new ethereum.EventParam(
      "_timestamp",
      ethereum.Value.fromUnsignedBigInt(_timestamp)
    )
  )

  return taskAssignedEvent
}

export function createTaskCreatedEvent(
  _taskID: BigInt,
  _requester: Address,
  _timestamp: BigInt
): TaskCreated {
  let taskCreatedEvent = changetype<TaskCreated>(newMockEvent())

  taskCreatedEvent.parameters = new Array()

  taskCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_taskID",
      ethereum.Value.fromUnsignedBigInt(_taskID)
    )
  )
  taskCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_requester",
      ethereum.Value.fromAddress(_requester)
    )
  )
  taskCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "_timestamp",
      ethereum.Value.fromUnsignedBigInt(_timestamp)
    )
  )

  return taskCreatedEvent
}

export function createTaskResolvedEvent(
  _taskID: BigInt,
  _reason: string,
  _timestamp: BigInt
): TaskResolved {
  let taskResolvedEvent = changetype<TaskResolved>(newMockEvent())

  taskResolvedEvent.parameters = new Array()

  taskResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "_taskID",
      ethereum.Value.fromUnsignedBigInt(_taskID)
    )
  )
  taskResolvedEvent.parameters.push(
    new ethereum.EventParam("_reason", ethereum.Value.fromString(_reason))
  )
  taskResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "_timestamp",
      ethereum.Value.fromUnsignedBigInt(_timestamp)
    )
  )

  return taskResolvedEvent
}

export function createTranslationChallengedEvent(
  _taskID: BigInt,
  _challenger: Address,
  _timestamp: BigInt
): TranslationChallenged {
  let translationChallengedEvent = changetype<TranslationChallenged>(
    newMockEvent()
  )

  translationChallengedEvent.parameters = new Array()

  translationChallengedEvent.parameters.push(
    new ethereum.EventParam(
      "_taskID",
      ethereum.Value.fromUnsignedBigInt(_taskID)
    )
  )
  translationChallengedEvent.parameters.push(
    new ethereum.EventParam(
      "_challenger",
      ethereum.Value.fromAddress(_challenger)
    )
  )
  translationChallengedEvent.parameters.push(
    new ethereum.EventParam(
      "_timestamp",
      ethereum.Value.fromUnsignedBigInt(_timestamp)
    )
  )

  return translationChallengedEvent
}

export function createTranslationSubmittedEvent(
  _taskID: BigInt,
  _translator: Address,
  _translatedText: string,
  _timestamp: BigInt
): TranslationSubmitted {
  let translationSubmittedEvent = changetype<TranslationSubmitted>(
    newMockEvent()
  )

  translationSubmittedEvent.parameters = new Array()

  translationSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "_taskID",
      ethereum.Value.fromUnsignedBigInt(_taskID)
    )
  )
  translationSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "_translator",
      ethereum.Value.fromAddress(_translator)
    )
  )
  translationSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "_translatedText",
      ethereum.Value.fromString(_translatedText)
    )
  )
  translationSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "_timestamp",
      ethereum.Value.fromUnsignedBigInt(_timestamp)
    )
  )

  return translationSubmittedEvent
}
