import useSWR from 'swr';
import { gql } from 'graphql-request';

const taskQuery = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      taskID
      assignedPrice
      challenger
      deadline
      disputed
      disputeID
      finalRuling
      lang
      lastInteraction
      submissionTimeout
      metaEvidence {
        id
        metaEvidenceID
        URI
      }
      numberOfEvidences
      numberOfRounds
      reason
      requester
      requesterDeposit
      status
      sumDeposit
      translation
      translator
    }
  }
`;

export const useTaskQuery = id => {
  const { data, error, isValidating } = useSWR(() =>
    typeof id !== 'undefined'
      ? {
          query: taskQuery,
          variables: { id: id },
        }
      : false
  );

  if (isValidating) {
    console.log('Task data is being fetched');
  } else if (error) {
    console.log('Error loading task data');
  } else if (data) {
    console.log('Task data is already cached');
  }
  return { task: data ? data.task : emptyTask, isLoading: !error && !data, isError: error };
};

const emptyTask = {
  id: '',
  taskID: '',
  assignedPrice: '0',
  challenger: '',
  deadline: '',
  disputed: false,
  disputeID: '',
  finalRuling: null,
  lang: '',
  lastInteraction: '',
  submissionTimeout: '',
  metaEvidence: {
    id: '',
    metaEvidenceID: '',
    URI: '',
  },
  numberOfEvidences: 0,
  numberOfRounds: 0,
  reason: '',
  requester: '',
  requesterDeposit: '0',
  status: '',
  sumDeposit: '0',
  translation: '',
  translator: '',
};
