import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import emotionService from '../../services/api/emotionService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const EmotionStatisticsPage = () => {
  const [period, setPeriod] = useState('week'); // week, month, year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Couleurs pour les catégories d'émotions
  const EMOTION_COLORS = {
    "Joie": "#FBBF24",
    "Colère": "#EF4444",
    "Peur": "#8B5CF6",
    "Tristesse": "#3B82F6",
    "Surprise": "#10B981",
    "Dégoût": "#6B7280"
  };

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      loadEmotionStats();
    }
  }, [isAuthenticated, isLoading, period, currentDate]);

  const loadEmotionStats = async () => {
    setIsLoadingStats(true);
    setError("");
    
    try {
      const response = await emotionService.getEmotionStats(period);
      
      if (response.success) {
        processStatsData(response.data);
      } else {
        setError(response.message || "Impossible de charger les statistiques");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const processStatsData = (data) => {
    // Traitement des données de catégories
    if (data.categoryStats && data.categoryStats.length > 0) {
      const catData = data.categoryStats.map(cat => ({
        name: cat.name,
        value: parseInt(cat.count),
        color: EMOTION_COLORS[cat.name] || "#6B7280"
      }));
      setCategoryData(catData);
    } else {
      setCategoryData([]);
    }
    
    // Traitement des émotions les plus fréquentes
    if (data.topEmotions && data.topEmotions.length > 0) {
      setEmotionData(data.topEmotions.map(emotion => ({
        name: emotion.name,
        category: emotion.category,
        count: parseInt(emotion.count)
      })));
    } else {
      setEmotionData([]);
    }
    
    // Traitement des données temporelles
    if (data.timeData && data.timeData.length > 0) {
      // Regrouper par date
      const groupedByDate = {};
      
      data.timeData.forEach(item => {
        const dateStr = new Date(item.date).toLocaleDateString('fr-FR', 
          period === 'year' ? { month: 'short' } : { day: '2-digit', month: 'short' }
        );
        
        if (!groupedByDate[dateStr]) {
          groupedByDate[dateStr] = { date: dateStr };
        }
        
        groupedByDate[dateStr][item.category] = parseInt(item.count);
      });
      
      setTimeData(Object.values(groupedByDate));
    } else {
      setTimeData([]);
    }
  };

  const navigatePeriod = (direction) => {
    const newDate = new Date(currentDate);
    
    if (period === "week") {
      newDate.setDate(currentDate.getDate() + (7 * direction));
    } else if (period === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (period === "year") {
      newDate.setFullYear(currentDate.getFullYear() + direction);
    }
    
    setCurrentDate(newDate);
  };

  const getPeriodLabel = () => {
    if (period === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (period === "month") {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else if (period === "year") {
      return currentDate.getFullYear().toString();
    }
  };

  const formatEmotionTooltip = (value, name, props) => {
    return [`${value} entrées`, name];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Statistiques des émotions</CardTitle>
            <CardDescription>Visualisez l'évolution de vos émotions</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => navigate('/emotions')}
              variant="outline"
              className="mr-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Retour au tracker
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPeriod("week")} 
              className={period === "week" ? "bg-gray-100" : ""}
            >
              Semaine
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPeriod("month")} 
              className={period === "month" ? "bg-gray-100" : ""}
            >
              Mois
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setPeriod("year")} 
              className={period === "year" ? "bg-gray-100" : ""}
            >
              Année
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Navigateur de période */}
          <div className="flex items-center justify-between mb-6 mt-2">
            <Button variant="ghost" onClick={() => navigatePeriod(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-medium text-gray-700 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              {getPeriodLabel()}
            </h2>
            <Button variant="ghost" onClick={() => navigatePeriod(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {isLoadingStats ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : timeData.length === 0 && categoryData.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Aucune donnée disponible pour cette période</p>
              <p className="text-gray-500 text-sm mt-1">Enregistrez plus d'émotions pour voir apparaître des statistiques</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Graphique d'évolution temporelle */}
              {timeData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Évolution des émotions</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={timeData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        barSize={20}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        {Object.keys(EMOTION_COLORS).map((key) => (
                          <Bar 
                            key={key} 
                            dataKey={key} 
                            fill={EMOTION_COLORS[key]} 
                            stackId="a"
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Graphiques par catégories et émotions spécifiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Répartition par catégorie */}
                {categoryData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Répartition par catégorie</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={formatEmotionTooltip} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Émotions les plus fréquentes */}
                {emotionData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Émotions les plus fréquentes</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={emotionData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Bar 
                            dataKey="count" 
                            name="Occurrences"
                          >
                            {emotionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.category] || "#6B7280"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Observations */}
              {(categoryData.length > 0 || emotionData.length > 0) && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Observations</h3>
                  {categoryData.length > 0 ? (
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="h-2 w-2 mt-2 mr-2 rounded-full bg-blue-500"></span>
                        La catégorie <strong>{categoryData[0]?.name}</strong> représente la plus grande partie de vos émotions enregistrées.
                      </li>
                      {emotionData.length > 0 && (
                        <li className="flex items-start">
                          <span className="h-2 w-2 mt-2 mr-2 rounded-full bg-green-500"></span>
                          <strong>{emotionData[0]?.name}</strong> est l'émotion que vous avez le plus fréquemment enregistrée.
                        </li>
                      )}
                      <li className="flex items-start">
                        <span className="h-2 w-2 mt-2 mr-2 rounded-full bg-purple-500"></span>
                        Continuez à enregistrer vos émotions régulièrement pour obtenir des statistiques plus précises.
                      </li>
                    </ul>
                  ) : (
                    <p className="text-gray-600">Pas assez de données pour générer des observations pertinentes.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionStatisticsPage;