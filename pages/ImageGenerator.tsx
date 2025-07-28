import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { geminiService } from '../services/geminiService';
import Loader from '../components/Loader';
import { Icon } from '../components/Icon';

const MAX_PROMPT_LENGTH = 500;

const examplePrompts = [
    "A photorealistic image of a blue suede shoe with intricate stitching, isolated on a grey background.",
    "A minimalist product shot of a silver wristwatch with a black leather strap, with soft shadows.",
    "A vibrant, dynamic shot of a pair of colorful running sneakers splashing through a puddle.",
    "A luxury cosmetic set, including lipstick and foundation, arranged elegantly on a marble surface.",
];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_PROMPT_LENGTH) {
      setPrompt(value);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleGenerateImage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await geminiService.generateImage(prompt);
      setGeneratedImage(result);
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try a different prompt or try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);
  
  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');

      // Sanitize the prompt: lowercase, alphanumeric + dashes only, limit length
      const sanitizedPrompt = prompt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')  // replace spaces & symbols with "-"
        .replace(/(^-|-$)/g, '')      // remove leading/trailing dashes
        .slice(0, 40);                // limit to 40 chars

      // Fallback name if prompt is empty
      const fileName = sanitizedPrompt ? `Ecomly-${sanitizedPrompt}.png` : 'ecomly-image.png';

      link.href = generatedImage;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <PageWrapper
      title="AI Image Generator"
      description="Create professional-quality product photos and marketing assets from simple text descriptions."
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Form Column */}
        <div className="w-full lg:max-w-md bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-800/80">
          <form onSubmit={handleGenerateImage} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">Your Prompt</label>
              <div className={`relative p-0.5 rounded-lg transition-all duration-300 bg-slate-800/20`}>
                <motion.div 
                  className="absolute -inset-px rounded-lg pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, var(--glow-color-1), var(--glow-color-2))',
                    backgroundSize: '400% 400%',
                  }}
                  animate={{
                    opacity: isFocused ? 1 : 0,
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{
                    opacity: { duration: 0.3 },
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: 'linear' }
                  }}
                />
                 <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="prompt"
                    rows={3}
                    value={prompt}
                    onChange={handlePromptChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="block w-full bg-slate-900 text-slate-200 rounded-md border-transparent shadow-sm focus:ring-0 focus:border-transparent sm:text-sm placeholder-slate-500 resize-none overflow-hidden transition-all duration-200 p-3 pr-12"
                    placeholder="e.g., A leather bag with a golden zipper on a white background"
                    style={{minHeight: '84px'}}
                  />
                  {prompt && (
                      <button type="button" onClick={() => setPrompt('')} className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors z-10" aria-label="Clear prompt">
                        <Icon name="close" className="w-5 h-5" />
                      </button>
                    )}
                    <div className="absolute bottom-2.5 right-3 text-xs text-slate-500 pointer-events-none">{prompt.length} / {MAX_PROMPT_LENGTH}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                  <Icon name="sparkles" className="w-4 h-4 text-blue-400" />
                  <p className="text-sm text-slate-400 font-medium">Need inspiration? Try one:</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {examplePrompts.map((p, i) => (
                  <button key={i} type="button" onClick={() => setPrompt(p.substring(0, MAX_PROMPT_LENGTH))} className="text-xs bg-slate-800/70 border border-slate-700/80 text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-700/80 hover:text-white hover:border-slate-600 transition-all duration-200 transform hover:-translate-y-px active:translate-y-0 shadow-sm" title={p}>
                    {p.length > 50 ? p.substring(0, 61) + '...' : p}
                  </button>
                ))}
              </div>
            </div>
            
            <motion.button type="submit" data-umami-event="Image Generator Button" disabled={isLoading || !prompt.trim()} whileHover={{scale: isLoading || !prompt.trim() ? 1 : 1.05}} whileTap={{scale: isLoading || !prompt.trim() ? 1 : 0.98}} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <Icon name="sparkles" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Generating Image...' : 'Generate Image'}
            </motion.button>
          </form>
        </div>

        {/* Preview Column */}
        <div className="w-full lg:max-w-[450px] space-y-4">
          <div className="relative h-[450px] w-full bg-slate-950/50 rounded-xl flex items-center justify-center border border-slate-800/80 hover:border-blue-500 transition-all duration-300 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                  <Loader text="Generating your masterpiece..." />
                </motion.div>
              ) : error ? (
                <motion.p key="error" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-red-400 text-center px-4">
                  {error}
                </motion.p>
              ) : generatedImage ? (
                <motion.img
                  key="image"
                  src={generatedImage}
                  alt="Generated art"
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="object-contain w-full h-full rounded-lg shadow-2xl shadow-blue-500/10"
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  exit={{opacity:0}}
                  className="text-center text-slate-500 p-8"
                >
                    <div className="animate-subtle-pulse">
                      <Icon name="image" className="mx-auto h-16 w-16 text-slate-600"/>
                    </div>
                    <p className="mt-4 text-lg">Your generated image will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {generatedImage && !isLoading && (
              <motion.button
                  data-umami-event="Download Image Generator Button"
                  onClick={downloadImage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Icon name="download" className="w-5 h-5" /> Download Image
                </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ImageGenerator;