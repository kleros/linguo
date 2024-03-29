import useSWR from 'swr';
import { gql } from 'graphql-request';

const tasksQuery = gql`
  query TasksPage($skip: Int) {
    tasks(first: 300, skip: $skip, orderBy: deadline, orderDirection: asc) {
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
  const { data, error } = useSWR({
    query: tasksQuery,
    variables: { skip: skip },
  });

  return { tasks: data ? data.tasks : null, isLoading: !error && !data, isError: error };
};
