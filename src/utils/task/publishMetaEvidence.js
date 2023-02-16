import deepmerge from 'deepmerge';
import metaEvidenceTemplate from '~/assets/fixtures/metaEvidenceTemplate.json';
import { NETWORKS } from '~/consts/supportedChains';
import ipfs from '~/app/ipfs';

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
  const { path } = await ipfs.publish('linguo-meta-evidence.json', JSON.stringify(metaEvidence));
  return path;
};

const chainIdToCurrentEvidenceDisplayInterfaceURI = {
  [NETWORKS.ethereum]: '/ipfs/QmXGDMfcxjfQi5SFwpBSb73pPjoZq2N8c6eWCgxx8pVqj7/index.html',
  [NETWORKS.goerli]: '/ipfs/QmXGDMfcxjfQi5SFwpBSb73pPjoZq2N8c6eWCgxx8pVqj7/index.html',
  [NETWORKS.sokol]: '/ipfs/Qmb5n6PgbshktJqGpwMAxP1moXEPaqq7ZvRufeXXhSPXxW/linguo-evidence-display/index.html',
  [NETWORKS.gnosis]: '/ipfs/Qmb5n6PgbshktJqGpwMAxP1moXEPaqq7ZvRufeXXhSPXxW/linguo-evidence-display/index.html',
};

const chainIdToCurrentDynamicScriptURI = {
  [NETWORKS.ethereum]: '/ipfs/QmchWC6L3dT23wwQiJJLWCeS1EDnDYrLcYat93C4Lm4P4E/linguo-dynamic-script.js',
  [NETWORKS.goerli]: '/ipfs/QmchWC6L3dT23wwQiJJLWCeS1EDnDYrLcYat93C4Lm4P4E/linguo-dynamic-script.js',
  [NETWORKS.sokol]: '/ipfs/QmPAHCRtSU844fdjNoEws8AgTpzzwsYwMF2wydtpvXAcoZ/linguo-script.js',
  [NETWORKS.gnosis]: '/ipfs/QmPAHCRtSU844fdjNoEws8AgTpzzwsYwMF2wydtpvXAcoZ/linguo-script.js',
};
