import React from 'react';
import { motion } from 'framer-motion';

interface ShimmerLoaderProps {
  className?: string;
}

const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({ className }) => {
  return <div className={`shimmer-loader rounded ${className}`} />;
};

export const ShimmerCard: React.FC = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-4"
    >
      <ShimmerLoader className="h-5 w-1/3" />
      <div className="space-y-2.5">
        <ShimmerLoader className="h-4 w-full" />
        <ShimmerLoader className="h-4 w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <ShimmerLoader className="h-6 w-20 rounded-full" />
        <ShimmerLoader className="h-6 w-24 rounded-full" />
      </div>
    </motion.div>
);

export default ShimmerLoader;