import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then(res => {
          if (res.data && res.data.role) {
            setUser(res.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, mot_de_passe, type = 'staff') => {
    const url = type === 'etudiant' ? '/auth/login-etudiant' : '/auth/login';
    const res = await API.post(url, { email, mot_de_passe });
    
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error("Erreur de connexion");
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/me');
      if (res.data && res.data.role) {
        setUser(res.data);
      }
    } catch (err) {
      console.error("Erreur refresh user", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);