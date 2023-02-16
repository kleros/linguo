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
  const { data, error } = useSWR(() =>
    typeof id !== 'undefined'
      ? {
          query: evidencesByTaskQuery,
          variables: { id: id },
        }
      : false
  );

  return { evidences: data ? data.evidences : null, isLoading: !error && !data, error: error };
};
