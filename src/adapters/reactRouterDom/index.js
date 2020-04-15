import { useLocation } from 'react-router-dom';

export function useQuery() {
  return Object.fromEntries(new URLSearchParams(useLocation().search).entries());
}
