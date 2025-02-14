import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue {user.firstName} !
        </h1>
        <p className="mt-4 text-gray-600">
          Votre espace personnel CESIZen.
        </p>
      </div>
    </div>
  );
};

export default HomePage;