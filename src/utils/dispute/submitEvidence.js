import ipfs from '~/app/ipfs';
import challengeEvidenceTemplate from '~/assets/fixtures/challengeEvidenceTemplate';
import evidenceTemplate from '~/assets/fixtures/evidenceTemplate';

export const TEMPLATE_TYPE = Object.freeze({
  challenge: 'challenge',
  evidence: 'evidence',
});

const ERROR = {
  [TEMPLATE_TYPE.challenge]: 'Cannot submit a challenge without an evidence file',
  [TEMPLATE_TYPE.evidence]: 'Cannot submit evidence: No uploaded file',
};

const templateMap = {
  [TEMPLATE_TYPE.challenge]: {
    template: challengeEvidenceTemplate,
    name: taskID => `linguo-challenge-${taskID}.json`,
  },
  [TEMPLATE_TYPE.evidence]: {
    template: evidenceTemplate,
    name: 'evidence.json',
  },
};

const publishEvidence = async (templateType, taskID, { supportingSide, title, description, uploadedFile }) => {
  const { path, hash } = uploadedFile ?? {};

  if (!path || !hash) {
    throw new Error(ERROR[templateType]);
  }

  const { template, name } = templateMap[templateType] || {};
  if (!template || !name) {
    throw new Error('Invalid template type');
  }

  const evidence = createEvidence(template, {
    name: title,
    description,
    supportingSide,
    fileURI: path,
    fileTypeExtension: getFileTypeFromPath(path),
    fileHash: hash,
  });

  const fileName = templateType === TEMPLATE_TYPE.challenge ? name(taskID) : name;
  const { path: ipfsPath } = await ipfs.publish(fileName, JSON.stringify(evidence));

  return ipfsPath;
};
export default publishEvidence;

const createEvidence = (template, overrides) => {
  return {
    ...template,
    ...overrides,
  };
};

const getFileTypeFromPath = path => (path ?? '').split('.').slice(-1)?.[0];
