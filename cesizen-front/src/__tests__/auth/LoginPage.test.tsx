import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/auth/LoginPage';
import apiService from '../../services/api/Service';

// Mock du service API
jest.mock('../../services/api/Service');

// Mock de useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockNavigate = jest.fn();

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait afficher le formulaire de connexion', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Vérifier les éléments du formulaire
    expect(screen.getByText('Connectez-vous')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
    expect(screen.getByText(/Vous n'avez pas de compte ?/i)).toBeInTheDocument();
    expect(screen.getByText(/Créer un compte/i)).toBeInTheDocument();
  });

  test('Devrait soumettre le formulaire avec les identifiants', async () => {
    // Mock de la réponse API
    apiService.login.mockResolvedValueOnce({
      success: true,
      token: 'fake_token'
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { 
      target: { value: 'password123' } 
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Vérifier que la fonction login a été appelée avec les bons paramètres
    expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password123');

    // Attendre que la redirection se produise après la connexion réussie
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('Devrait afficher un message d\'erreur en cas d\'échec de connexion', async () => {
    // Mock de la réponse API avec erreur
    apiService.login.mockResolvedValueOnce({
      success: false,
      message: 'Identifiants incorrects. Veuillez réessayer.'
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { 
      target: { value: 'wrong_password' } 
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Vérifier que le message d'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText('Identifiants incorrects. Veuillez réessayer.')).toBeInTheDocument();
    });

    // Vérifier que la redirection n'a pas eu lieu
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

// src/__tests__/auth/RegisterPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../pages/auth/RegisterPage';
import apiService from '../../services/api/Service';

// Mock du service API
jest.mock('../../services/api/Service');

// Mock de useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockNavigate = jest.fn();

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait afficher le formulaire d\'inscription', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Vérifier les éléments du formulaire
    expect(screen.getByText('Créer un compte CESIZen')).toBeInTheDocument();
    expect(screen.getByLabelText(/Prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /S'inscrire/i })).toBeInTheDocument();
  });

  test('Devrait valider le formulaire avant soumission', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Soumettre le formulaire sans le remplir
    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    // Vérifier que les messages d'erreur s'affichent
    await waitFor(() => {
      expect(screen.getByText(/Le prénom est requis/i)).toBeInTheDocument();
    });

    // API ne devrait pas être appelée
    expect(apiService.register).not.toHaveBeenCalled();
  });

  test('Devrait soumettre le formulaire avec les données valides', async () => {
    // Mock de la réponse API
    apiService.register.mockResolvedValueOnce({
      success: true,
      data: {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
    });

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Prénom/i), { 
      target: { value: 'John' } 
    });
    fireEvent.change(screen.getByLabelText(/Nom/i), { 
      target: { value: 'Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/Email/i), { 
      target: { value: 'john.doe@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), { 
      target: { value: 'Password123!' } 
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    // Vérifier que la fonction register a été appelée avec les bonnes données
    await waitFor(() => {
      expect(apiService.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      });
    });

    // Vérifier que le message de succès s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Inscription réussie!/i)).toBeInTheDocument();
    });

    // Vérifier la redirection après un délai
    jest.advanceTimersByTime(3000);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('Devrait afficher une erreur si l\'email existe déjà', async () => {
    // Mock de la réponse API avec erreur
    apiService.register.mockResolvedValueOnce({
      success: false,
      message: 'Un utilisateur avec cet email existe déjà'
    });

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Prénom/i), { 
      target: { value: 'John' } 
    });
    fireEvent.change(screen.getByLabelText(/Nom/i), { 
      target: { value: 'Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/Email/i), { 
      target: { value: 'existing@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), { 
      target: { value: 'Password123!' } 
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    // Vérifier que le message d'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText('Un utilisateur avec cet email existe déjà')).toBeInTheDocument();
    });
  });
});

// src/__tests__/auth/ForgotPasswordPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../../pages/auth/ForgotPasswordPage';
import apiService from '../../services/api/Service';

// Mock du service API
jest.mock('../../services/api/Service');

describe('ForgotPasswordPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait afficher le formulaire de demande de réinitialisation', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    // Vérifier les éléments du formulaire
    expect(screen.getByText('Réinitialisation du mot de passe')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Envoyer les instructions/i })).toBeInTheDocument();
  });

  test('Devrait soumettre la demande de réinitialisation', async () => {
    // Mock de la réponse API
    apiService.forgotPassword.mockResolvedValueOnce({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.'
    });

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByLabelText(/Email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /Envoyer les instructions/i }));

    // Vérifier que la fonction forgotPassword a été appelée
    expect(apiService.forgotPassword).toHaveBeenCalledWith('test@example.com');

    // Vérifier que le message de succès s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Email envoyé/i)).toBeInTheDocument();
    });
  });

  test('Devrait afficher un message de succès même pour un email inexistant', async () => {
    // Pour des raisons de sécurité, l'API renvoie toujours un succès
    apiService.forgotPassword.mockResolvedValueOnce({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.'
    });

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    // Remplir et soumettre le formulaire
    fireEvent.change(screen.getByLabelText(/Email/i), { 
      target: { value: 'nonexistent@example.com' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /Envoyer les instructions/i }));

    // Vérifier que le message de succès s'affiche quand même
    await waitFor(() => {
      expect(screen.getByText(/Email envoyé/i)).toBeInTheDocument();
    });
  });
});