import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export const ResetPasswordForm = () => {
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const { token } = useParams();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setStatus({ type: '', message: '' });
      await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      setStatus({
        type: 'success',
        message: 'Votre mot de passe a été réinitialisé avec succès.'
      });
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Le lien de réinitialisation est invalide ou a expiré.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="password"
          placeholder="Nouveau mot de passe"
          {...register('password')}
          className={errors.password ? 'border-red-500' : ''}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Confirmer le mot de passe"
          {...register('confirmPassword')}
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
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
        {isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}
      </Button>
    </form>
  );
};