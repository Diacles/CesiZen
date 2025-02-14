import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const profileSchema = z.object({
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide')
});

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  console.log('User data:', user); // Pour debug

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || ''
    }
  });

  // Mise à jour des valeurs quand user change
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      console.log('Submitting data:', data); // Pour debug
      await updateProfile(data);
      setMessage('Profil mis à jour avec succès');
      setError('');
    } catch (err) {
      console.error('Update error:', err); // Pour debug
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      setMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      {message && (
        <Alert
          variant="success"
          message={message}
          className="mb-4"
          onClose={() => setMessage('')}
        />
      )}

      {error && (
        <Alert
          variant="error"
          message={error}
          className="mb-4"
          onClose={() => setError('')}
        />
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            <Input
              label="Nom"
              {...register('last_name')}
              error={errors.last_name?.message}
            />
          </div>

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Button
            type="submit"
            loading={isSubmitting}
          >
            Mettre à jour
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;