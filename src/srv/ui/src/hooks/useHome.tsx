import { createContext, useContext, useState, useMemo } from "react";
import { UserHomeDataResponse, useUserHomes } from "../api/home";

interface HomesContextType {
  userHomes: UserHomeDataResponse[];
  selectedHome: string | null,
  isLoading: boolean,
  selectHome: (id: string) => void;
  refreshData: () => void;
}

const HomeContext = createContext<HomesContextType>({
  userHomes: [],
  selectedHome: null,
  isLoading: true,
  selectHome: () => {},
  refreshData: () => {}
});

export const HomeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, refetch } = useUserHomes();
  const [ selectedHome, setSelectedHome ] = useState<string |null>(null);

  const selectHome = (id: string) => {
    setSelectedHome(id);
  };

  const refreshData = () => { refetch ()};

  const value: HomesContextType = useMemo(
    () => ({
      userHomes: data || [],
      selectedHome: selectedHome || (data ? data[0]?._id : null),
      isLoading,
      selectHome,
      refreshData
    }), [data, selectedHome, isLoading]
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
