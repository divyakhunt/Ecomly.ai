
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { geminiService } from '../services/geminiService';
import Loader from '../components/Loader';
import { Icon } from '../components/Icon';

const MAX_PROMPT_LENGTH = 500;

const examplePrompts = [
    "A sleek, matte black coffee mug on a dark wooden table.",
    "A stack of white paper shopping bags with black handles.",
    "A premium, rigid cardboard box for a luxury watch.",
    "A classic white cotton t-shirt, folded neatly.",
];

const MakeMyBrand: React.FC = () => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_PROMPT_LENGTH) {
      setPrompt(value);
    }
     const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleLogoChange = (file: File | null | undefined) => {
    if (file) {
      const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!acceptedTypes.includes(file.type)) {
        setError("Invalid file type. Please use PNG, JPG, or WEBP. Transparent PNGs work best.");
        return;
      }
      setIsDragging(false);
      setLogoFile(file);
      setError(null);
      setGeneratedImage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); handleLogoChange(e.dataTransfer.files?.[0]); };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile || !prompt.trim()) {
      setError('Please upload a logo and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const logoBase64 = await fileToBase64(logoFile);
      const imageUrl = await geminiService.generateBrandedProduct(logoBase64, logoFile.type, prompt);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error('Error generating branded image:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [logoFile, prompt]);

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      const sanitizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
      const fileName = `Ecomly-brand-${sanitizedPrompt || 'mockup'}.png`;
      link.href = generatedImage;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  return (
    <PageWrapper
      title="Make My Brand"
      description="Upload your logo, describe a product, and let our AI generate a stunning product mockup in seconds. Perfect for visualizing your brand on merchandise."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Inputs */}
        <div className="bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-800/80 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">1. Upload Your Logo</label>
              <motion.div
                onClick={() => !logoPreview && fileInputRef.current?.click()}
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                className="w-full relative p-4 min-h-[160px] border-2 border-dashed border-slate-700 bg-slate-950/40 rounded-xl flex flex-col items-center justify-center text-center group transition-all duration-300"
                animate={{
                  borderColor: isDragging ? 'rgb(59 130 246 / 0.7)' : 'rgb(55 65 81)',
                  backgroundColor: isDragging ? 'rgb(17 24 39 / 0.5)' : 'rgb(3 7 18 / 0.4)',
                }}
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo preview" className="max-h-28 max-w-full object-contain" />
                    <button type="button" onClick={clearLogo} className="absolute top-2 right-2 p-1.5 bg-slate-800/60 hover:bg-slate-700/80 rounded-full text-slate-400 hover:text-white transition-all" aria-label="Remove logo">
                        <Icon name="close" className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                    <Icon name="upload" className="w-10 h-10 mx-auto mb-2 text-slate-600 group-hover:text-blue-500 transition-colors duration-300"/>
                    <p className="font-semibold text-slate-300">Click or drag & drop logo</p>
                    <p className="text-xs mt-1">PNG with transparency recommended</p>
                  </div>
                )}
              </motion.div>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleLogoChange(e.target.files?.[0])} />
            </div>

            {/* Prompt */}
            <div>
               <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">2. Describe the Product</label>
               <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="prompt"
                    rows={3}
                    value={prompt}
                    onChange={handlePromptChange}
                    className="block w-full bg-slate-900 text-slate-200 rounded-lg border border-slate-700/80 shadow-sm focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 sm:text-sm placeholder-slate-500 resize-none overflow-hidden transition-all duration-200 p-3 pr-12"
                    placeholder="e.g., A white ceramic coffee mug"
                  />
                  <div className="absolute top-2.5 right-3 text-xs text-slate-500 pointer-events-none">{prompt.length} / {MAX_PROMPT_LENGTH}</div>
              </div>
               <div className="flex flex-wrap gap-2 mt-3">
                {examplePrompts.map((p, i) => (
                  <button key={i} type="button" onClick={() => setPrompt(p)} className="text-xs bg-slate-800/70 border border-slate-700/80 text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-700/80 hover:text-white hover:border-slate-600 transition-all duration-200 transform hover:-translate-y-px active:translate-y-0 shadow-sm">
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.button type="submit" disabled={isLoading || !logoFile || !prompt.trim()} whileHover={{scale: isLoading || !logoFile || !prompt.trim() ? 1 : 1.05}} whileTap={{scale: isLoading || !logoFile || !prompt.trim() ? 1 : 0.98}} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <Icon name="sparkles" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Generating Mockup...' : 'Generate Mockup'}
            </motion.button>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </form>
        </div>
        
        {/* Right Column: Output */}
        <div className="w-full space-y-4">
          <div className="relative aspect-square w-full bg-slate-950/50 rounded-xl flex items-center justify-center border border-slate-800/80 hover:border-blue-500 transition-all duration-300 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                  <Loader text="Creating your branded product..." />
                </motion.div>
              ) : generatedImage ? (
                <motion.img
                  key="image"
                  src={generatedImage}
                  alt="Generated branded product"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
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
                      <Icon name="tag" className="mx-auto h-16 w-16 text-slate-600"/>
                    </div>
                    <p className="mt-4 text-lg">Your branded mockup will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
           <AnimatePresence>
            {generatedImage && !isLoading && (
              <motion.button
                  onClick={downloadImage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Icon name="download" className="w-5 h-5" /> Download Mockup
                </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
};

export default MakeMyBrand;
