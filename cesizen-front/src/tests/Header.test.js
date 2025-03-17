import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/layouts/Header';

// Mock des hooks de contexte
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock des utilitaires d'authentification
jest.mock('../utils/authEvents', () => ({
  listenToAuthEvents: jest.fn(cb => () => {}),
  checkIsAuthenticated: jest.fn(),
  triggerAuthEvent: jest.fn(),
  AUTH_EVENT_NAME: 'auth-status-change'
}));

// Mock de l'API service
jest.mock('../services/api/Service', () => ({
  getProfile: jest.fn(),
  logout: jest.fn()
}));

describe('Header Component', () => {
  test('renders correctly for unauthenticated users', () => {
    // Configure le mock pour un utilisateur non authentifié
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Vérifie que les éléments de navigation sont présents
    expect(screen.getByText(/CESIZen/i)).toBeInTheDocument();
    
    // Vérifie les liens d'authentification pour utilisateur non connecté
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/S'inscrire/i)).toBeInTheDocument();
  });

  test('renders correctly for authenticated users', () => {
    // Configure le mock pour un utilisateur authentifié
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      }
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Vérifie que les éléments de navigation pour utilisateur connecté sont présents
    expect(screen.getByText(/CESIZen/i)).toBeInTheDocument();
    expect(screen.getByText(/Émotions/i)).toBeInTheDocument();
    
    // Vérifie que le nom d'utilisateur est affiché
    expect(screen.getByText(/John/i)).toBeInTheDocument();
    
    // Les liens d'authentification ne devraient pas être présents
    const loginLink = screen.queryByText(/Connexion/i);
    expect(loginLink).not.toBeInTheDocument();
  });

  test('renders admin links for admin users', () => {
    // Configure le mock pour un utilisateur administrateur
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'alcides@pepin.vin', // Email spécifique pour l'admin selon le code
        roles: ['ADMIN']
      }
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Vérifie que les liens d'administration sont présents
    expect(screen.getByText(/Admin Articles/i)).toBeInTheDocument();
  });

  test('handles loading state correctly', () => {
    // Configure le mock pour l'état de chargement
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Vérifie que le composant se rend correctement même pendant le chargement
    expect(screen.getByText(/CESIZen/i)).toBeInTheDocument();
  });
});