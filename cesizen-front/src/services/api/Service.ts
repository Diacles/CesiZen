import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { triggerAuthEvent } from '../../utils/authEvents';

// Créer une instance axios avec la configuration de base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si le token est expiré (401), rediriger vers la page de connexion
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      triggerAuthEvent(false);
    }
    return Promise.reject(error);
  }
);

// Interface pour typer les réponses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

// Service API avec des méthodes typées
const apiService = {
  // Authentification
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/users/login', { email, password });
      
      // Adaptation à la structure de réponse réelle
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored:', localStorage.getItem('token'));
        triggerAuthEvent(true);
      }
      console.log(JSON.stringify(response)) 
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
        errors: error.response?.data?.errors,
      };
    }
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.post('/users/register', userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
        errors: error.response?.data?.errors,
      };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.post('/users/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
        errors: error.response?.data?.errors,
      };
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.post('/users/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
        errors: error.response?.data?.errors,
      };
    }
  },

  // Profil utilisateur
  getProfile: async () => {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.get('/users/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
        errors: error.response?.data?.errors,
      };
    }
  },

  updateProfile: async (profileData: {firstName?: string; lastName?: string; email?: string}) => {
    try {
      // Convertir les noms de champs au format snake_case pour le backend
      const apiData: Record<string, any> = {};
      
      if (profileData.firstName !== undefined) {
        apiData.first_name = profileData.firstName;
      }
      if (profileData.lastName !== undefined) {
        apiData.last_name = profileData.lastName;
      }
      if (profileData.email !== undefined) {
        apiData.email = profileData.email;
      }
      
      console.log("Données envoyées à l'API:", apiData);
      
      const response: AxiosResponse<ApiResponse> = await apiClient.put('/users/profile', apiData);
      
      // Si la mise à jour est réussie, déclencher l'événement d'authentification pour mettre à jour le contexte
      if (response.data.success) {
        triggerAuthEvent(true);
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error.response || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil',
        errors: error.response?.data?.errors,
      };
    }
  },

  // Méthode générique pour les requêtes
  request: async <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await apiClient(config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Une erreur est survenue',
        errors: error.response?.data?.errors,
      };
    }
  },

  // Méthode pour se déconnecter
  logout: () => {
    localStorage.removeItem('token');
    triggerAuthEvent(false);
  },

  getUserRoles: async () => {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.get('/users/roles');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération des rôles',
        errors: error.response?.data?.errors,
      };
    }
  },
};

export default apiService;