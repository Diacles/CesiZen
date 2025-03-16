import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import articleService, { Article } from '../../services/api/articleService';
import { useAuth } from '../../contexts/AuthContext';

// Composant pour afficher le contenu HTML sécurisé
const SafeHTML = ({ html }: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!slug) return;
    loadArticle(slug);
  }, [slug]);

  const loadArticle = async (slug: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await articleService.getArticleBySlug(slug);
      
      if (response.success) {
        setArticle(response.data);
      } else {
        setError("Impossible de charger l'article");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'article:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    } else {
      // Copier l'URL dans le presse-papier si Web Share API n'est pas disponible
      navigator.clipboard.writeText(window.location.href);
      alert('URL copiée dans le presse-papier');
    }
  };

  const isAdmin = isAuthenticated && user?.roles?.includes('ADMIN');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/articles')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux articles
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !article ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">Article non trouvé</p>
          </div>
        ) : (
          <div>
            {isAdmin && (
              <div className="mb-6 flex justify-end">
                <Button 
                  onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                  className="bg-primary hover:bg-secondary text-black"
                >
                  Modifier l'article
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {article.categories.map((category, index) => (
                <a 
                  key={index} 
                  href={`/articles?category=${encodeURIComponent(category)}`}
                  className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  {category}
                </a>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            {article.summary && (
              <div className="text-lg text-gray-600 mb-6 italic border-l-4 border-primary pl-4">
                {article.summary}
              </div>
            )}
            
            <div className="flex flex-wrap justify-between items-center mb-6 text-gray-500 text-sm">
              <div className="flex items-center mr-4 mb-2 md:mb-0">
                <User className="h-4 w-4 mr-1" />
                <span>{article.firstName} {article.lastName}</span>
              </div>
              
              <div className="flex items-center mr-4 mb-2 md:mb-0">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              
              <div className="flex items-center mb-2 md:mb-0">
                <Clock className="h-4 w-4 mr-1" />
                <span>{estimateReadingTime(article.content)} min de lecture</span>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={handleShare}
                className="text-sm"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-1" /> Partager
              </Button>
            </div>
            
            {article.imageUrl && (
              <div className="w-full h-64 md:h-96 bg-gray-200 mb-6 rounded-lg overflow-hidden">
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
            
            <Card>
              <CardContent className="prose prose-lg max-w-none pt-6">
                <SafeHTML html={article.content} />
              </CardContent>
            </Card>
            
            <div className="mt-8 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/articles')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux articles
              </Button>
              
              <Button 
                onClick={handleShare}
                className="bg-primary hover:bg-secondary text-black"
              >
                <Share2 className="h-4 w-4 mr-2" /> Partager
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
