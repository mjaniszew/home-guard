import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { getCookieObject } from '../utils/cookie';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

type HomeSensorResponse = {
  _id: string,
  name: string,
  type: string,
  homeId: string
};

type SensorCreateData = {
  name: string,
  type: string,
  homeId: string
};

type SensorDeleteData = {
  sensorId: string
};

const getHomeSensors = async (homeId: string) => {
  const { token } = getCookieObject('auth');
  const url = `${BACKEND_URL}/api/sensors?home=${homeId}`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as HomeSensorResponse[];
  } catch (error) {
    throw error;
  }
};

export const useHomeSensors = (homeId: string): UseQueryResult<HomeSensorResponse[], Error> => {
  return useQuery({ 
    queryKey: ['homesensors'], 
    queryFn: () => getHomeSensors(homeId)
  });
};

export const sensorCreateMutation = async ({ name, type, homeId }: SensorCreateData) => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/sensors`,
      { name, type, homeId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data as HomeSensorResponse;
  } catch (error) {
    throw error;
  }
};

export const sensorDeleteMutation = async ({ sensorId }: SensorDeleteData) => {
  const { token } = getCookieObject('auth');
  try {
    const response = await axios.delete(
      `${BACKEND_URL}/api/sensor/${sensorId}`,
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

const getHomeSensorsReadings = async (homeId: string) => {
  const { token } = getCookieObject('auth');
  const url = `${BACKEND_URL}/api/sensors/readings?home=${homeId}`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as HomeSensorResponse[];
  } catch (error) {
    throw error;
  }
};

export const useHomeSensorsReadings = (homeId: string): UseQueryResult<HomeSensorResponse[], Error> => {
  return useQuery({ 
    queryKey: ['homesensorsreadings'],
    queryFn: () => getHomeSensorsReadings(homeId)
  });
};