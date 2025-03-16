import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiService from '../services/api/Service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles?: string[]; // Ajout du champ roles
  // Ajoutez d'autres propriétés selon votre modèle utilisateur
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifier l'authentification au chargement initial
  useEffect(() => {
    console.log("AuthContext mounted, checking auth...");
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  
    try {
      // Récupérer le profil utilisateur
      const profileResponse = await apiService.getProfile();
      
      if (profileResponse.success && "data" in profileResponse) {
        // Récupérer les rôles utilisateur
        const rolesResponse = await apiService.getUserRoles();
        
        // Normaliser les données utilisateur
        const userData = {
          ...profileResponse.data,
          firstName: profileResponse.data.firstName || profileResponse.data.first_name,
          lastName: profileResponse.data.lastName || profileResponse.data.last_name,
          roles: rolesResponse.success ? rolesResponse.data.map((role: any) => role.name) : []
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        // Token invalide
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };  

  const login = async (email: string, password: string) => {
    console.log("Login called");
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        await checkAuth(); // Récupérer les informations utilisateur après connexion
        return { success: true };
      }
      console.log("Login response:", response);

      return { 
        success: false, 
        message: response.message || 'Identifiants incorrects'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Une erreur est survenue lors de la connexion'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};