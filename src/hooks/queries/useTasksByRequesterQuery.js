import useSWR from 'swr';
import { gql } from 'graphql-request';

const tasksByRequesterQuery = gql`
  query TasksByRequester($skip: Int, $requester: String) {
    tasks(first: 30, skip: $skip, where: { requester: $requester }, orderBy: taskID, orderDirection: desc) {
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
      requester
      requesterDeposit
      status
      translation
      translator
    }
  }
`;

export const useTasksByRequesterQuery = (requester, skip) => {
  const { data, error, isValidating } = useSWR({
    query: tasksByRequesterQuery,
    variables: { skip: skip, requester: requester },
  });

  if (isValidating) {
    console.log('RequesterTasks data is being fetched');
  } else if (error) {
    console.log('Error loading RequesterTasks data');
  } else if (data) {
    console.log('RequesterTasks data is already cached');
  }
  return { tasks: data ? data.tasks : null, isLoading: !error && !data, error };
};
