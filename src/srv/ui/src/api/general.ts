import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { getCookieObject } from '../utils/cookie';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export type ConfigData = {
  serverHost: string;
  connectionSecure: boolean;
}

export const webConfig = async () => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/web-config`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as ConfigData;
  } catch (error) {
    throw error;
  }
};

export const useWebConfig = (): UseQueryResult<ConfigData, Error> => {
  return useQuery({ queryKey: ['webconfig'], queryFn: webConfig});
}