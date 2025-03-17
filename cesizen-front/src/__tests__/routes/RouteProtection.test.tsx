// src/__tests__/routes/RouteProtection.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock des hooks et composants nécessaires
jest.mock('../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../contexts/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn(),
    AuthProvider: ({ children }) => <div>{children}</div>
  };
});

// Mock des pages
jest.mock('../../pages/auth/LoginPage', () => () => <div>Page de connexion</div>);
jest.mock('../../pages/auth/RegisterPage', () => () => <div>Page d'inscription</div>);
jest.mock('../../pages/profile/ProfilePage', () => () => <div>Page de profil</div>);
jest.mock('../../pages/emotions/EmotionTrackerPage', () => () => <div>Page du tracker d'émotions</div>);
jest.mock('../../pages/emotions/EmotionStatisticsPage', () => () => <div>Page de statistiques</div>);
jest.mock('../../pages/articles/ArticlesListPage', () => () => <div>Liste des articles</div>);
jest.mock('../../pages/admin/ArticlesListPage', () => () => <div>Admin - Liste des articles</div>);

describe('Route Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait permettre l\'accès aux pages publiques sans authentification', async () => {
    // Simuler un utilisateur non authentifié
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });

    // Tester la page de connexion
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Page de connexion')).toBeInTheDocument();

    // Tester la page d'inscription
    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Page d\'inscription')).toBeInTheDocument();

    // Tester la page d'articles (publique)
    render(
      <MemoryRouter initialEntries={['/articles']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Liste des articles')).toBeInTheDocument();
  });

  test('Devrait rediriger vers la page de connexion pour les pages protégées sans authentification', async () => {
    // Simuler un utilisateur non authentifié et une redirection
    const mockNavigate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    // Tester la page de profil
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    
    // Le composant ProfilePage est rendu, mais il contient une redirection
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    // Tester la page du tracker d'émotions
    render(
      <MemoryRouter initialEntries={['/emotions']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('Devrait permettre l\'accès aux pages protégées avec authentification', async () => {
    // Simuler un utilisateur authentifié
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, firstName: 'John', lastName: 'Doe', roles: ['USER'] }
    });

    // Tester la page de profil
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Page de profil')).toBeInTheDocument();

    // Tester la page du tracker d'émotions
    render(
      <MemoryRouter initialEntries={['/emotions']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Page du tracker d\'émotions')).toBeInTheDocument();
  });

  test('Devrait rediriger depuis les pages admin pour les utilisateurs non-admin', async () => {
    // Simuler un utilisateur authentifié sans rôle admin
    const mockNavigate = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, firstName: 'John', lastName: 'Doe', roles: ['USER'] }
    });
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    // Tester la page admin
    render(
      <MemoryRouter initialEntries={['/admin/articles']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('Devrait permettre l\'accès aux pages admin pour les administrateurs', async () => {
    // Simuler un administrateur
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, firstName: 'Admin', lastName: 'User', roles: ['ADMIN'] }
    });

    // Tester la page admin
    render(
      <MemoryRouter initialEntries={['/admin/articles']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Admin - Liste des articles')).toBeInTheDocument();
  });
});

// src/__tests__/routes/Navigation.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/layouts/Header';
import Footer from '../../components/layouts/Footer';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api/Service';

// Mock des services et hooks
jest.mock('../../services/api/Service');
jest.mock('../../contexts/AuthContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockNavigate = jest.fn();

describe('Navigation Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Header Component', () => {
    test('Devrait afficher les liens de navigation pour les visiteurs non authentifiés', () => {
      // Simuler un utilisateur non authentifié
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // Vérifier les liens publics
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
      
      // Vérifier les liens d'authentification
      expect(screen.getByText('Connexion')).toBeInTheDocument();
      expect(screen.getByText('S\'inscrire')).toBeInTheDocument();
      
      // Vérifier l'absence de liens protégés
      expect(screen.queryByText('Émotions')).not.toBeInTheDocument();
      expect(screen.queryByText('Mon profil')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin Articles')).not.toBeInTheDocument();
    });

    test('Devrait afficher les liens protégés pour les utilisateurs authentifiés', () => {
      // Simuler un utilisateur authentifié
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 1, firstName: 'John', lastName: 'Doe', roles: ['USER'] }
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // Vérifier les liens publics
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Articles')).toBeInTheDocument();
      
      // Vérifier les liens protégés
      expect(screen.getByText('Émotions')).toBeInTheDocument();
      
      // Vérifier l'absence de liens d'authentification
      expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
      expect(screen.queryByText('S\'inscrire')).not.toBeInTheDocument();
      
      // Vérifier le nom d'utilisateur et le menu utilisateur
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    test('Devrait afficher les liens admin pour les administrateurs', () => {
      // Simuler un administrateur
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 1, firstName: 'Admin', lastName: 'User', roles: ['ADMIN'] }
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // Vérifier les liens admin
      expect(screen.getByText('Admin Articles')).toBeInTheDocument();
    });

    test('Devrait gérer la déconnexion', () => {
      // Simuler un utilisateur authentifié
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 1, firstName: 'John', lastName: 'Doe' }
      });

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );

      // Cliquer sur le bouton de déconnexion
      fireEvent.click(screen.getByText('Déconnexion'));
      
      // Vérifier que le service de déconnexion est appelé
      expect(apiService.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Footer Component', () => {
    test('Devrait afficher les informations de pied de page', () => {
      render(
        <BrowserRouter>
          <Footer />
        </BrowserRouter>
      );

      // Vérifier les sections principales
      expect(screen.getByText('CESIZen')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Ressources')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      
      // Vérifier les liens de navigation
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Tracker d\'émotions')).toBeInTheDocument();
      
      // Vérifier les informations de contact
      expect(screen.getByText('contact@cesizen.fr')).toBeInTheDocument();
    });
  });
});