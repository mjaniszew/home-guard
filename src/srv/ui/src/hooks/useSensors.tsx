import { useQuery, UseQueryResult } from '@tanstack/react-query';

import {
  getHomeSensors,
  getHomeSensorsReadings,
  getHomeSensorsCurrentReadings,
  HomeSensorResponse,
  HomeSensorCurrentResponse
} from '../api/sensors';

export const useHomeSensors = (homeId: string | null): UseQueryResult<HomeSensorResponse[], Error> => {
  return useQuery({ 
    queryKey: ['homesensors'], 
    queryFn: () => getHomeSensors(homeId)
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