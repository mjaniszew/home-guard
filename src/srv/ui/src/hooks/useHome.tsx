import { createContext, useContext, useState, useMemo } from "react";
import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { UserHomeDataResponse, getUserHomes } from "../api/home";

interface HomesContextType {
  userHomes: UserHomeDataResponse[];
  selectedHome: string | null,
  isLoading: boolean,
  error: AxiosError | null,
  selectHome: (id: string) => void;
  refreshData: () => void;
}

const HomeContext = createContext<HomesContextType>({
  userHomes: [],
  selectedHome: null,
  isLoading: true,
  error: null,
  selectHome: () => {},
  refreshData: () => {}
});

export const useUserHomes = (): UseQueryResult<UserHomeDataResponse[], AxiosError> => {
  return useQuery({ 
    queryKey: ['userhomes'], 
    queryFn: () => getUserHomes()
  });
}

export const useUserHomesWithTokens = (): UseQueryResult<UserHomeDataResponse[], AxiosError> => {
  return useQuery({ 
    queryKey: ['userhomeswithtokens'], 
    queryFn: () => getUserHomes(true)
  });
}


export const HomeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, error, refetch } = useUserHomes();
  const [ selectedHome, setSelectedHome ] = useState<string |null>(null);

  const selectHome = (id: string) => {
    setSelectedHome(id);
  };

  const refreshData = () => { refetch() };

  const value: HomesContextType = useMemo(
    () => ({
      userHomes: data || [],
      selectedHome: selectedHome || (data ? data[0]?._id : null),
      isLoading,
      error,
      selectHome,
      refreshData
    }), [data, selectedHome, isLoading, error]
  );

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};

export const useUserHome = () => {
  return useContext(HomeContext);
};
