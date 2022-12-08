import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  Linguo,
  AppealContribution as AppealContributionEvent,
  Dispute as DisputeEvent,
  Evidence as EvidenceEvent,
  MetaEvidence as MetaEvidenceEvent,
  Ruling as RulingEvent,
  TaskAssigned as TaskAssignedEvent,
  TaskCreated as TaskCreatedEvent,
  TaskResolved as TaskResolvedEvent,
  TranslationChallenged as TranslationChallengedEvent,
  TranslationSubmitted as TranslationSubmittedEvent,
} from '../generated/Linguo_en_es/Linguo';

import {
  AppealPossible as AppealPossibleEvent,
  AppealDecision as AppealDecisionEvent,
  IArbitrator,
} from '../generated/IArbitrator/IArbitrator';

import { Task, Round, Contribution, Evidence, EvidenceGroup, MetaEvidence } from '../generated/schema';

import { createNewRound, getRuling } from './utils';
import {
  ONE,
  Party,
  partyMap,
  Ruling,
  Status,
  statusMap,
  STATUS_ERROR,
  ZERO,
  ZERO_ADDRESS,
  getLangFromAddress,
} from './constants';

export function handleMetaEvidence(event: MetaEvidenceEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }

  const taskId = `${lang}-${event.params._metaEvidenceID}`;
  const newTask = new Task(taskId);
  newTask.taskID = event.params._metaEvidenceID;
  newTask.lang = lang;

  const linguo = Linguo.bind(event.address);
  const _task = linguo.tasks(newTask.taskID);

  newTask.submissionTimeout = _task.getSubmissionTimeout();
  newTask.deadline = _task.getSubmissionTimeout().plus(event.block.timestamp);
  newTask.lastInteraction = _task.getLastInteraction();
  newTask.maxPrice = _task.getMaxPrice();
  newTask.minPrice = _task.getMinPrice();
  newTask.requesterDeposit = _task.getRequesterDeposit();
  newTask.sumDeposit = _task.getSumDeposit();
  newTask.status = statusMap.get(_task.getStatus());
  newTask.numberOfRounds = ZERO;
  newTask.numberOfEvidences = ZERO;
  newTask.disputed = false;
  newTask.disputeID = ZERO;
  newTask.finalRuling = getRuling(BigInt.fromI32(Ruling.None));
  newTask.challenger = ZERO_ADDRESS;
  newTask.arbitrator = ZERO_ADDRESS;
  newTask.requester = ZERO_ADDRESS;
  newTask.translator = ZERO_ADDRESS;
  newTask.translation = '';
  newTask.creationTime = ZERO;
  newTask.assignmentTime = ZERO;
  newTask.challengeTime = ZERO;
  newTask.resolutionTime = ZERO;
  newTask.evidenceGroupID = ZERO;

  const metaEvidence = new MetaEvidence(newTask.id);
  metaEvidence.metaEvidenceID = event.params._metaEvidenceID;
  metaEvidence.URI = event.params._evidence;

  newTask.metaEvidence = metaEvidence.id;
  metaEvidence.save();
  newTask.save();
}

export function handleTaskCreated(event: TaskCreatedEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }

  const taskId = `${lang}-${event.params._taskID}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleTaskCreated: Task not found. taskID {}; contract {}', [taskId, event.address.toHexString()]);
    return;
  }

  task.requester = event.params._requester;
  task.creationTime = event.params._timestamp;

  const evidenceGroup = new EvidenceGroup(`${event.params._taskID}-${event.address.toHexString()}`);
  evidenceGroup.task = task.id;

  evidenceGroup.save();
  task.save();
}

export function handleTaskAssigned(event: TaskAssignedEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang{}; contract {}', [lang, event.address.toHexString()]);
    return;
  }

  const taskId = `${lang}-${event.params._taskID}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleTaskAssigned: Task not found.taskID {}; contract {}', [taskId, event.address.toHexString()]);
    return;
  }

  task.translator = event.params._translator;
  task.requesterDeposit = event.params._price;
  task.assignmentTime = event.params._timestamp;

  const linguo = Linguo.bind(event.address);
  const _task = linguo.tasks(task.taskID);
  task.sumDeposit = _task.getSumDeposit();
  task.status = statusMap.get(_task.getStatus());

  task.save();
}

