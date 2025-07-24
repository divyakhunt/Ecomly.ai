import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon, IconName } from './Icon';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastIcons: Record<ToastType, IconName> = {
  success: 'check-circle',
  error: 'alert-triangle',
  info: 'info',
};

const toastColors: Record<ToastType, string> = {
    success: 'border-green-500',
    error: 'border-red-500',
    info: 'border-blue-500',
};


const Toast: React.FC<{ message: ToastMessage; onDismiss: (id: number) => void }> = ({ message, onDismiss }) => {
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(message.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [message, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative flex items-center gap-4 w-[320px] p-4 my-2 overflow-hidden text-slate-100 bg-slate-800/80 backdrop-blur-md rounded-lg shadow-2xl border-l-4 ${toastColors[message.type]}`}
    >
        <div className="flex-shrink-0">
            <Icon name={toastIcons[message.type]} className="w-6 h-6" />
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium">{message.message}</p>
        </div>
        <button onClick={() => onDismiss(message.id)} className="ml-4 flex-shrink-0 text-slate-500 hover:text-white transition-colors">
            <Icon name="close" className="w-5 h-5"/>
        </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
