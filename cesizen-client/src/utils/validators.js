import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
});

export const registerSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]{8,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères')
});

export const resetRequestSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis')
});

export const resetPasswordSchema = z.object({
  token: z.string()
    .length(64, 'Token invalide')
    .regex(/^[a-fA-F0-9]{64}$/, 'Token invalide'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    )
});