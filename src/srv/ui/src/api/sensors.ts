import axios from 'axios';
import { getCookieObject } from '../utils/cookie';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export enum SENSOR_TYPES {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  MOTION = 'MOTION',
  FLOOD = 'FLOOD',
  OTHER_NUMERICAL_MEASURE = 'OTHER_NUMERICAL_MEASURE',
  OTHER_TEXT_MEASURE = 'OTHER_TEXTL_MEASURE'
};

export type HomeSensorResponse = {
  _id: string,
  name: string,
  type: string,
  homeId: string
};

export type HomeSensorCurrentResponse = {
  _id: string,
  name: string,
  type: string,
  homeId: string,
  lastReading: SensorReadingResponse[]
};

export type SensorReadingResponse = {
  _id: string,
  sensorId: string,
  homeId: string,
  value: string,
  timestamp: number
};

type SensorCreateData = {
  name: string,
  type: string,
  homeId: string
};

type SensorDeleteData = {
  sensorId: string
};

export const getHomeSensors = async (homeId: string | null) => {
  const { token } = getCookieObject('auth');
  const url = `${BACKEND_URL}/api/sensors?homeId=${homeId}`;

  if (!homeId) {
    return [] as HomeSensorResponse[];
  }

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

export const getSensorDetails = async (sensorId: string) => {
  const { token } = getCookieObject('auth');
  const url = `${BACKEND_URL}/api/sensors/${sensorId}`;

  if (!sensorId) {
    return [] as HomeSensorResponse[];
  }

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

export const getSensorReadings = async (sensorId: string, limit?: number) => {
  const { token } = getCookieObject('auth');
  let url = `${BACKEND_URL}/api/sensors/${sensorId}/readings`;

  if (!sensorId) {
    return [] as SensorReadingResponse[];
  }

  if (limit) {
    url = `${url}?limit=${limit}`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as SensorReadingResponse[];
  } catch (error) {
    throw error;
  }
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
      `${BACKEND_URL}/api/sensors/${sensorId}`,
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

export const getHomeSensorsReadings = async (homeId: string) => {
  const { token } = getCookieObject('auth');
  const url = `${BACKEND_URL}/api/sensors/readings?homeId=${homeId}`

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

export const getHomeSensorsCurrentReadings = async (homeId: string) => {
  const { token } = getCookieObject('auth');
  const url = `${BACKEND_URL}/api/sensors/readings/current?homeId=${homeId}`

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as HomeSensorCurrentResponse[];
  } catch (error) {
    throw error;
  }
};
