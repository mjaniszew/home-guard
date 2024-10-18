import { useQuery, UseQueryResult } from '@tanstack/react-query';

import {
  getHomeSensors,
  getSensorDetails,
  getSensorReadings,
  getHomeSensorsReadings,
  getHomeSensorsCurrentReadings,
  HomeSensorResponse,
  HomeSensorCurrentResponse,
  SensorReadingResponse
} from '../api/sensors';

export const useHomeSensors = (homeId: string | null): UseQueryResult<HomeSensorResponse[], Error> => {
  return useQuery({ 
    queryKey: ['homesensors'], 
    queryFn: () => getHomeSensors(homeId)
  });
};

export const useSensor = (sensorId: string): UseQueryResult<HomeSensorResponse, Error> => {
  return useQuery({ 
    queryKey: ['sensordetails'], 
    queryFn: () => getSensorDetails(sensorId)
  });
};

export const useSensorReadings = (sensorId: string, limit?: number): UseQueryResult<SensorReadingResponse[], Error> => {
  return useQuery({ 
    queryKey: ['sensorreadings'], 
    queryFn: () => getSensorReadings(sensorId, limit)
  });
};

export const useHomeSensorsReadings = (homeId: string): UseQueryResult<HomeSensorResponse[], Error> => {
  return useQuery({ 
    queryKey: ['homesensorsreadings'],
    queryFn: () => getHomeSensorsReadings(homeId)
  });
};

export const useHomeSensorsCurrentReadings = (homeId: string): UseQueryResult<HomeSensorCurrentResponse[], Error> => {
  return useQuery({ 
    queryKey: ['homesensorscurrentreadings'],
    queryFn: () => getHomeSensorsCurrentReadings(homeId)
  });
};