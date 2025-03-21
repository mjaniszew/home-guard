import axios from 'axios';
import { getCookieObject } from '../utils/cookie';

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
  userId: string,
  notificationTopic?: string,
  tokens: HomeTokenResponse[]
}

export const getUserHomes = async (fetchTokenData?: boolean) => {
  const { token } = getCookieObject('auth');
  const url = `${BACKEND_URL}/api/homes${fetchTokenData ? '?tokenData=true': ''}`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as UserHomeDataResponse[];
  } catch (error) {
    throw error;
  }
};

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
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const homeCreateMutation = async ({ 
  name, notificationTopic 
}: {
  name: string, notificationTopic: string
}) => {
  const { token, userId } = getCookieObject('auth');
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/homes`,
      { name, userId, notificationTopic },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data as UserHomeDataResponse;
  } catch (error) {
    throw error;
  }
};

export const homeEditMutation = async ({ 
  homeId, name, notificationTopic 
}: {
  homeId: string, name: string, notificationTopic: string
}) => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/homes/${homeId}/edit`,
      { name, notificationTopic },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data as UserHomeDataResponse;
  } catch (error) {
    throw error;
  }
};

export const homeDeleteMutation = async ({ homeId }: {homeId: string}) => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/homes/${homeId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};