import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useApiQuery = (key, url, options = {}) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const { data } = await api.get(url);
      return data;
    },
    ...options,
  });
};

export const useApiMutation = (url, method = 'post', options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      // Support for FormData (e.g. file uploads)
      const isFormData = payload instanceof FormData;
      
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      
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
