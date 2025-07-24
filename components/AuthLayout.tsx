import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-8"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Icon name="logo" className="mx-auto h-12 w-auto text-blue-500 animate-subtle-pulse" />
          <h2 className="mt-6 text-3xl font-extrabold text-slate-100 text">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {subtitle}
          </p>
        </div>
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/60 rounded-2xl shadow-2xl p-8"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthLayout;
