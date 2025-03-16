import apiService from './Service';

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
  firstName: string;
  lastName: string;
  categories: string[];
}

export interface ArticleCategory {
  id: number;
  name: string;
  description?: string;
}

export interface ArticlePagination {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

export interface ArticlesResponse {
  success: boolean;
  data: Article[];
  pagination: ArticlePagination;
}

export interface ArticleFormData {
  title: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  published: boolean;
  categoryIds: number[];
}

const articleService = {
  // Récupérer tous les articles publiés
  getArticles: async (params?: { 
    category?: string;
    search?: string;
    limit?: number;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) {
      const offset = (params.page - 1) * (params.limit || 10);
      queryParams.append('offset', offset.toString());
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return await apiService.request<ArticlesResponse>({
      url: `/articles${queryString}`,
      method: 'GET'
    });
  },
  
  // Récupérer un article par son slug
  getArticleBySlug: async (slug: string) => {
    return await apiService.request<{ success: boolean; data: Article }>({
      url: `/articles/${slug}`,
      method: 'GET'
    });
  },
  
  // Récupérer toutes les catégories d'articles
  getCategories: async () => {
    return await apiService.request<{ success: boolean; data: ArticleCategory[] }>({
      url: '/articles/categories',
      method: 'GET'
    });
  },
  
  // === Routes administrateur ===
  
  // Récupérer tous les articles (admin)
  getAdminArticles: async (params?: { 
    published?: boolean;
    limit?: number;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.published !== undefined) {
      queryParams.append('published', params.published.toString());
    }
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) {
      const offset = (params.page - 1) * (params.limit || 20);
      queryParams.append('offset', offset.toString());
    }
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return await apiService.request<ArticlesResponse>({
      url: `/articles/admin${queryString}`,
      method: 'GET'
    });
  },
  
  // Récupérer un article par son ID (admin)
  getArticleById: async (id: number) => {
    return await apiService.request<{ success: boolean; data: Article }>({
      url: `/articles/admin/${id}`,
      method: 'GET'
    });
  },
  
  // Créer un nouvel article
  createArticle: async (data: ArticleFormData) => {
    return await apiService.request<{ success: boolean; data: Article; message: string }>({
      url: '/articles',
      method: 'POST',
      data
    });
  },
  
  // Mettre à jour un article
  updateArticle: async (id: number, data: ArticleFormData) => {
    return await apiService.request<{ success: boolean; data: Article; message: string }>({
      url: `/articles/${id}`,
      method: 'PUT',
      data
    });
  },
  
  // Supprimer un article
  deleteArticle: async (id: number) => {
    return await apiService.request<{ success: boolean; message: string }>({
      url: `/articles/${id}`,
      method: 'DELETE'
    });
  }
};

export default articleService;
