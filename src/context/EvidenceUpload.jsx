import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const EvidenceUploadContext = createContext();

const EvidenceUploadProvider = ({ children }) => {
  const [uploadedEvidence, setUploadedEvidence] = useState();

  return (
    <EvidenceUploadContext.Provider value={(uploadedEvidence, setUploadedEvidence)}>
      {children}
    </EvidenceUploadContext.Provider>
  );
};

export const useEvidenceUpload = () => useContext(EvidenceUploadContext);
export default EvidenceUploadProvider;

EvidenceUploadProvider.propTypes = {
  children: PropTypes.node,
};
