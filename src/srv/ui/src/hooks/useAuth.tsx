import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCookie } from "./useCookie";

type AuthData = {
  username: string | null,
  token: string | null
}

interface AuthContextType {
  auth: AuthData;
  authenticate: (auth: AuthData) => void;
  logout: () => void;
}

const initAuthState: AuthData = { username: null, token: null };

const AuthContext = createContext<AuthContextType>({
  auth: { username: null, token: null },
  authenticate: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useCookie("auth", {});
  const navigate = useNavigate();

  const authenticate = async (data: AuthData) => {
    setAuth(data);
    navigate('/dashboard');
  };

  const logout = () => {
    setAuth(initAuthState);
    navigate("/", { replace: true });
  };

  const value: AuthContextType = useMemo(
    () => ({
      auth,
      authenticate,
      logout,
    }), [auth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
