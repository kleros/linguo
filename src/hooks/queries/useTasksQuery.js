import useSWR from 'swr';
import { gql } from 'graphql-request';

const tasksQuery = gql`
  query TasksPage($skip: Int) {
    tasks(first: 100, skip: $skip, orderBy: taskID, orderDirection: desc) {
      id
      assignedPrice
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
      requester
      requesterDeposit
      status
      translation
      translator
    }
  }
`;

export const useTasksQuery = skip => {
  const { data, error, isValidating } = useSWR({
    query: tasksQuery,
    variables: { skip: skip },
  });

  if (isValidating) {
    console.log('Task data is being fetched');
  } else if (error) {
    console.log('Error loading task data');
  } else if (data) {
    console.log('Task data is already cached');
  }
  return { tasks: data ? data.tasks : null, isLoading: !error && !data, isError: error };
};
