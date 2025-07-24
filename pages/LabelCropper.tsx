
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';
import PageWrapper from '../components/PageWrapper';
import { Icon, type IconName } from '../components/Icon';
import Loader from '../components/Loader';


type Platform = 'amazon' | 'flipkart' | 'meesho';

const platformOptions: { value: Platform; label: string; icon: IconName }[] = [
  { value: 'amazon', label: 'Amazon', icon: 'amazon' },
  { value: 'flipkart', label: 'Flipkart', icon: 'flipkart' },
  { value: 'meesho', label: 'Meesho', icon: 'meesho' },
];

const cmToPoints = (cm: number) => cm * (72 / 2.54);

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const StepWrapper: React.FC<{ step: number; title: string; children: React.ReactNode }> = ({ step, title, children }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold text-sm">
                    {step}
                </div>
                <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
};


const LabelCropper: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; pages: number | null } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: Uint8Array; pageCount: number } | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const resetState = (clearFile = true) => {
      setError(null);
      setResult(null);
      setIsLoading(false);
      if (clearFile) {
        setPdfFile(null);
        setFileDetails(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
  };

  const handleFileChange = (file: File | null | undefined) => {
    resetState();
    if (file && file.type === 'application/pdf') {
        setIsDragging(false);
        setPdfFile(file);
        const details = { name: file.name, size: formatBytes(file.size), pages: null };
        setFileDetails(details);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const doc = await PDFDocument.load(event.target?.result as ArrayBuffer);
                setFileDetails({ ...details, pages: doc.getPageCount() });
            } catch (e) {
                setError("Could not read page count from PDF.");
                setFileDetails(null);
            }
        };
        reader.readAsArrayBuffer(file);

    } else if (file) {
        setError('Invalid file type. Please upload a PDF.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); handleFileChange(e.dataTransfer.files?.[0]); };

  const cropPdf = useCallback(async () => {
    if (!pdfFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        await new Promise(res => setTimeout(res, 500)); // simulate network delay
        const fileBytes = await pdfFile.arrayBuffer();
        const srcDoc = await PDFDocument.load(fileBytes);
        const newDoc = await PDFDocument.create();

        if (platform === 'amazon') {
            const pageIndices = srcDoc.getPageIndices().filter((_, i) => (i + 1) % 2 !== 0);
            if (pageIndices.length > 0) {
                const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
                copiedPages.forEach(page => newDoc.addPage(page));
            }
        } else {
            const margins = {
                flipkart: { top: 0.93, left: 6.63, width: 7.73, height: 12.60 },
                meesho: { top: 0.34, left: 0.34, width: 20.30, height: 12.71 }
            };
            const config = margins[platform];
            const pages = srcDoc.getPages();
            for (const [i, page] of pages.entries()) {
                const { height, width } = page.getSize();
                const newPage = newDoc.addPage([cmToPoints(config.width), cmToPoints(config.height)]);
                const [embeddedPage] = await newDoc.embedPdf(srcDoc, [i]);
                newPage.drawPage(embeddedPage, {
                    x: -cmToPoints(config.left),
                    y: -(height - cmToPoints(config.top) - cmToPoints(config.height)),
                    width,
                    height,
                });
            }
        }
        
        const pageCount = newDoc.getPageCount();
        if (pageCount === 0) {
            setError("No pages were generated. Please check your PDF file and the selected platform's logic.");
        } else {
            const pdfBytes = await newDoc.save();
            setResult({ data: pdfBytes, pageCount });
        }
    } catch (err) {
        console.error('Error processing PDF:', err);
        setError('Failed to crop the PDF. It might be corrupted, password-protected, or invalid.');
    } finally {
        setIsLoading(false);
    }
  }, [pdfFile, platform]);

  const downloadPdf = () => {
    if (!result) return;
    const blob = new Blob([result.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
a.download = `Ecomly-${fileDetails?.name || 'labels'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const selectedPlatformInfo = platformOptions.find(p => p.value === platform);
  
  return (
    <PageWrapper
      title="Shipping Label Cropper"
      description="Optimize your shipping labels. Select your platform, upload a PDF, and get a print-ready file in seconds."
    >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* --- Left Column --- */}
            <div className="md:col-span-3 flex flex-col gap-8">
                <StepWrapper step={1} title="Choose Platform">
                    <div className="relative" ref={dropdownRef}>
                        <motion.button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="relative w-full flex items-center justify-between p-4 bg-slate-900/70 border border-slate-700/80 rounded-lg text-left transition-colors hover:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-3">
                                <Icon name={selectedPlatformInfo!.icon} className="w-6 h-6 text-blue-400" />
                                <span className="text-slate-100 font-medium">{selectedPlatformInfo!.label}</span>
                            </div>
                            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                                <Icon name="chevron-down" className="w-5 h-5 text-slate-400" />
                            </motion.div>
                        </motion.button>
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                                >
                                    {platformOptions.map(opt => (
                                        <li key={opt.value}>
                                            <button onClick={() => { setPlatform(opt.value); setIsDropdownOpen(false); resetState(false); }} className="w-full flex items-center gap-3 p-3 text-left hover:bg-blue-500/10 transition-colors">
                                                <Icon name={opt.icon} className="w-6 h-6 text-slate-400" />
                                                <span className="text-slate-200">{opt.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                </StepWrapper>

                <StepWrapper step={2} title="Upload PDF">
                    <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFileChange(e.target.files?.[0])} />
                     <div
                        onClick={() => !fileDetails && fileInputRef.current?.click()}
                        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                        className="bg-slate-900/70 border border-slate-700/80 rounded-lg p-2 min-h-[10rem] flex items-center justify-center transition-colors"
                        style={{ cursor: fileDetails ? 'default' : 'pointer' }}
                    >
                        <AnimatePresence mode="wait">
                            {fileDetails ? (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full flex justify-between items-center bg-slate-800/50 rounded-md p-4"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Icon name="file-pdf" className="w-8 h-8 text-green-400 flex-shrink-0" />
                                        <div className="truncate">
                                            <p className="font-semibold text-slate-100 truncate" title={fileDetails.name}>{fileDetails.name}</p>
                                            <p className="text-xs text-slate-400">
                                                {fileDetails.size} {fileDetails.pages !== null ? `• ${fileDetails.pages} pages` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button onClick={() => resetState()} className="p-2 rounded-full text-slate-500 hover:bg-slate-700/50 hover:text-white transition-colors" whileTap={{ scale: 0.9 }}>
                                        <Icon name="trash" className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 text-center transition-colors hover:border-slate-600 hover:bg-slate-800/20"
                                    style={{ borderColor: isDragging ? 'rgb(59 130 246)' : 'rgb(55 65 81)' }}
                                >
                                    <Icon name="upload" className="w-10 h-10 text-slate-500 mb-2" />
                                    <p className="font-semibold text-slate-300">Drag & drop or click to upload</p>
                                    <p className="text-xs text-slate-500 mt-1">PDF file only</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </StepWrapper>
                
                <div className="mt-2">
                    <motion.button
                        onClick={cropPdf}
                        disabled={!pdfFile || isLoading}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 font-bold text-white rounded-lg transition-all duration-300 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 shadow-lg hover:shadow-blue-500/20"
                        whileHover={{ scale: (!pdfFile || isLoading) ? 1 : 1.03 }}
                        whileTap={{ scale: (!pdfFile || isLoading) ? 1 : 0.98 }}
                    >
                         <Icon name="crop" className={`w-5 h-5 transition-transform ${isLoading ? 'animate-spin' : ''}`} />
                         {isLoading ? 'Processing...' : 'Crop & Generate'}
                    </motion.button>
                </div>
            </div>

            {/* --- Right Column --- */}
            <div className="md:col-span-2">
                <div className="sticky top-24 space-y-4">
                     <h3 className="text-xl font-semibold text-slate-200">Output</h3>
                     <div className="relative min-h-[20rem] bg-slate-900/50 backdrop-blur-sm border border-slate-800/60 rounded-xl flex items-center justify-center p-6 text-center">
                        <AnimatePresence mode="wait">
                            {isLoading && (
                                <motion.div key="loader" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                    <Loader text="Generating your PDF..." />
                                </motion.div>
                            )}
                            {error && !isLoading && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="w-full flex flex-col items-center gap-3 text-red-300"
                                >
                                    <Icon name="alert-triangle" className="w-10 h-10" />
                                    <p className="font-semibold">An Error Occurred</p>
                                    <p className="text-sm">{error}</p>
                                </motion.div>
                            )}
                            {result && !isLoading && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="w-full flex flex-col items-center gap-2"
                                >
                                    <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/20">
                                        <Icon name="check-circle" className="w-7 h-7"/>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-100 mt-2">Success!</h3>
                                    <p className="text-slate-400 text-sm mt-1 mb-4">Generated {result.pageCount} cropped {result.pageCount === 1 ? 'label' : 'labels'}.</p>
                                    <motion.button
                                        onClick={downloadPdf}
                                        className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 mx-auto shadow-lg hover:shadow-green-500/20"
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon name="download" className="w-5 h-5"/>
                                        Download PDF
                                    </motion.button>
                                </motion.div>
                            )}
                            {!isLoading && !error && !result && (
                                <motion.div key="placeholder" initial={{opacity:0}} animate={{opacity:1, transition:{delay:0.2}}} exit={{opacity:0}} className="text-slate-500">
                                    <Icon name="file-pdf" className="w-12 h-12 mx-auto mb-4 animate-subtle-pulse"/>
                                    <h3 className="font-semibold text-slate-400">Your cropped file will appear here</h3>
                                    <p className="text-sm mt-1">Complete the steps on the left to get started.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                     </div>
                </div>
            </div>
        </div>
    </PageWrapper>
  );
};

export default LabelCropper;
