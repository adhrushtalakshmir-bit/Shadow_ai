import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileImage, FileText, CheckCircle, ShieldCheck, File, X, Loader2, Sparkles } from 'lucide-react';
import { ocrService } from '../../services/ocr';
import DetectionBox from '../Chat/DetectionBox';

const ImageScanPanel = ({ onScanStateChange, setLatestResult }) => {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [imgNaturalWidth, setImgNaturalWidth] = useState(1);
  const [imgNaturalHeight, setImgNaturalHeight] = useState(1);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setError(null);
    setResult(null);
    
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG, PNG, or PDF file.");
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); 
    }
  };

  const handleImageLoad = (e) => {
    setImgNaturalWidth(e.target.naturalWidth || 1);
    setImgNaturalHeight(e.target.naturalHeight || 1);
  };

  const clearSelection = () => {
    setFile(null);
    setPrompt('');
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a custom prompt.");
      return;
    }
    
    setIsScanning(true);
    setError(null);
    onScanStateChange(true);
    
    try {
      const response = await ocrService.analyzeFile(file, prompt);
      setResult(response);
      
      // Map for RightPanel
      const mappedResult = {
        isSafe: response.risk_score < 50,
        riskScore: response.risk_score,
        entities: response.detected_entities.map(e => ({
          entity_type: e.category,
          value: e.value
        })),
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
      };
      setLatestResult(mappedResult);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during OCR scanning.");
    } finally {
      setIsScanning(false);
      onScanStateChange(false);
    }
  };

  const formatDetectionForBox = (apiResult) => {
    return {
      riskScore: apiResult.risk_score,
      message: `Confidence Score: ${Math.round(apiResult.confidence_score)}%`,
      detectedEntities: (apiResult.detected_entities || []).map(e => ({
        label: e.category.replace(/_/g, ' '),
        tagClass: 'tag-' + (e.category || 'unknown').toLowerCase()
      })),
      sanitizedPrompt: []
    };
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto">
      <div className="sticky top-0 z-10 glass border-b border-slate-800/60 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-100">Enterprise Intelligent OCR</h2>
        <p className="text-xs text-slate-400">Combined Image Analysis + NLP Semantic Detection.</p>
      </div>

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Zone */}
        {!file && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px]
              ${isDragging ? 'border-blue-500 bg-blue-900/30' : 'border-slate-700 bg-slate-900 hover:border-blue-500/50 hover:bg-slate-800'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-blue-900/40 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Upload Mixed-Layout Document or Screenshot</h3>
            <p className="text-sm text-slate-400 mb-6">Supports low-quality JPG/PNG or PDF up to 10MB</p>
            <button className="bg-slate-800 border border-slate-700 text-slate-300 font-medium py-2 px-6 rounded-xl hover:bg-slate-700 shadow-sm transition-all">
              Browse Files
            </button>
          </motion.div>
        )}

        {/* Selected File & Prompt Entry */}
        {file && !result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-slate-700/50 rounded-3xl p-6 shadow-glass-sm flex flex-col items-center"
          >
            <div className="w-full max-w-2xl flex flex-col gap-4">
              
              <div className="relative group w-full flex justify-center">
                <button 
                  onClick={clearSelection}
                  className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center shadow-md hover:text-red-500 hover:border-red-200 transition-colors"
                >
                  <X size={16} />
                </button>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-[250px] object-contain rounded-xl border border-slate-700/50 shadow-sm" />
                ) : (
                  <div className="w-full max-w-sm h-[200px] bg-slate-800 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center">
                    <File className="w-12 h-12 text-slate-500 mb-2" />
                    <span className="text-slate-300 font-medium">{file.name}</span>
                  </div>
                )}
              </div>

              <div className="w-full mt-4">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Custom AI Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Summarize this document, Extract key insights, Explain sensitive data found..."
                  className="w-full p-4 border border-slate-700 bg-slate-800/50 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px] resize-none"
                />
              </div>

              <button 
                onClick={handleScan}
                disabled={isScanning || !prompt.trim()}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-semibold shadow-premium transition-all
                  ${(isScanning || !prompt.trim())
                    ? 'bg-slate-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5'}`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    OpenCV Preprocessing & AI NER Scanning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Scan & Analyze with Shadow AI
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 w-full"
          >
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-100">Analysis Results</h3>
                <button 
                  onClick={clearSelection}
                  className="text-sm font-medium bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-blue-400 hover:bg-slate-700 transition"
                >
                  Start New Scan
                </button>
             </div>

             {/* AI Response Block */}
             <div className="glass border border-purple-500/30 rounded-2xl p-6 shadow-glass-sm bg-gradient-to-br from-purple-900/20 to-slate-900">
                <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Gemini AI Response
                </h4>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {result.llm_response}
                </div>
             </div>

             {/* Side by Side Image BBox and Masked Output */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Image with BBoxes */}
                <div className="glass border border-slate-700/50 rounded-2xl p-5 shadow-glass-sm flex flex-col">
                  <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2"><FileImage className="w-4 h-4 text-slate-500" /> Source Document</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${result.risk_score > 50 ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                      Risk Score: {result.risk_score}
                    </span>
                  </h4>
                  <div className="flex-1 bg-slate-800/50 rounded-xl flex items-center justify-center p-2 overflow-hidden relative">
                    {previewUrl ? (
                      <div className="relative inline-block">
                        <img 
                          src={previewUrl} 
                          alt="Analyzed Document" 
                          onLoad={handleImageLoad}
                          className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm block" 
                        />
                        {/* Overlay Bounding Boxes */}
                        {result.detected_entities.map((e, idx) => {
                          if (!e.box) return null;
                          const left = (e.box.x / imgNaturalWidth) * 100;
                          const top = (e.box.y / imgNaturalHeight) * 100;
                          const width = (e.box.w / imgNaturalWidth) * 100;
                          const height = (e.box.h / imgNaturalHeight) * 100;
                          
                          return (
                            <div 
                              key={idx}
                              title={e.category}
                              className="absolute border-2 border-red-500 bg-red-500/20 rounded-sm"
                              style={{
                                left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`
                              }}
                            ></div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-10 text-slate-500 text-sm">PDF Preview not available</div>
                    )}
                  </div>
                </div>

                {/* Sanitized Output */}
                <div className="glass border border-emerald-500/30 rounded-2xl p-5 shadow-glass-sm flex flex-col bg-emerald-900/10">
                  <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sanitized OCR Extraction
                  </h4>
                  <div className="flex-1 bg-slate-800/50 border border-emerald-900/30 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono h-[400px] overflow-y-auto shadow-inner">
                    {result.sanitized_text || <span className="text-slate-500 italic">No text found.</span>}
                  </div>
                </div>
             </div>

             {/* Re-use existing Detection Box logic */}
             <div className="mt-4">
                <DetectionBox detection={formatDetectionForBox(result)} />
             </div>
             
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImageScanPanel;
