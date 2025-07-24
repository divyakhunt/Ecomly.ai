import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { geminiService } from '../services/geminiService';
import Loader from '../components/Loader';
import { Icon } from '../components/Icon';
import { removeBgService } from '../services/removeBgService';

const BackgroundRemover: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [maskBase64, setMaskBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This effect runs when we have an image, a mask, or the background color changes.
    // It composites the final image.
    if (!originalImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { naturalWidth: width, naturalHeight: height } = originalImage;
    canvas.width = width;
    canvas.height = height;

    if (maskBase64) {
      const maskImage = new Image();
      maskImage.onload = () => {
        // Use an offscreen canvas for creating the clipped foreground
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (!offscreenCtx) return;

        // 1. Draw original image on the offscreen canvas
        offscreenCtx.drawImage(originalImage, 0, 0, width, height);

        // 2. Apply the mask. 'destination-in' keeps the part of the destination (original image) 
        // that overlaps with the source (the mask).
        offscreenCtx.globalCompositeOperation = 'destination-in';
        offscreenCtx.drawImage(maskImage, 0, 0, width, height);
        
        // 3. On the main, visible canvas, first draw the background color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // 4. Draw the clipped result from the offscreen canvas on top
        ctx.drawImage(offscreenCanvas, 0, 0, width, height);

        setProcessedImageUrl(canvas.toDataURL('image/png'));
      };
      maskImage.onerror = () => {
        setError("Failed to load the generated mask image. The AI may have returned an invalid format.");
        setMaskBase64(null); // Clear invalid mask
      };
      maskImage.src = `data:image/png;base64,${maskBase64}`;
    } else {
       // If there's no mask yet, just show the original image on a colored background
       ctx.fillStyle = bgColor;
       ctx.fillRect(0, 0, width, height);
       ctx.drawImage(originalImage, 0, 0, width, height);
       if (processedImageUrl) setProcessedImageUrl(null); // Clear old result if image is changed
    }
  }, [bgColor, originalImage, maskBase64, processedImageUrl]);


  const processFile = (file: File | null | undefined) => {
    setOriginalImage(null);
    setProcessedImageUrl(null);
    setError(null);
    setMaskBase64(null);

    const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
    if (file && acceptedTypes.includes(file.type)) {
        setIsDragging(false);
        setImageFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                setOriginalImage(img);
                setError(null);
            };
            img.onerror = () => {
                setError("Browser can't preview this image. Please try a standard format like PNG, JPG, or WEBP.");
                setImageFile(null);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else if (file) {
        setError("Please upload a valid image file (e.g., PNG, JPG, WEBP, HEIC).");
        setImageFile(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { processFile(e.target.files?.[0]); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
  };

  const removeBackground = useCallback(async () => {
    if (!imageFile || !originalImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImageUrl(null);
    setMaskBase64(null);

    try {
        const base64Image = await fileToBase64(imageFile);
        const mimeType = imageFile.type;
        const bgRemovedBlob = await removeBgService.removeImageBackground(imageFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          setMaskBase64(base64data);
        };
        reader.readAsDataURL(bgRemovedBlob);

    } catch (err) {
        console.error('Error removing background:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to remove background. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, [imageFile, originalImage]);
  
  const downloadImage = () => {
    const finalImage = processedImageUrl || canvasRef.current?.toDataURL('image/png');
    if (finalImage) {
      const link = document.createElement('a');
      link.href = finalImage;

      // Extract and sanitize the original filename (without extension)
      const originalName = imageFile?.name?.split('.')?.[0] || 'image';
      const safeName = originalName.replace(/[^a-z0-9]/gi, '-'); // Replace spaces/symbols with dashes

      // Final filename format
      link.download = `Ecomly-no-bg-${safeName}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  const hasResult = !!processedImageUrl && !isLoading;

  return (
    <PageWrapper
      title="Background Remover"
      description="Automatically remove the background from any image with a single click, using an advanced AI model for clean, high-quality results."
    >
      <div className="bg-slate-900/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-800/80">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <motion.div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              className="w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer group transition-all duration-300"
              animate={{
                borderColor: isDragging ? 'rgb(59 130 246 / 0.7)' : 'rgb(55 65 81)',
                backgroundColor: isDragging ? 'rgb(17 24 39 / 0.5)' : 'rgb(3 7 18 / 0.4)',
                scale: isDragging ? 1.05 : 1,
              }}
              whileHover={{ scale: 1.02 }}
            >
              {originalImage ? (
                <img src={originalImage.src} alt="Original" className="max-h-full max-w-full object-contain rounded-md" />
              ) : (
                <div className="text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none">
                  <Icon name="image" className="w-16 h-16 mx-auto mb-4 text-slate-600 group-hover:text-blue-500 transition-colors duration-300" />
                  <p className="font-semibold text-slate-300">Click to upload an image</p>
                  <p className="text-xs mt-1">or drag and drop</p>
                </div>
              )}
            </motion.div>
             <input ref={fileInputRef} id="bg-file-upload" type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" className="hidden" onChange={handleImageChange} />
             <motion.button onClick={removeBackground} disabled={!originalImage || isLoading} whileHover={{scale: !originalImage || isLoading ? 1 : 1.05}} whileTap={{scale: !originalImage || isLoading ? 1 : 0.98}} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Icon name="sparkles" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Processing...' : 'Remove Background'}
            </motion.button>
             {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </div>

          <div className="space-y-4">
            <div className="w-full aspect-square bg-slate-950/50 rounded-lg flex items-center justify-center border border-slate-700/80 p-2 relative overflow-hidden" style={{ backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADBJREFUOE9jfPbs2X8GPEBTIBg1MApkwMJo2kwDsmBq8DMwCgA4UAsj2cSoAAYAz4p/4zG2lSgAAAAASUVORK5CYII=)'}}>
               <AnimatePresence mode="wait">
                 {isLoading && (
                  <motion.div key="loader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                    <Loader text="Analyzing image..." />
                  </motion.div>
                 )}
                 {hasResult && (
                   <motion.img key="result" src={processedImageUrl} alt="Processed" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{duration: 0.5}} className="max-h-full max-w-full object-contain" />
                 )}
                 {!isLoading && !hasResult && (
                    <motion.div key="placeholder" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="text-center text-slate-500 p-8">
                      <Icon name="background" className="mx-auto h-12 w-12 text-slate-600 animate-subtle-pulse"/>
                      <p>Result will appear here</p>
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
            <AnimatePresence>
              {hasResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                      <label htmlFor="bg-color" className="text-sm font-medium text-slate-300">BG:</label>
                      <div className="p-1 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-600 transition">
                        <input type="color" id="bg-color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 appearance-none bg-transparent border-none cursor-pointer" style={{'backgroundColor': 'transparent'}}/>
                      </div>
                      <button onClick={() => setBgColor('#FFFFFF')} className="px-3 py-1.5 border border-slate-600 rounded-md text-sm text-slate-300 hover:bg-slate-700 transition-colors">White</button>
                      <button onClick={() => setBgColor('#000000')} className="px-3 py-1.5 border border-slate-600 rounded-md text-sm text-slate-300 hover:bg-slate-700 transition-colors">Black</button>
                  </div>
                  <motion.button onClick={downloadImage} whileHover={{scale: 1.05}} whileTap={{scale:0.98}} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <Icon name="download" className="w-5 h-5" /> Download
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </PageWrapper>
  );
};

export default BackgroundRemover;
