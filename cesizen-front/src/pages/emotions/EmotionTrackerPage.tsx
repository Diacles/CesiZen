import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Plus, ChevronLeft, ChevronRight, BarChart2, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import emotionService from '../../services/api/emotionService';
import { useAuth } from '../../contexts/AuthContext';

const EmotionTrackerPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [emotions, setEmotions] = useState([]);
  const [showAddEmotion, setShowAddEmotion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmotionCategory, setSelectedEmotionCategory] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [selectedEmotionId, setSelectedEmotionId] = useState(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [viewMode, setViewMode] = useState("day"); // day, week, month
  const [emotionCategories, setEmotionCategories] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmotionId, setEditingEmotionId] = useState(null);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      loadEmotionCategories();
      loadUserEmotions();
    }
  }, [isAuthenticated, authLoading, currentDate, viewMode]);

  const loadEmotionCategories = async () => {
    try {
      const response = await emotionService.getEmotionCategories();
      if (response.success) {
        const categoriesObj = {};
        response.data.forEach(category => {
          categoriesObj[category.name] = category.emotions.map(e => ({ id: e.id, name: e.name }));
        });
        setEmotionCategories(categoriesObj);
      } else {
        setError("Impossible de charger les catégories d'émotions");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories d'émotions:", err);
      setError("Erreur de connexion au serveur");
    }
  };

  const loadUserEmotions = async () => {
    setIsLoading(true);
    
    try {
      // Calculer les dates de début et fin selon la vue
      let startDate, endDate;
      
      if (viewMode === "day") {
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (viewMode === "week") {
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (viewMode === "month") {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
      }
      
      const response = await emotionService.getUserEmotions(startDate, endDate);
      
      if (response.success) {
        setEmotions(response.data.map(emotion => ({
          id: emotion.id,
          date: new Date(emotion.created_at),
          category: emotion.category_name,
          emotion: emotion.emotion_name,
          intensity: emotion.intensity,
          note: emotion.note
        })));
      } else {
        setError("Impossible de charger vos émotions");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des émotions:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmotion = async () => {
    if (!selectedEmotionId) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      let response;
      
      if (isEditing) {
        response = await emotionService.updateEmotion(editingEmotionId, {
          intensity,
          note
        });
      } else {
        response = await emotionService.addEmotion({
          emotionId: selectedEmotionId,
          intensity,
          note
        });
      }
      
      if (response.success) {
        resetForm();
        loadUserEmotions();
      } else {
        setError(response.message || "Impossible d'enregistrer l'émotion");
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'émotion:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmotion = (emotion) => {
    // Trouver la catégorie et l'émotion
    let foundCategory = null;
    let foundEmotion = null;
    
    Object.entries(emotionCategories).forEach(([category, emotions]) => {
      const found = emotions.find(e => e.name === emotion.emotion);
      if (found) {
        foundCategory = category;
        foundEmotion = found;
      }
    });
    
    if (foundCategory && foundEmotion) {
      setSelectedEmotionCategory(foundCategory);
      setSelectedEmotion(foundEmotion.name);
      setSelectedEmotionId(foundEmotion.id);
      setIntensity(emotion.intensity);
      setNote(emotion.note || "");
      setIsEditing(true);
      setEditingEmotionId(emotion.id);
      setShowAddEmotion(true);
    }
  };

  const handleDeleteEmotion = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette émotion ?")) {
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await emotionService.deleteEmotion(id);
      
      if (response.success) {
        loadUserEmotions();
      } else {
        setError(response.message || "Impossible de supprimer l'émotion");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de l'émotion:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmotionCategory(null);
    setSelectedEmotion(null);
    setSelectedEmotionId(null);
    setIntensity(3);
    setNote("");
    setShowAddEmotion(false);
    setIsEditing(false);
    setEditingEmotionId(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (viewMode === "week") {
      newDate.setDate(currentDate.getDate() + (7 * direction));
    } else if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-blue-200 text-blue-800",
      3: "bg-blue-300 text-blue-800",
      4: "bg-blue-400 text-blue-900",
      5: "bg-blue-500 text-black"
    };
    return colors[intensity] || "bg-blue-300 text-blue-800";
  };

  const getEmotionCategoryColor = (category) => {
    const colors = {
      "Joie": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Colère": "bg-red-100 text-red-800 border-red-300",
      "Peur": "bg-purple-100 text-purple-800 border-purple-300",
      "Tristesse": "bg-blue-100 text-blue-800 border-blue-300",
      "Surprise": "bg-green-100 text-green-800 border-green-300",
      "Dégoût": "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getViewDateRange = () => {
    if (viewMode === "day") {
      return formatDate(currentDate);
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (viewMode === "month") {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Tracker d'émotions</CardTitle>
            <CardDescription>Suivez vos émotions au quotidien</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setViewMode("day")} className={viewMode === "day" ? "bg-gray-100" : ""}>
              Jour
            </Button>
            <Button variant="outline" onClick={() => setViewMode("week")} className={viewMode === "week" ? "bg-gray-100" : ""}>
              Semaine
            </Button>
            <Button variant="outline" onClick={() => setViewMode("month")} className={viewMode === "month" ? "bg-gray-100" : ""}>
              Mois
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/emotions/statistics')}
              className="ml-2"
            >
              <BarChart2 className="w-4 h-4 mr-1" />
              Statistiques
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-0">
          {/* Navigateur de date */}
          <div className="flex items-center justify-between mb-6 mt-2">
            <Button variant="ghost" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-medium text-gray-700 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              {getViewDateRange()}
            </h2>
            <Button variant="ghost" onClick={() => navigateDate(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {isLoading && !showAddEmotion ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {emotions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Aucune émotion enregistrée pour cette période</p>
                  <p className="text-gray-500 text-sm mt-1">Cliquez sur "Ajouter une émotion" pour commencer</p>
                </div>
              ) : (
                emotions.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-lg border ${getEmotionCategoryColor(item.category)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.emotion}</h3>
                        <span className="text-sm text-gray-600">
                          {formatTime(item.date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(item.intensity)}`}>
                          Intensité {item.intensity}/5
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleEditEmotion(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600" 
                          onClick={() => handleDeleteEmotion(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {item.note && (
                      <p className="mt-2 text-sm text-gray-700">{item.note}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {showAddEmotion ? (
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-3">
                {isEditing ? "Modifier l'émotion" : "Ajouter une émotion"}
              </h3>
              
              {!selectedEmotionCategory ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">Choisissez une catégorie d'émotion :</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.keys(emotionCategories).map(category => (
                      <button
                        key={category}
                        className={`p-3 rounded-lg border ${getEmotionCategoryColor(category)} hover:opacity-80 transition`}
                        onClick={() => setSelectedEmotionCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              ) : !selectedEmotion ? (
                <div>
                  <div className="flex items-center mb-3">
                    <button 
                      className="text-sm text-primary hover:underline mr-2"
                      onClick={() => setSelectedEmotionCategory(null)}
                    >
                      <ChevronLeft className="h-4 w-4 inline" /> Retour
                    </button>
                    <p className="text-sm text-gray-600">Choisissez une émotion spécifique :</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {emotionCategories[selectedEmotionCategory]?.map(emotion => (
                      <button
                        key={emotion.id}
                        className={`p-3 rounded-lg border ${getEmotionCategoryColor(selectedEmotionCategory)} hover:opacity-80 transition`}
                        onClick={() => {
                          setSelectedEmotion(emotion.name);
                          setSelectedEmotionId(emotion.id);
                        }}
                      >
                        {emotion.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-3">
                    <button 
                      className="text-sm text-primary hover:underline mr-2"
                      onClick={() => setSelectedEmotion(null)}
                    >
                      <ChevronLeft className="h-4 w-4 inline" /> Retour
                    </button>
                    <p className="text-sm font-medium">
                      {selectedEmotionCategory} › {selectedEmotion}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intensité (1-5)
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(value => (
                        <button
                          key={value}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border 
                          ${intensity === value ? getIntensityColor(value) : 'bg-white text-gray-700'}`}
                          onClick={() => setIntensity(value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Décrivez le contexte ou vos pensées..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleAddEmotion}
                      className="bg-primary hover:bg-secondary text-black"
                      isLoading={isLoading}
                    >
                      {isEditing ? "Mettre à jour" : "Enregistrer"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center mt-4 mb-4">
              <Button 
                onClick={() => setShowAddEmotion(true)}
                className="bg-primary hover:bg-secondary text-black"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une émotion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionTrackerPage;