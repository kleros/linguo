import React from 'react';
import t from 'prop-types';

import TaskCard from '~/features/tasks/TaskCard';
import { useMetaEvidenceQuery } from '~/hooks/queries/useMetaEvidenceQuery';

const RequesterTaskCard = props => {
  const { metadata } = useMetaEvidenceQuery(props.metaEvidence.URI);

  return <>{metadata?.title && <TaskCard data={props} metadata={metadata} />}</>;
};

export default RequesterTaskCard;

RequesterTaskCard.propTypes = {
  metaEvidence: t.shape({ URI: t.string.isRequired }),
};
