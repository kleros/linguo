import useSWR from 'swr';
import { gql } from 'graphql-request';

const taskQuery = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      taskID
      challenger
      deadline
      disputed
      disputeID
      finalRuling
      lang
      lastInteraction
      submissionTimeout
      minPrice
      maxPrice
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
  return { task: data ? data.task : null, isLoading: !error && !data, isError: error };
};
