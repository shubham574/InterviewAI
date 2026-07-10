import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiKey, FiX, FiCheckCircle } from 'react-icons/fi';
import Button from './Button';
import Input from './Input';
import toast from 'react-hot-toast';

const ApiKeyModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('custom_gemini_key');
      if (storedKey) setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem('custom_gemini_key');
      toast.success('Custom API Key removed. Using system default.');
    } else {
      localStorage.setItem('custom_gemini_key', apiKey.trim());
      toast.success('Custom API Key saved successfully!');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FiKey className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Bring Your Own Key</h2>
                  <p className="text-sm text-text-secondary">Use your own Gemini API key for unlimited AI generations</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Gemini API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  icon={FiKey}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <FiCheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary mb-1">How it works</p>
                    <p>Your API key is stored securely in your browser's local storage. It is sent directly to the server on each request and is never saved in our database. Leave blank to remove your key.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Key
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ApiKeyModal;
