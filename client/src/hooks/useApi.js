import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

export const useApiQuery = (key, url, options = {}) => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const token = await getToken();
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const { data } = await api.get(url, config);
      return data;
    },
    ...options,
  });
};

export const useApiMutation = (url, method = 'post', options = {}) => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload) => {
      const token = await getToken();
      // Support for FormData (e.g. file uploads)
      const isFormData = payload instanceof FormData;
      
      const config = { headers: {} };
      if (token) config.headers.Authorization = `Bearer ${token}`;
      if (isFormData) config.headers['Content-Type'] = 'multipart/form-data';

      // Pass the custom Gemini API key if set
      const geminiKey = localStorage.getItem('custom_gemini_key');
      if (geminiKey) config.headers['x-gemini-api-key'] = geminiKey;
      
      const { data } = await api[method](url, payload, config);
      return data;
    },
    onError: (error) => {
      const message = error.response?.data?.error || error.message || 'An error occurred';
      if (options.showErrorToast !== false) {
        toast.error(message);
      }
    },
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
      }
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
