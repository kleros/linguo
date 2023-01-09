import useSWR from 'swr';
import { gql } from 'graphql-request';

const roundQuery = gql`
  query Round($id: ID!) {
    round(id: $id) {
      id
      amountPaidTranslator
      amountPaidChallenger
      appealed
      appealedAt
      appealPeriodStart
      appealPeriodEnd
      creationTime
      feeRewards
      hasPaidChallenger
      hasPaidTranslator
      numberOfContributions
      ruling
      rulingTime
      task {
        id
        taskID
        disputeID
        arbitrator
      }
    }
  }
`;

export const useRoundQuery = id => {
  const { data, error, isValidating } = useSWR({
    query: roundQuery,
    variables: { id: id },
  });

  if (isValidating) {
    console.log('Round data is being fetched');
  } else if (error) {
    console.log('Round loading task data');
  } else if (data) {
    console.log('Round data is already cached');
  }
  return { round: data ? data.round : null, isLoading: !error && !data, error };
};
