import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

const requestResetSchema = z.object({
  email: z.string().email('Email invalide')
});

export const RequestResetForm = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(requestResetSchema)
  });

  const onSubmit = async (data) => {
    try {
      setStatus({ type: '', message: '' });
      await api.post('/auth/request-reset', data);
      setStatus({
        type: 'success',
        message: 'Si cette adresse email existe dans notre système, vous recevrez un email avec les instructions.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Une erreur est survenue. Veuillez réessayer.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Votre email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {status.message && (
        <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Envoi...' : 'Réinitialiser le mot de passe'}
      </Button>
    </form>
  );
};