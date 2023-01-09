import useSWR from 'swr';
import { gql } from 'graphql-request';

const evidencesByTaskQuery = gql`
  query Evidences($id: ID!) {
    evidences(where: { task_: { id: $id } }, orderBy: timestamp, orderDirection: desc) {
      id
      arbitrator
      URI
      number
      party
      task {
        id
      }
      timestamp
    }
  }
`;

export const useEvidencesByTaskQuery = id => {
  const { data, error, isValidating } = useSWR(() =>
    typeof id !== 'undefined'
      ? {
          query: evidencesByTaskQuery,
          variables: { id: id },
        }
      : false
  );

  if (isValidating) {
    console.log('Evidence data is being fetched');
  } else if (error) {
    console.log('Error loading evidence data');
  } else if (data) {
    console.log('Evidence data is already cached');
  }
  return { evidences: data ? data.evidences : null, isLoading: !error && !data, error: error };
};
