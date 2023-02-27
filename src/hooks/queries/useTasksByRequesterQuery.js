import useSWR from 'swr';
import { gql } from 'graphql-request';

const tasksByRequesterQuery = gql`
  query TasksByRequester($skip: Int, $requester: String) {
    tasks(first: 150, skip: $skip, where: { requester: $requester }, orderBy: deadline, orderDirection: asc) {
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

export const useTasksByRequesterQuery = (requester, skip) => {
  const { data, error } = useSWR({
    query: tasksByRequesterQuery,
    variables: { skip: skip, requester: requester },
  });

  return { tasks: data ? data.tasks : null, isLoading: !error && !data, error };
};
