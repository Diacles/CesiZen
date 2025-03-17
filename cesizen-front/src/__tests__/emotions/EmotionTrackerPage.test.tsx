import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmotionTrackerPage from '../../pages/emotions/EmotionTrackerPage';
import emotionService from '../../services/api/emotionService';
import { useAuth } from '../../contexts/AuthContext';

// Mock des services et hooks
jest.mock('../../services/api/emotionService');
jest.mock('../../contexts/AuthContext');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockNavigate = jest.fn();

// Données de test pour les émotions
const mockCategories = {
  'Joie': [
    { id: 1, name: 'Bonheur' },
    { id: 2, name: 'Contentement' }
  ],
  'Tristesse': [
    { id: 3, name: 'Chagrin' },
    { id: 4, name: 'Mélancolie' }
  ]
};

const mockEmotions = [
  {
    id: 1,
    date: new Date('2024-03-15T10:00:00Z'),
    category: 'Joie',
    emotion: 'Bonheur',
    intensity: 4,
    note: 'Belle journée'
  },
  {
    id: 2,
    date: new Date('2024-03-15T15:30:00Z'),
    category: 'Tristesse',
    emotion: 'Mélancolie',
    intensity: 3,
    note: 'Souvenirs nostalgiques'
  }
];

describe('EmotionTrackerPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock du hook d'authentification
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, firstName: 'John', lastName: 'Doe' }
    });
    
    // Mock des réponses API
    emotionService.getEmotionCategories.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Joie', emotions: mockCategories['Joie'] },
        { id: 2, name: 'Tristesse', emotions: mockCategories['Tristesse'] }
      ]
    });
    
    emotionService.getUserEmotions.mockResolvedValue({
      success: true,
      data: mockEmotions
    });
  });

  test('Devrait afficher le tracker d\'émotions avec les données', async () => {
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );

    // Vérifier que les services API sont appelés au chargement
    expect(emotionService.getEmotionCategories).toHaveBeenCalled();
    expect(emotionService.getUserEmotions).toHaveBeenCalled();

    // Vérifier que le titre est affiché
    expect(screen.getByText('Tracker d\'émotions')).toBeInTheDocument();
    
    // Vérifier que les émotions sont affichées après chargement
    await waitFor(() => {
      expect(screen.getByText('Bonheur')).toBeInTheDocument();
      expect(screen.getByText('Mélancolie')).toBeInTheDocument();
    });
    
    // Vérifier que le bouton pour ajouter une émotion est présent
    expect(screen.getByText('Ajouter une émotion')).toBeInTheDocument();
  });

  test('Devrait rediriger vers la page de connexion si non authentifié', async () => {
    // Simuler un utilisateur non authentifié
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false
    });
    
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('Devrait afficher le formulaire d\'ajout d\'émotion', async () => {
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );
    
    // Cliquer sur le bouton pour ajouter une émotion
    const addButton = await screen.findByText('Ajouter une émotion');
    fireEvent.click(addButton);
    
    // Vérifier que le formulaire de sélection de catégorie s'affiche
    expect(screen.getByText('Choisissez une catégorie d\'émotion :')).toBeInTheDocument();
    expect(screen.getByText('Joie')).toBeInTheDocument();
    expect(screen.getByText('Tristesse')).toBeInTheDocument();
  });

  test('Devrait permettre de sélectionner une catégorie puis une émotion', async () => {
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );
    
    // Cliquer sur le bouton pour ajouter une émotion
    const addButton = await screen.findByText('Ajouter une émotion');
    fireEvent.click(addButton);
    
    // Sélectionner la catégorie Joie
    const joyCategory = await screen.findByText('Joie');
    fireEvent.click(joyCategory);
    
    // Vérifier que les émotions de cette catégorie sont affichées
    expect(screen.getByText('Choisissez une émotion spécifique :')).toBeInTheDocument();
    expect(screen.getByText('Bonheur')).toBeInTheDocument();
    expect(screen.getByText('Contentement')).toBeInTheDocument();
    
    // Sélectionner une émotion spécifique
    const happinessEmotion = screen.getByText('Bonheur');
    fireEvent.click(happinessEmotion);
    
    // Vérifier que le formulaire d'intensité s'affiche
    expect(screen.getByText('Intensité (1-5)')).toBeInTheDocument();
    
    // Vérifier que tous les niveaux d'intensité sont disponibles
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Vérifier que le champ de notes est présent
    expect(screen.getByText('Notes (optionnel)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Décrivez le contexte ou vos pensées...')).toBeInTheDocument();
  });

  test('Devrait enregistrer une nouvelle émotion', async () => {
    // Mock de l'ajout d'émotion
    emotionService.addEmotion.mockResolvedValue({
      success: true,
      data: { id: 3, created_at: new Date().toISOString() }
    });
    
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );
    
    // Processus complet d'ajout d'une émotion
    const addButton = await screen.findByText('Ajouter une émotion');
    fireEvent.click(addButton);
    
    // Sélectionner la catégorie
    const joyCategory = await screen.findByText('Joie');
    fireEvent.click(joyCategory);
    
    // Sélectionner l'émotion
    const happinessEmotion = screen.getByText('Bonheur');
    fireEvent.click(happinessEmotion);
    
    // Sélectionner l'intensité
    const intensityLevel = screen.getByText('4');
    fireEvent.click(intensityLevel);
    
    // Ajouter une note
    const noteInput = screen.getByPlaceholderText('Décrivez le contexte ou vos pensées...');
    fireEvent.change(noteInput, { target: { value: 'Journée productive' } });
    
    // Enregistrer l'émotion
    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);
    
    // Vérifier que le service a été appelé avec les bonnes données
    await waitFor(() => {
      expect(emotionService.addEmotion).toHaveBeenCalledWith({
        emotionId: 1, // ID de Bonheur
        intensity: 4,
        note: 'Journée productive'
      });
    });
    
    // Vérifier que les émotions sont rechargées après ajout
    expect(emotionService.getUserEmotions).toHaveBeenCalledTimes(2);
  });

  test('Devrait permettre de supprimer une émotion', async () => {
    // Mock de window.confirm pour confirmer la suppression
    window.confirm = jest.fn().mockReturnValue(true);
    
    // Mock de la suppression d'émotion
    emotionService.deleteEmotion.mockResolvedValue({
      success: true,
      message: 'Émotion supprimée avec succès'
    });
    
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );
    
    // Attendre que les émotions se chargent
    await waitFor(() => {
      expect(screen.getByText('Bonheur')).toBeInTheDocument();
    });
    
    // Trouver et cliquer sur le bouton de suppression
    const deleteButtons = await screen.findAllByTitle('Supprimer');
    fireEvent.click(deleteButtons[0]);
    
    // Vérifier que la confirmation a été demandée
    expect(window.confirm).toHaveBeenCalled();
    
    // Vérifier que le service a été appelé avec le bon ID
    expect(emotionService.deleteEmotion).toHaveBeenCalledWith(1);
    
    // Vérifier que les émotions sont rechargées après suppression
    expect(emotionService.getUserEmotions).toHaveBeenCalledTimes(2);
  });

  test('Devrait permettre de modifier une émotion', async () => {
    // Mock de la mise à jour d'émotion
    emotionService.updateEmotion.mockResolvedValue({
      success: true,
      data: { id: 1, created_at: new Date().toISOString() }
    });
    
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );
    
    // Attendre que les émotions se chargent
    await waitFor(() => {
      expect(screen.getByText('Bonheur')).toBeInTheDocument();
    });
    
    // Trouver et cliquer sur le bouton de modification
    const editButtons = await screen.findAllByTitle('Modifier');
    fireEvent.click(editButtons[0]);
    
    // Vérifier que le formulaire de modification s'affiche avec les données existantes
    await waitFor(() => {
      expect(screen.getByText("Modifier l'émotion")).toBeInTheDocument();
    });
    
    // Changer l'intensité
    const intensityLevel = screen.getByText('5');
    fireEvent.click(intensityLevel);
    
    // Modifier la note
    const noteInput = screen.getByPlaceholderText('Décrivez le contexte ou vos pensées...');
    fireEvent.change(noteInput, { target: { value: 'Journée encore meilleure!' } });
    
    // Enregistrer les modifications
    const updateButton = screen.getByText('Mettre à jour');
    fireEvent.click(updateButton);
    
    // Vérifier que le service a été appelé avec les bonnes données
    await waitFor(() => {
      expect(emotionService.updateEmotion).toHaveBeenCalledWith(1, {
        intensity: 5,
        note: 'Journée encore meilleure!'
      });
    });
    
    // Vérifier que les émotions sont rechargées après modification
    expect(emotionService.getUserEmotions).toHaveBeenCalledTimes(2);
  });

  test('Devrait changer la vue entre jour, semaine et mois', async () => {
    render(
      <BrowserRouter>
        <EmotionTrackerPage />
      </BrowserRouter>
    );
    
    // Vérifier que la vue par défaut est le jour
    expect(screen.getByRole('button', { name: 'Jour' }).className).toContain('bg-gray-100');
    
    // Changer la vue à semaine
    const weekButton = screen.getByRole('button', { name: 'Semaine' });
    fireEvent.click(weekButton);
    
    // Vérifier que la vue a changé
    await waitFor(() => {
      expect(weekButton.className).toContain('bg-gray-100');
    });
    
    // Vérifier que le service est appelé avec de nouveaux paramètres
    expect(emotionService.getUserEmotions).toHaveBeenCalledTimes(2);
    
    // Changer la vue à mois
    const monthButton = screen.getByRole('button', { name: 'Mois' });
    fireEvent.click(monthButton);
    
    // Vérifier que la vue a changé
    await waitFor(() => {
      expect(monthButton.className).toContain('bg-gray-100');
    });
    
    // Vérifier que le service est appelé avec de nouveaux paramètres
    expect(emotionService.getUserEmotions).toHaveBeenCalledTimes(3);
  });
});