export function handleTaskResolved(event: TaskResolvedEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }

  const taskId = `${lang}-${event.params._taskID}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleTaskResolved: Task not found. taskID {}; contract {}', [taskId, event.address.toHexString()]);
    return;
  }

  task.reason = event.params._reason;
  task.resolutionTime = event.params._timestamp;
  task.status = statusMap.get(Status.Resolved) || STATUS_ERROR;
  task.requesterDeposit = ZERO;
  task.sumDeposit = ZERO;

  task.save();
}

export function handleTranslationSubmitted(event: TranslationSubmittedEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }

  const taskId = `${lang}-${event.params._taskID}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleTranslationSubmitted: Task not found.taskID {}; contract {}', [
      taskId,
      event.address.toHexString(),
    ]);
    return;
  }

  task.translation = event.params._translatedText;
  task.lastInteraction = event.params._timestamp;
  task.status = statusMap.get(Status.AwaitingReview) || STATUS_ERROR;

  task.save();
}

export function handleTranslationChallenged(event: TranslationChallengedEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }

  const taskId = `${lang}-${event.params._taskID}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleTranslationChallenged: Task not found. taskID {}; contract {}', [
      taskId,
      event.address.toHexString(),
    ]);
    return;
  }

  task.challenger = event.params._challenger;
  task.challengeTime = event.params._timestamp;

  const linguo = Linguo.bind(event.address);
  const _task = linguo.tasks(task.taskID);
  task.status = statusMap.get(_task.getStatus());
  task.sumDeposit = _task.getSumDeposit();

  const roundId = task.id + '-0';
  const newRound = createNewRound(roundId, task.id, event.params._timestamp);

  task.numberOfRounds = task.numberOfRounds.plus(ONE);

  newRound.save();
  task.save();
}

export function handleDispute(event: DisputeEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }

  const taskId = `${lang}-${event.params._metaEvidenceID}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleDispute: Task not found. taskID {}; contract {}', [taskId, event.address.toHexString()]);
    return;
  }

  task.disputed = true;
  task.disputeID = event.params._disputeID;
  task.arbitrator = event.params._arbitrator;
  task.evidenceGroupID = event.params._evidenceGroupID;

  task.save();
}

export function handleAppealContribution(event: AppealContributionEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }
  const taskId = `${lang}-${event.params._taskID}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleAppealContribution: Task not found. taskID {}; contract {}', [
      taskId,
      event.address.toHexString(),
    ]);
    return;
  }

  const roundId = `${task.id}-${task.numberOfRounds.minus(ONE)}`;
  const round = Round.load(roundId);
  if (!round) {
    log.error('HandleAppealContribution: Round not found. roundID {}; taskID {}; contract{}', [
      roundId,
      taskId,
      event.address.toHexString(),
    ]);
    return;
  }

  const linguo = Linguo.bind(event.address);
  const roundInfo = linguo.getRoundInfo(event.params._taskID, task.numberOfRounds.minus(ONE));

  round.amountPaidTranslator = roundInfo.getPaidFees()[Party.Translator];
  round.amountPaidChallenger = roundInfo.getPaidFees()[Party.Challenger];
  round.hasPaidTranslator = roundInfo.getHasPaid()[Party.Translator];
  round.hasPaidChallenger = roundInfo.getHasPaid()[Party.Challenger];
  round.feeRewards = roundInfo.getFeeRewards();

  if (round.appealed) {
    const newRroundId = `${task.id}-${task.numberOfRounds}`;
    const newRound = createNewRound(newRroundId, task.id, event.block.timestamp);
    newRound.save();
    task.numberOfRounds = task.numberOfRounds.plus(ONE);
  }

  const contributionId = `${roundId}-${round.numberOfContributions}`;
  const contribution = new Contribution(contributionId);

  contribution.round = round.id;
  contribution.contributor = event.params._contributor;
  contribution.amount = event.params._amount;
  contribution.party = partyMap.get(event.params._party) || STATUS_ERROR;

  round.numberOfContributions = round.numberOfContributions.plus(ONE);

  contribution.save();
  round.save();
  task.save();
}

export function handleEvidence(event: EvidenceEvent): void {
  const evidenceGroup = EvidenceGroup.load(`${event.params._evidenceGroupID}-${event.address.toHexString()}`);
  if (!evidenceGroup) {
    log.error('HandleEvidence: EvidenceGroupID not registered. id {}; contract {}.', [
      event.params._evidenceGroupID.toString(),
      event.address.toHexString(),
    ]);
    return;
  }

  const task = Task.load(evidenceGroup.task);
  if (!task) {
    log.error('HandleEvidence: Task not found. taskID {}; contract {}', [
      evidenceGroup.task.toString(),
      event.address.toHexString(),
    ]);
    return;
  }

  const evidenceId = `${task.id}-${task.numberOfEvidences}`;
  let evidence = new Evidence(evidenceId);

  evidence.arbitrator = event.params._arbitrator;
  evidence.evidenceGroupID = event.params._evidenceGroupID;
  evidence.party = event.params._party;
  evidence.URI = event.params._evidence;
  evidence.task = task.id;
  evidence.number = task.numberOfEvidences;
  evidence.timestamp = event.block.timestamp;

  task.numberOfEvidences = task.numberOfEvidences.plus(ONE);

  evidence.save();
  task.save();
}

export function handleRuling(event: RulingEvent): void {
  const lang = getLangFromAddress(event.address);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [lang, event.address.toHexString()]);
    return;
  }
  const linguo = Linguo.bind(event.address);

  const taskId = `${lang}-${linguo.disputeIDtoTaskID(event.params._disputeID)}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleRuling: Task not found. taskID {}; disputeID {}; contract {}', [
      taskId.toString(),
      event.params._disputeID.toString(),
      event.address.toHexString(),
    ]);
    return;
  }

  task.status = statusMap.get(Status.Resolved) || STATUS_ERROR;
  task.finalRuling = getRuling(event.params._ruling);
  task.resolutionTime = event.block.timestamp;
  task.requesterDeposit = ZERO;
  task.sumDeposit = ZERO;

  task.save();
}

