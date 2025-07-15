import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const TOKEN_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24h

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [redefinir, setRedefinir] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiration, setTokenExpiration] = useState(null);
  const navigate = useNavigate();

  const checkTokenExpiration = useCallback(() => {
    if (!tokenExpiration) return false;
    return Date.now() > tokenExpiration;
  }, [tokenExpiration]);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("id_admin");
    localStorage.removeItem("token_expiration");
    setToken(null);
    setIsAuthenticated(false);
    setRedefinir(false);
    setTokenExpiration(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const verifyToken = () => {
      const storedToken = localStorage.getItem("token");
      const storedExpiration = localStorage.getItem("token_expiration");

      if (!storedToken || !storedExpiration) {
        clearAuthData();
        return;
      }

      const expirationTime = parseInt(storedExpiration, 10);

      if (Date.now() > expirationTime) {
        clearAuthData();
      } else {
        setToken(storedToken);
        setTokenExpiration(expirationTime);
        setIsAuthenticated(true);
      }
    };

    verifyToken();
    setLoading(false);

    const intervalId = setInterval(verifyToken, 60000);

    return () => clearInterval(intervalId);
  }, [clearAuthData]);

  const login = (newToken, precisaRedefinir = false) => {
    const expirationTime = Date.now() + TOKEN_EXPIRATION_TIME;
    localStorage.setItem("token", newToken);
    localStorage.setItem("token_expiration", expirationTime.toString());
    setToken(newToken);
    setTokenExpiration(expirationTime);

    if (precisaRedefinir) {
      setRedefinir(true);
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
    setRedefinir(false);
  };

  const logout = () => {
    clearAuthData();
  };

  const contextValue = {
    isAuthenticated: isAuthenticated && !checkTokenExpiration(),
    login,
    logout,
    token: checkTokenExpiration() ? null : token,
    redefinir,
    setRedefinir,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
