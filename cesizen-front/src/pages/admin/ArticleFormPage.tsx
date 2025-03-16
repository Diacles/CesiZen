import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertTriangle, Save, ArrowLeft, Trash2, Eye } from 'lucide-react';
import articleService, { ArticleCategory, ArticleFormData } from '../../services/api/articleService';
import { useAuth } from '../../contexts/AuthContext';

// Import Tiptap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Composant d'éditeur Tiptap
const TiptapEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Toolbar simple
  const MenuBar = () => {
    if (!editor) {
      return null;
    }

    return (
      <div className="border-b border-gray-200 p-2 mb-4 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-100' : ''}
        >
          Gras
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-100' : ''}
        >
          Italique
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
        >
          H1
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''}
        >
          H3
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-100' : ''}
        >
          Liste à puces
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-100' : ''}
        >
          Liste numérotée
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-100' : ''}
        >
          Citation
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Ligne horizontale
        </Button>
      </div>
    );
  };

  return (
    <div className="border border-gray-300 rounded-md">
      <MenuBar />
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[350px]" />
    </div>
  );
};

const ArticleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    published: false,
    categoryIds: []
  });
  
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas admin
    if (isAuthenticated && (!user || !user.roles?.includes('ADMIN'))) {
      navigate('/');
      return;
    }

    loadCategories();
    
    if (isEditing && id) {
      loadArticle(parseInt(id));
    }
  }, [isAuthenticated, user, isEditing, id, navigate]);

  const loadCategories = async () => {
    try {
      const response = await articleService.getCategories();
      
      if (response.success) {
        setCategories(response.data);
      } else {
        setError("Impossible de charger les catégories d'articles");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des catégories:", err);
      setError("Erreur de connexion au serveur");
    }
  };

  const loadArticle = async (articleId: number) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await articleService.getArticleById(articleId);
      
      if (response.success) {
        const article = response.data;
        setFormData({
          title: article.title,
          summary: article.summary || '',
          content: article.content,
          imageUrl: article.imageUrl || '',
          published: !!article.publishedAt,
          categoryIds: article.category_ids || []
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'categoryIds' && (e.target as HTMLSelectElement).multiple) {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions);
      const selectedValues = selectedOptions.map(option => parseInt(option.value));
      setFormData(prev => ({ ...prev, categoryIds: selectedValues }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, published: e.target.checked }));
  };

  // Dans ArticleFormPage.tsx
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    const apiData = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content.trim(),
      // Ne pas inclure imageUrl
      published: formData.published,
      categoryIds: formData.categoryIds.map(id => typeof id === 'string' ? parseInt(id) : id)
    };
    
    console.log('Données à envoyer:', JSON.stringify(apiData));
    
    try {
      let response;
      
      if (isEditing && id) {
        response = await articleService.updateArticle(parseInt(id), apiData);
      } else {
        response = await articleService.createArticle(apiData);
      }
      
      if (response.success) {
        navigate('/admin/articles');
      } else {
        setError(response.message || "Une erreur est survenue lors de l'enregistrement");
      }
    } catch (err: any) {
      console.error("Erreur complète:", err);
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => 
          `${e.path || e.param}: ${e.msg}`).join(', ');
        setError(`Validation échouée: ${errorMessages}`);
      } else {
        setError("Erreur de connexion au serveur");
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditing || !id) return;
    
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.")) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await articleService.deleteArticle(parseInt(id));
      
      if (response.success) {
        navigate('/admin/articles');
      } else {
        setError(response.message || "Impossible de supprimer l'article");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression de l'article:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/articles')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la liste
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-4 h-4 mr-2" /> {previewMode ? "Éditer" : "Aperçu"}
            </Button>
            
            {isEditing && (
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Modifier l'article" : "Créer un nouvel article"}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {previewMode ? (
              <div className="prose max-w-none">
                <h1>{formData.title}</h1>
                {formData.summary && <p className="text-lg italic">{formData.summary}</p>}
                {formData.imageUrl && (
                  <img 
                    src={formData.imageUrl} 
                    alt={formData.title} 
                    className="my-4 max-h-96 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-article.jpg';
                    }}
                  />
                )}
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Titre *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                    Résumé
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Un court résumé de l'article (facultatif)"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Contenu *
                  </label>
                  <div className="min-h-[400px]">
                    <TiptapEditor
                      value={formData.content}
                      onChange={handleContentChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="categoryIds" className="block text-sm font-medium text-gray-700">
                    Catégories *
                  </label>
                  <select
                    id="categoryIds"
                    name="categoryIds"
                    multiple
                    value={formData.categoryIds.map(id => id.toString())}
                    onChange={handleChange}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500">
                    Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs catégories
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handlePublishedChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                    Publier l'article immédiatement
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/articles')}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-secondary text-black"
                    isLoading={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArticleFormPage;