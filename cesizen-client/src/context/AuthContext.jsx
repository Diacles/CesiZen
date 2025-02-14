import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier le token au chargement
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/users/profile');
            setUser(response.data.data);
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        await fetchUserProfile();
        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('/users/register', userData);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        const response = await api.post('/users/forgot-password', { email });
        return response.data;
    };

    const resetPassword = async (token, newPassword) => {
        const response = await api.post('/users/reset-password', { 
            token, 
            newPassword 
        });
        return response.data;
    };

    const updateProfile = async (profileData) => {
        try {
            console.log('Updating profile with:', profileData);
            const response = await api.put('/users/profile', profileData);
            const updatedUser = response.data.data;
            console.log('Updated user data:', updatedUser);
            setUser(updatedUser);
            return response.data;
        } catch (error) {
            console.error('Profile update error:', error.response?.data);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};