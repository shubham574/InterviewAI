import { toast } from 'react-hot-toast';

// Custom toast wrappers for consistent styling
export const showSuccess = (message) => {
  toast.success(message, {
    style: {
      background: '#13131a',
      color: '#f1f5f9',
      border: '1px solid rgba(16, 185, 129, 0.2)',
    },
    iconTheme: {
      primary: '#10b981',
      secondary: '#13131a',
    },
  });
};

export const showError = (message) => {
  toast.error(message, {
    style: {
      background: '#13131a',
      color: '#f1f5f9',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#13131a',
    },
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    style: {
      background: '#13131a',
      color: '#f1f5f9',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  });
};
