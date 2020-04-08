import React from 'react';
import { useParams } from 'react-router-dom';

function TranslationTaskDetails() {
  const { id } = useParams();
  return <div>Task #{id}</div>;
}

export default TranslationTaskDetails;
