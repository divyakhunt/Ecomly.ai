import React, { useRef, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, Variants, useSpring } from 'framer-motion';
import { Icon } from '../components/Icon';
import { useAuth } from '../hooks/useAuth';

const features = [
  { name: 'AI Chatbot', description: 'Get product recommendations, order support, and answers to your FAQs.', icon: 'chat', href: '/chatbot' },
  { name: 'AI Image Generator', description: 'Create stunning product photos and marketing visuals from text.', icon: 'image', href: '/image-generator' },
  { name: 'Background Remover', description: 'Automatically remove the background from any product image.', icon: 'background', href: '/background-remover' },
  { name: 'Make My Brand', description: 'Instantly visualize your logo on products like mugs, t-shirts, or boxes.', icon: 'tag', href: '/make-my-brand' },
  { name: 'Product Lister', description: 'Instantly generate titles, descriptions, and hashtags from a product image.', icon: 'summary', href: '/product-summary' },  
  { name: 'Shipping Label Cropper', description: 'Crop shipping labels from PDFs for various e-commerce platforms.', icon: 'crop', href: '/label-cropper' },
];

const FeatureCard: React.FC<{ feature: typeof features[0] }> = ({ feature }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  
  const rotateX = useTransform(springY, [-150, 150], [15, -15]);
  const rotateY = useTransform(springX, [-150, 150], [-15, 15]);
  
  const parallaxX = useTransform(springX, [-150, 150], [-10, 10]);
  const parallaxY = useTransform(springY, [-150, 150], [-10, 10]);


  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const { width, height, left, top } = rect;
      const mouseX = event.clientX - left;
      const mouseY = event.clientY - top;
      x.set(mouseX - width / 2);
      y.set(mouseY - height / 2);
      cardRef.current?.style.setProperty('--x', `${mouseX}px`);
      cardRef.current?.style.setProperty('--y', `${mouseY}px`);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isAuthenticated) {
        navigate(feature.href);
    } else {
        navigate(`/signin?redirect=${feature.href}`);
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
      }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="h-full"
      >
        <div
          ref={cardRef}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="spotlight-card group relative flex flex-col h-full p-8 bg-slate-900/50 rounded-2xl border border-slate-800 transition-shadow duration-300 hover:border-slate-700/80 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
          style={{ transform: 'translateZ(0)' }}
        >
          <motion.div 
            style={{ x: parallaxX, y: parallaxY, transform: 'translateZ(40px)' }}
            className="flex-shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600/20 group-hover:border-blue-500/50"
          >
            <Icon name={feature.icon as any} className="h-6 w-6 text-blue-400" />
          </motion.div>
          <div className="mt-5" style={{ transform: 'translateZ(20px)' }}>
            <h3 className="text-lg font-semibold text-slate-100 transition-colors duration-300 group-hover:text-blue-400">{feature.name}</h3>
            <p className="mt-1 text-base text-slate-400">{feature.description}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Home: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  return (
    <div className="relative">
      <div className="text-center py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-100 sm:text-6xl md:text-7xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="block"
            >
              Supercharge Your E-Commerce
            </motion.span>
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.7, type: 'spring' }}
            className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mt-2"
          >
            with AI-Powered Tools
          </motion.span>
        </h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-2 max-w-md mx-auto text-lg text-slate-400 sm:text-xl md:mt-3 md:max-w-3xl"
        >
          Our AI toolkit helps you generate product photos, remove backgrounds, create branded mockups, write product listings, crop shipping labels, and automate support — all while you build, sell, and succeed.

        </motion.p>
      </div>

      <motion.div 
        className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature) => (
          <FeatureCard key={feature.name} feature={feature} />
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
