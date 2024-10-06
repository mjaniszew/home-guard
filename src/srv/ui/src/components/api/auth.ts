import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

interface LoginData {
  username: string;
  password: string;
}

type AuthData = {
  username: string;
  token: string;
}

export const loginMutation = async ({ username, password }: LoginData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/web`, { username, password });
    return response.data as AuthData;
  } catch (error) {
    throw error;
  }
};