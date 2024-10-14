import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { getCookieObject } from '../../utils/cookie';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export type HomeTokenResponse = {
  _id: string,
  value: string,
  name: string,
  homeId: string
}

export type HomeTokenCreateData = Omit<HomeTokenResponse, '_id'>;

export type HomeTokenDeleteData = {
  tokenId: string,
  homeId: string
}

export type UserHomeDataResponse = {
  _id: string,
  name: string,
  userId: string
  tokens: HomeTokenResponse[]
}

const userHomes = async () => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/homes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UserHomeDataResponse[];
  } catch (error) {
    throw error;
  }
};

export const useUserHomes = (): UseQueryResult<UserHomeDataResponse[], Error> => {
  return useQuery({ 
    queryKey: ['userhomes'], 
    queryFn: () => userHomes() 
  });
}

export const tokenCreateMutation = async ({ name, value, homeId }: HomeTokenCreateData) => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/homes/${homeId}/token`,
      { name, value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data as HomeTokenResponse;
  } catch (error) {
    throw error;
  }
};

export const tokenDeleteMutation = async ({ homeId, tokenId }: HomeTokenDeleteData) => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/homes/${homeId}/token/${tokenId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data as HomeTokenResponse;
  } catch (error) {
    throw error;
  }
};