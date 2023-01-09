import deepmerge from 'deepmerge';
import metaEvidenceTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';

export const publishMetaEvidence = async (chainId, { account, ...metadata }) => {
  const evidenceDisplayInterfaceURI =
    chainIdToCurrentEvidenceDisplayInterfaceURI[chainId] ?? chainIdToCurrentEvidenceDisplayInterfaceURI[1];
  const dynamicScriptURI = chainIdToCurrentDynamicScriptURI[chainId] ?? chainIdToCurrentDynamicScriptURI[1];

  const metaEvidence = deepmerge(metaEvidenceTemplate, {
    evidenceDisplayInterfaceURI,
    dynamicScriptURI,
    aliases: {
      [account]: 'Requester',
    },
    metadata: {
      ...metadata,
      /**
       * v1:
       *  - Removed `text` field
       *  - Added `wordCount` field
       *  - `originalTextFile` is mandatory
       */
      __v: '1',
    },
    arbitrableChainID: chainId,
    /**
     * v1.0.0:
     *  - Removed `text` field
     *  - Added `wordCount` field
     *  - `originalTextFile` is mandatory
     */
    _v: '1.0.0',
  });
  // const { path } = ipfs.publish('linguo-meta-evidence.json', JSON.stringify(metaEvidence));
  const path = '1gfdgd' ?? metaEvidence; // remove this
  return path;
};

const chainIdToCurrentEvidenceDisplayInterfaceURI = {
  1: '/ipfs/QmXGDMfcxjfQi5SFwpBSb73pPjoZq2N8c6eWCgxx8pVqj7/index.html',
  42: '/ipfs/QmYbtF7K6qCfSYfu2k6nYnVRY8HY97rEAF6mgBWtDgfovw/index.html',
  77: '/ipfs/Qmb5n6PgbshktJqGpwMAxP1moXEPaqq7ZvRufeXXhSPXxW/linguo-evidence-display/index.html',
  100: '/ipfs/Qmb5n6PgbshktJqGpwMAxP1moXEPaqq7ZvRufeXXhSPXxW/linguo-evidence-display/index.html',
};

const chainIdToCurrentDynamicScriptURI = {
  1: '/ipfs/QmchWC6L3dT23wwQiJJLWCeS1EDnDYrLcYat93C4Lm4P4E/linguo-dynamic-script.js',
  42: '/ipfs/QmZFcqdsR76jyHyLsBefc4SBuegj2boBDr2skxGauM5DNf/linguo-dynamic-script.js',
  77: '/ipfs/QmPAHCRtSU844fdjNoEws8AgTpzzwsYwMF2wydtpvXAcoZ/linguo-script.js',
  100: '/ipfs/QmPAHCRtSU844fdjNoEws8AgTpzzwsYwMF2wydtpvXAcoZ/linguo-script.js',
};
