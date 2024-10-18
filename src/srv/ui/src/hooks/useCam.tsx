import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchCams, Cam } from '../api/monitoring';

export const useCams = (): UseQueryResult<Cam[], Error> => {
  return useQuery({ queryKey: ['cams'], queryFn: fetchCams});
}