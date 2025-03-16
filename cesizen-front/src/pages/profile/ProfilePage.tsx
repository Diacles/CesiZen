import React, { useState, useEffect } from 'react';
import { User, Mail, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api/Service';

// Fonction utilitaire pour récupérer les valeurs indépendamment du format
const getUserProperty = (user: any, camelCase: string, snakeCase: string): string => {
  if (!user) return '';
  return user[camelCase] || user[snakeCase] || '';
};

const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (user) {
      console.log("User data received:", user); // Pour déboguer
      
      setFormData({
        firstName: getUserProperty(user, 'firstName', 'first_name'),
        lastName: getUserProperty(user, 'lastName', 'last_name'),
        email: user.email || ''
      });
      
      console.log("Form data set:", {
        firstName: getUserProperty(user, 'firstName', 'first_name'),
        lastName: getUserProperty(user, 'lastName', 'last_name'),
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      newErrors.push('Le prénom doit contenir au moins 2 caractères');
    }
    
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      newErrors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.push('Email invalide');
    }
    
    if (newErrors.length > 0) {
      setError(newErrors.join('. '));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiService.updateProfile(formData);
      
      if (response.success) {
        setSuccess('Profil mis à jour avec succès');
        setIsEditing(false);
        // Rafraîchir les données utilisateur dans le contexte
        await checkAuth();
      } else {
        setError(response.message || 'Une erreur est survenue lors de la mise à jour du profil');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la mise à jour du profil');
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    // Remettre les valeurs d'origine
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-gradient-to-br from-primary to-secondary rounded-full mb-4">
          <User className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-600 mt-2">Consultez et modifiez vos informations personnelles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations de compte sur CESIZen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-secondary"
                      isLoading={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    className="bg-primary hover:bg-secondary"
                    onClick={handleEdit}
                  >
                    Modifier mes informations
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compte créé le</h3>
            <p className="text-gray-700">
              {user && user.created_at 
                ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) 
                : 'Information non disponible'}
            </p>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Options de compte</h3>
            <div className="space-y-2">
              <a 
                href="/forgot-password" 
                className="text-primary hover:text-secondary transition inline-block"
              >
                Réinitialiser mon mot de passe
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;