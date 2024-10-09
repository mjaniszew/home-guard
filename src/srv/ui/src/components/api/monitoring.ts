import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { getCookieObject } from '../../utils/cookie';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

interface Cam {
  name: string;
  active: boolean;
}

const fetchCams = async (): Promise<Cam[]> => {
  const { token } = getCookieObject('auth');
  const response = await axios.get(`${BACKEND_URL}/api/monitoring/cams`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data as Cam[];
};

export const useCams = (): UseQueryResult<Cam[], Error> => {
  return useQuery({ queryKey: ['cams'], queryFn: fetchCams});
}