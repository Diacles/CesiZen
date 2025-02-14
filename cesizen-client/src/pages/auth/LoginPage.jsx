import React from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import Alert from '../../components/ui/Alert';

const LoginPage = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-2xl font-bold text-blue-600">
          CESIZen
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <Alert
              variant="success"
              message={message}
              className="mb-4"
            />
          )}
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;