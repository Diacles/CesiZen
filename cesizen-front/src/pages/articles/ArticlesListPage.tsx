import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import articleService, { Article, ArticleCategory } from '../../services/api/articleService';

const ArticlesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  
  const navigate = useNavigate();
  const ARTICLES_PER_PAGE = 10;

  useEffect(() => {
    loadCategories();
    
    // Extraire les paramètres de recherche de l'URL
    const category = searchParams.get('category') || "";
    const search = searchParams.get('search') || "";
    const page = parseInt(searchParams.get('page') || "1");
    
    setSelectedCategory(category);
    setSearchTerm(search);
    setCurrentPage(page);
    
    loadArticles(category, search, page);
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const response = await articleService.getCategories();
      
      if (response.success) {
        setCategories(response.data);
      } else {
        console.error("Erreur lors du chargement des catégories");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
    }
  };

  const loadArticles = async (category?: string, search?: string, page: number = 1) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await articleService.getArticles({
        category,
        search,
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSearchParams(selectedCategory, searchTerm, 1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateSearchParams(category, searchTerm, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateSearchParams(selectedCategory, searchTerm, newPage);
  };

  const updateSearchParams = (category: string, search: string, page: number) => {
    const params = new URLSearchParams();
    
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', page.toString());
    
    setSearchParams(params);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
        <p className="text-gray-600 mb-6">
          Consultez les articles informatifs sur la santé mentale et le bien-être
        </p>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Rechercher un article..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" className="ml-2 bg-primary hover:bg-secondary text-black">
                  Rechercher
                </Button>
              </form>
            </div>
            
            <div className="md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 h-10 rounded-md border border-gray-300 bg-white appearance-none pr-8"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronLeft className="h-4 w-4 text-gray-400 rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Liste des articles */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">Aucun article ne correspond à votre recherche</p>
            <p className="text-gray-500 mt-2">
              Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map(article => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="md:flex">
                  {article.imageUrl && (
                    <div className="md:w-1/3 h-48 md:h-auto bg-gray-200">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-article.jpg';
                        }}
                      />
                    </div>
                  )}
                  <div className={`p-6 ${article.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {article.categories.map((category, index) => (
                        <span 
                          key={index} 
                          className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      <a 
                        href={`/articles/${article.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </a>
                    </h2>
                    
                    {article.summary && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{article.firstName} {article.lastName}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="mt-4 w-full md:w-auto bg-primary hover:bg-secondary text-black"
                      onClick={() => navigate(`/articles/${article.slug}`)}
                    >
                      Lire l'article
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
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
      </div>
    </div>
  );
};

export default ArticlesListPage;