export function handleAppealPossible(event: AppealPossibleEvent): void {
  const linguo = Linguo.bind(event.params._arbitrable);
  if (linguo == null) return; // Filter out calls from non-IArbitrable

  const lang = getLangFromAddress(event.params._arbitrable);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [
      lang,
      event.params._arbitrable.toHexString(),
    ]);
    return;
  }
  const call = linguo.try_disputeIDtoTaskID(event.params._disputeID);
  if (call.reverted) {
    log.warning('call to arbitrator {} with dusputeID {} failed.', [
      event.address.toHexString(),
      event.params._disputeID.toString(),
    ]);
    return;
  }
  const taskId = `${lang}-${linguo.disputeIDtoTaskID(event.params._disputeID)}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleAppealPossible: Task not found. taksID {}; disputeID {}; contract{}', [
      taskId.toString(),
      event.params._disputeID.toString(),
      event.params._arbitrable.toHexString(),
    ]);
    return;
  }

  const roundId = `${task.id}-${task.numberOfRounds.minus(ONE)}`;
  const round = Round.load(roundId);
  if (!round) {
    log.error(`HandleAppealPossible: Round not found. roundID {}; taskID {}; contract {}`, [
      roundId,
      task.id,
      event.params._arbitrable.toHexString(),
    ]);
    return;
  }

  let arbitrator = IArbitrator.bind(event.address);
  let appealPeriod = arbitrator.appealPeriod(event.params._disputeID);
  const currentRuling = arbitrator.currentRuling(event.params._disputeID);

  round.appealPeriodStart = appealPeriod.getStart();
  round.appealPeriodEnd = appealPeriod.getEnd();
  round.rulingTime = event.block.timestamp;
  round.ruling = getRuling(currentRuling);

  round.save();
}

export function handleAppealDecision(event: AppealDecisionEvent): void {
  const linguo = Linguo.bind(event.params._arbitrable);
  if (linguo == null) return; // Filter out calls from non-IArbitrable

  const lang = getLangFromAddress(event.params._arbitrable);
  if (lang === null) {
    log.error('Language for Linguo deployment is not found. lang {}; contract {}', [
      lang,
      event.params._arbitrable.toHexString(),
    ]);
    return;
  }

  const call = linguo.try_disputeIDtoTaskID(event.params._disputeID);
  if (call.reverted) {
    log.warning('call to arbitrator {} with dusputeID {} failed.', [
      event.address.toHexString(),
      event.params._disputeID.toString(),
    ]);
    return;
  }

  const taskId = `${lang}-${linguo.disputeIDtoTaskID(event.params._disputeID)}`;
  const task = Task.load(taskId);
  if (!task) {
    log.error('HandleAppealDecision: Task not found. taskID {}; disputeID {}; contract {}', [
      lang.concat(taskId.toString()),
      event.params._disputeID.toString(),
      event.params._arbitrable.toHexString(),
    ]);
    return;
  }

  const roundId = `${task.id}-${task.numberOfRounds.minus(ONE)}`;
  const round = Round.load(roundId);
  if (!round) {
    log.error('HandleAppealDecision: Round not found. roundID {}; taskID {} contract {}', [
      roundId,
      task.id,
      event.params._arbitrable.toHexString(),
    ]);
    return;
  }

  round.appealed = true;
  round.appealedAt = event.block.timestamp;

  round.save();
}
