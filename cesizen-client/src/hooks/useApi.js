import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (apiCall) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiCall();
            return response.data;
        } catch (err) {
            setError(
                err.response?.data?.message || 
                'Une erreur est survenue. Veuillez réessayer.'
            );
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        execute
    };
};

export default useApi;