import React from 'react';
import { motion, Variants } from 'framer-motion';

interface PageWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const MagicText: React.FC<{ text: string }> = ({ text }) => {
  const textVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.02 }
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, x: -20, skewX: 10 },
    visible: {
      opacity: 1,
      x: 0,
      skewX: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1] as const
      },
    },
  };


  return (
    <motion.h1
      className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl md:text-5xl"
      variants={textVariants}
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, i) => (
        <motion.span key={i} variants={letterVariants} style={{display: 'inline-block'}}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
};

const PageWrapper: React.FC<PageWrapperProps> = ({ title, description, children }) => {
  return (
    <motion.div 
      className="max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-12">
        <MagicText text={title} />
        <motion.p
          variants={itemVariants}
          className="mt-4 max-w-md mx-auto text-xs text-slate-400 sm:text-sm md:mt-5 md:text-sm md:max-w-3xl"
        >
          {description}
        </motion.p>
      </div>
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageWrapper;