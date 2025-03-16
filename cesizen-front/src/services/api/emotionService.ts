import apiService from './Service';

const emotionService = {
  getEmotionCategories: async () => {
    return await apiService.request({
      url: '/emotions/categories',
      method: 'GET'
    });
  },
  
  getUserEmotions: async (startDate?: Date, endDate?: Date) => {
    let url = '/emotions/user';
    
    if (startDate && endDate) {
      url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    }
    
    return await apiService.request({
      url,
      method: 'GET'
    });
  },
  
  addEmotion: async (data: { emotionId: number, intensity: number, note?: string }) => {
    return await apiService.request({
      url: '/emotions',
      method: 'POST',
      data
    });
  },
  
  updateEmotion: async (id: number, data: { intensity: number, note?: string }) => {
    return await apiService.request({
      url: `/emotions/${id}`,
      method: 'PUT',
      data
    });
  },
  
  deleteEmotion: async (id: number) => {
    return await apiService.request({
      url: `/emotions/${id}`,
      method: 'DELETE'
    });
  },
  
  getEmotionStats: async (period: 'week' | 'month' | 'year') => {
    return await apiService.request({
      url: `/emotions/stats?period=${period}`,
      method: 'GET'
    });
  }
};

export default emotionService;