import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const RegisterForm = () => {
  const [error, setError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      await registerUser(data);
      // Rediriger vers la page de connexion avec un message de succès
      navigate('/login', { 
        state: { 
          message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center text-3xl font-bold mb-8">
        Créer un compte
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom"
            {...register('firstName')}
            error={errors.firstName?.message}
          />

          <Input
            label="Nom"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

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

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
        >
          S'inscrire
        </Button>

        <p className="text-center text-sm text-gray-600">
          Déjà inscrit ?{' '}
          <Link 
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;