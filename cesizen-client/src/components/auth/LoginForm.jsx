import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const LoginForm = () => {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center text-3xl font-bold mb-8">
        Connexion
      </h2>

      {error && (
        <Alert 
          variant="error"
          message={error}
          className="mb-4"
          onClose={() => setError('')}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Mot de passe"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="flex items-center justify-between">
          <Link 
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
        >
          Se connecter
        </Button>

        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link 
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;