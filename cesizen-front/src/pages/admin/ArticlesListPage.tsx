import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Edit, Trash2, Eye, Check, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import articleService, { Article } from '../../services/api/articleService';
import { useAuth } from '../../contexts/AuthContext';

const AdminArticlesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(
    searchParams.has('published') ? searchParams.get('published') === 'true' : undefined
  );
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const ARTICLES_PER_PAGE = 20;

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas admin
    if (isAuthenticated && (!user || !user.roles?.includes('ADMIN'))) {
      navigate('/');
      return;
    }

    // Extraire les paramètres de recherche de l'URL
    const published = searchParams.has('published') 
      ? searchParams.get('published') === 'true' 
      : undefined;
    const page = parseInt(searchParams.get('page') || "1");
    
    setPublishedFilter(published);
    setCurrentPage(page);
    
    loadArticles(published, page);
  }, [isAuthenticated, user, searchParams]);

  const loadArticles = async (published?: boolean, page: number = 1) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await articleService.getAdminArticles({
        published,
        limit: ARTICLES_PER_PAGE,
        page
      });
      
      if (response.success) {
        setArticles(response.data);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.currentPage);
      } else {
        setError("Impossible de charger les articles");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des articles:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (published?: boolean) => {
    setPublishedFilter(published);
    updateSearchParams(published, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateSearchParams(publishedFilter, newPage);
  };

  const updateSearchParams = (published?: boolean, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (published !== undefined) {
      params.set('published', published.toString());
    }
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    setSearchParams(params);
  };

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      const response = await articleService.deleteArticle(id);
      
      if (response.success) {
        // Recharger la liste après suppression
        loadArticles(publishedFilter, currentPage);
      } else {
        setError(response.message || "Impossible de supprimer l'article");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de l'article:", err);
      setError("Erreur de connexion au serveur");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non publié";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des articles</h1>
            <p className="text-gray-600">Créez, modifiez et gérez les articles du site</p>
          </div>
          
          <Button 
            onClick={() => navigate('/admin/articles/new')}
            className="bg-primary hover:bg-secondary text-black"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouvel article
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={publishedFilter === undefined ? "default" : "outline"}
              className={publishedFilter === undefined ? "bg-primary text-black" : ""}
              onClick={() => handleFilterChange(undefined)}
            >
              Tous
            </Button>
            
            <Button 
              variant={publishedFilter === true ? "default" : "outline"}
              className={publishedFilter === true ? "bg-primary text-black" : ""}
              onClick={() => handleFilterChange(true)}
            >
              Publiés
            </Button>
            
            <Button 
              variant={publishedFilter === false ? "default" : "outline"}
              className={publishedFilter === false ? "bg-primary text-black" : ""}
              onClick={() => handleFilterChange(false)}
            >
              Brouillons
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">Aucun article trouvé</p>
            <p className="text-gray-500 mt-2">
              {publishedFilter === undefined 
                ? "Commencez par créer un nouvel article" 
                : publishedFilter 
                  ? "Aucun article publié" 
                  : "Aucun brouillon"
              }
            </p>
            {publishedFilter !== undefined && (
              <Button 
                variant="outline" 
                onClick={() => handleFilterChange(undefined)}
                className="mt-4"
              >
                Voir tous les articles
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Liste des articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Titre</th>
                      <th className="py-3 px-4 text-left">Auteur</th>
                      <th className="py-3 px-4 text-left">Catégories</th>
                      <th className="py-3 px-4 text-left">Statut</th>
                      <th className="py-3 px-4 text-left">Publication</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium truncate max-w-xs" title={article.title}>
                            {article.title}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {article.firstName} {article.lastName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {article.categories.map((category, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {article.publishedAt ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="w-4 h-4 mr-1" /> Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <X className="w-4 h-4 mr-1" /> Brouillon
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(article.publishedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/articles/${article.slug}`)}
                              title="Voir l'article"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                              title="Modifier l'article"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Supprimer l'article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        className={page === currentPage ? "bg-primary text-black" : ""}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button 
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminArticlesListPage;