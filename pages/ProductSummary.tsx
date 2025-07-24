
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { geminiService } from '../services/geminiService';
import { Icon } from '../components/Icon';
import { ShimmerCard } from '../components/SkeletonLoader';

interface ProductDetails {
  title: string;
  description: string;
  hashtags: string[];
}

const ProductSummary: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedDetails, setGeneratedDetails] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | null | undefined) => {
    if (file) {
      setIsDragging(false);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setGeneratedDetails(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); handleImageChange(e.dataTransfer.files?.[0]); };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  };

  const generateSummary = useCallback(async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedDetails(null);

    try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type;
        const result = await geminiService.generateProductSummary(base64Image, mimeType);
        setGeneratedDetails(result);
    } catch (err) {
        console.error('Error generating summary:', err);
        setError('Failed to generate summary. The AI might be unable to process this image. Please try another one.');
    } finally {
        setIsLoading(false);
    }
  }, [imageFile]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const ResultCard = ({ label, content, copyText, copyId, children }: { label: string; content?: string; copyText: string; copyId: string; children?: React.ReactNode }) => (
    <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl relative transition-all hover:border-slate-700/90 hover:bg-slate-900/80">
        <label className="block text-sm font-semibold text-blue-400 mb-2">{label}</label>
        <div className="text-slate-300 pr-10">
          {children || <p>{content}</p>}
        </div>
        <button onClick={() => copyToClipboard(copyText, copyId)} title="Copy to clipboard" className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-full transition-all duration-200">
          {copiedId === copyId ? <Icon name="check" className="w-5 h-5 text-green-400" /> : <Icon name="copy" className="w-5 h-5" />}
        </button>
    </div>
  );
  
  const cardFlipVariants: Variants = {
    hidden: { opacity: 0, rotateY: -90, transition: { duration: 0.4 } },
    visible: { opacity: 1, rotateY: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <PageWrapper
      title="Product Summary Generator"
      description="Upload a product image and let AI create a compelling title, description, and hashtags for you."
    >
      <div className="bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-800/80">
        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-2 flex flex-col items-center justify-center space-y-4 h-full">
            <motion.div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="w-[350px] aspect-square border-2 border-dashed border-slate-700 bg-slate-950/40 rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer group transition-all duration-300"
              animate={{
                borderColor: isDragging ? 'rgb(59 130 246 / 0.7)' : 'rgb(55 65 81)',
                backgroundColor: isDragging ? 'rgb(17 24 39 / 0.5)' : 'rgb(3 7 18 / 0.4)',
                scale: isDragging ? 1.05 : 1,
              }}
              whileHover={{ scale: 1.02 }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Product preview" className="max-h-full max-w-full object-contain rounded-md" />
              ) : (
                <div className="text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                  <Icon name="image" className="w-16 h-16 mx-auto mb-4 text-slate-600 group-hover:text-blue-500 transition-colors duration-300"/>
                  <p className="font-semibold text-slate-300">Click to upload an image</p>
                  <p className="text-xs mt-1">or drag and drop</p>
                </div>
              )}
            </motion.div>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0])}
            />
            <motion.button
              onClick={generateSummary}
              disabled={!imageFile || isLoading}
              whileHover={{ scale: !imageFile || isLoading ? 1 : 1.05 }}
              whileTap={{ scale: !imageFile || isLoading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:from-gray-600 disabled:to-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
            >
              <Icon name="sparkles" className={`w-5 h-5 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-12'}`} />
              <span>{isLoading ? 'Generating...' : 'Generate Summary'}</span>
            </motion.button>
            {error && <p className="text-red-400 text-sm mt-2 text-center w-full">{error}</p>}
          </div>

          <div className="md:col-span-3 space-y-4 min-h-[400px]" style={{ perspective: 800 }}>
             <AnimatePresence>
                {isLoading && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                      <ShimmerCard />
                      <ShimmerCard />
                      <ShimmerCard />
                  </motion.div>
                )}
                {generatedDetails && !isLoading && (
                  <motion.div 
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.15 } }
                    }}
                  >
                    <motion.div variants={cardFlipVariants} style={{ transformOrigin: 'left' }}>
                      <ResultCard label="Product Title" content={generatedDetails.title} copyText={generatedDetails.title} copyId="title" />
                    </motion.div>
                    <motion.div variants={cardFlipVariants} style={{ transformOrigin: 'left' }}>
                      <ResultCard label="Description" copyText={generatedDetails.description} copyId="desc">
                        <p className="leading-relaxed">{generatedDetails.description}</p>
                      </ResultCard>
                    </motion.div>
                    <motion.div variants={cardFlipVariants} style={{ transformOrigin: 'left' }}>
                      <ResultCard label="Hashtags" copyText={generatedDetails.hashtags.join(' ')} copyId="tags">
                        <div className="flex flex-wrap gap-2 pr-8">
                          {generatedDetails.hashtags.map((tag, index) => (
                            <span key={index} className="bg-slate-800/80 text-blue-300 text-sm font-medium px-3 py-1 rounded-full border border-slate-700/80">#{tag}</span>
                          ))}
                        </div>
                      </ResultCard>
                    </motion.div>
                  </motion.div>
                )}
                {!isLoading && !generatedDetails && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 bg-slate-900/50 rounded-xl p-8 border border-dashed border-slate-700/80">
                         <Icon name="summary" className="w-16 h-16 text-slate-600 mb-4 animate-subtle-pulse" />
                         <h3 className="text-lg font-semibold text-slate-400">Generated content will appear here</h3>
                         <p className="text-sm">Upload an image and click "Generate Summary" to start.</p>
                     </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProductSummary;
