import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmotionTrackerPage from '../pages/emotions/EmotionTrackerPage';

// Mock des hooks de contexte
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock du service d'émotions
jest.mock('../services/api/emotionService', () => ({
  getEmotionCategories: jest.fn(),
  getUserEmotions: jest.fn(),
  addEmotion: jest.fn(),
  updateEmotion: jest.fn(),
  deleteEmotion: jest.fn()
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}));

describe('EmotionTracker Component', () => {
  beforeEach(() => {
    // Configuration par défaut des mocks
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      }
    });

    const emotionService = require('../services/api/emotionService');
    
    // Mock des catégories d'émotions
    emotionService.getEmotionCategories.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: 'Joie',
          emotions: [
            { id: 1, name: 'Bonheur' },
            { id: 2, name: 'Contentement' }
          ]
        },
        {
          id: 2,
          name: 'Tristesse',
          emotions: [
            { id: 3, name: 'Mélancolie' },
            { id: 4, name: 'Chagrin' }
          ]
        }
      ]
    });

    // Mock des émotions utilisateur (vide par défaut)
    emotionService.getUserEmotions.mockResolvedValue({
      success: true,
      data: []
    });
  });

  test('redirects to login if not authenticated', async () => {
    // Configure le mock pour un utilisateur non authentifié
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });

    const navigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(navigate);

    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );

    // Vérifie que navigate a été appelé avec '/login'
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login');
    });
  });

  test('displays empty state when no emotions', async () => {
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );

    // Attend que les données soient chargées
    await waitFor(() => {
      expect(screen.getByText(/Aucune émotion enregistrée pour cette période/i)).toBeInTheDocument();
    });
  });

  test('displays emotions when they exist', async () => {
    // Configure le mock pour renvoyer des émotions
    const emotionService = require('../services/api/emotionService');
    emotionService.getUserEmotions.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          emotion_name: 'Bonheur',
          category_name: 'Joie',
          intensity: 4,
          note: 'Je me sens bien aujourd\'hui',
          created_at: new Date().toISOString()
        }
      ]
    });

    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );

    // Attend que les données soient chargées
    await waitFor(() => {
      expect(screen.getByText(/Bonheur/i)).toBeInTheDocument();
      expect(screen.getByText(/Intensité 4\/5/i)).toBeInTheDocument();
      expect(screen.getByText(/Je me sens bien aujourd'hui/i)).toBeInTheDocument();
    });
  });

  test('opens add emotion form when button is clicked', async () => {
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );

    // Attend que la page soit chargée
    await waitFor(() => {
      expect(screen.getByText(/Ajouter une émotion/i)).toBeInTheDocument();
    });

    // Clique sur le bouton d'ajout
    fireEvent.click(screen.getByText(/Ajouter une émotion/i));

    // Vérifie que le formulaire s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Choisissez une catégorie d'émotion/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    // Configure le mock pour simuler une erreur API
    const emotionService = require('../services/api/emotionService');
    emotionService.getUserEmotions.mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );

    // Attend que l'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText(/Erreur de connexion au serveur/i)).toBeInTheDocument();
    });
  });
});