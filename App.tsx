import React, { useState, useEffect } from 'react';
import StepIndicator from './components/StepIndicator';
import PhotoUpload from './components/PhotoUpload';
import SignatureGenerator from './components/SignatureGenerator';
import Composer from './components/Composer';
import { AppStep } from './types';
import { Feather, Settings, Download, X, Share, PlusSquare, Save } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UploadPhoto);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(true);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Load settings from local storage
    const storedKey = localStorage.getItem('INKFLOW_API_KEY');
    const storedUrl = localStorage.getItem('INKFLOW_BASE_URL');
    if (storedKey) setApiKey(storedKey);
    if (storedUrl) setBaseUrl(storedUrl);

    // Check standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      setIsStandalone(!!isStandaloneMode);
    };
    checkStandalone();
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('INKFLOW_API_KEY', apiKey);
    localStorage.setItem('INKFLOW_BASE_URL', baseUrl);
    setShowSettings(false);
  };

  const handlePhotoSelected = (file: File) => {
    const url = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoUrl(url);
    setCurrentStep(AppStep.GenerateSignature);
  };

  const handleSignatureGenerated = (url: string) => {
    setSignatureUrl(url);
    setCurrentStep(AppStep.CompositeAndSave);
  };

  const handleReset = () => {
    setSignatureUrl(null);
    setPhotoUrl(null);
    setPhotoFile(null);
    setCurrentStep(AppStep.UploadPhoto);
  };

  const handleBackToPhoto = () => {
    setSignatureUrl(null);
    setCurrentStep(AppStep.UploadPhoto);
  }

  return (
    <div className="min-h-screen bg-paper text-stone-900 font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 pt-[env(safe-area-inset-top)] transition-all duration-300">
        <div className="h-16 flex items-center px-6 justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <div className="bg-stone-900 p-2 rounded-lg text-white">
              <Feather size={20} />
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-stone-800">InkFlow <span className="text-stone-400 font-normal text-sm">墨韵</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
              {!isStandalone && (
                <button 
                  onClick={() => setShowInstallModal(true)}
                  className="hidden md:flex items-center gap-2 text-xs font-medium bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full hover:bg-stone-200 transition-colors"
                >
                  <Download size={12} />
                  <span>安装 App</span>
                </button>
              )}

              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
              >
                <Settings size={20} />
              </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[calc(5rem+env(safe-area-inset-top))] pb-6 px-4 h-screen flex flex-col max-w-5xl mx-auto">
        <StepIndicator currentStep={currentStep} />
        
        <div className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden relative">
          
          {/* Step 1: Upload */}
          {currentStep === AppStep.UploadPhoto && (
            <PhotoUpload onPhotoSelected={handlePhotoSelected} />
          )}

          {/* Step 2: Generate */}
          {currentStep === AppStep.GenerateSignature && (
            <div className="h-full flex flex-col justify-center animate-fade-in-up">
              <SignatureGenerator 
                onSignatureGenerated={handleSignatureGenerated}
                onBack={handleBackToPhoto}
              />
            </div>
          )}

          {/* Step 3: Composite */}
          {currentStep === AppStep.CompositeAndSave && photoUrl && signatureUrl && (
            <div className="h-full animate-fade-in">
              <Composer 
                photoUrl={photoUrl} 
                signatureUrl={signatureUrl}
                onReset={handleReset}
              />
            </div>
          )}

        </div>
        
        <div className="text-center mt-4 text-xs text-stone-400 select-none pb-[env(safe-area-inset-bottom)]">
          Powered by Gemini • Designed for iPad
        </div>
      </main>

      {/* Settings Modal (Critical for China usage) */}
      {showSettings && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
             <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 p-1">
               <X size={20} />
             </button>
             <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
               <Settings size={20} /> 设置
             </h2>

             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-stone-700 mb-1">Gemini API Key</label>
                 <input 
                   type="password" 
                   value={apiKey}
                   onChange={(e) => setApiKey(e.target.value)}
                   placeholder="输入您的 API Key"
                   className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-800"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-stone-700 mb-1">
                    代理地址 (Base URL)
                    <span className="text-stone-400 font-normal ml-2 text-xs">国内使用必填</span>
                 </label>
                 <input 
                   type="text" 
                   value={baseUrl}
                   onChange={(e) => setBaseUrl(e.target.value)}
                   placeholder="https://..."
                   className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-800"
                 />
                 <p className="text-xs text-stone-400 mt-1">如果不填写，将默认连接 Google 官方服务器。</p>
               </div>

               <button 
                 onClick={handleSaveSettings}
                 className="w-full mt-4 bg-stone-900 text-white py-3 rounded-xl font-medium shadow-lg hover:bg-stone-800 flex justify-center items-center gap-2"
               >
                 <Save size={18} /> 保存配置
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Install Guide Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 relative">
             <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 p-1">
               <X size={20} />
             </button>
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mb-4">
                   <Download size={24} className="text-stone-800"/>
                </div>
                <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">安装到 iPad</h3>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                  为了获得最佳的全屏体验，请将应用添加到主屏幕。
                </p>
                
                <div className="space-y-4 text-left w-full text-sm text-stone-700 bg-stone-50 p-4 rounded-xl">
                   <div className="flex items-start gap-3">
                      <div className="bg-white border border-stone-200 px-2 py-1 rounded text-stone-800 mt-0.5">
                        <Share size={14} />
                      </div>
                      <span>1. 点击 Safari 浏览器右上角的 <span className="font-bold">分享</span> 按钮。</span>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="bg-white border border-stone-200 px-2 py-1 rounded text-stone-800 mt-0.5">
                        <PlusSquare size={14} />
                      </div>
                      <span>2. 向下滑动并选择 <span className="font-bold">添加到主屏幕</span>。</span>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="bg-white border border-stone-200 px-2 py-0.5 rounded text-xs font-bold text-stone-800 mt-0.5">添加</div>
                      <span>3. 点击右上角的 <span className="font-bold">添加</span>。</span>
                   </div>
                </div>
                
                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="mt-6 w-full bg-stone-900 text-white py-3 rounded-xl font-medium shadow-lg active:scale-95 transition-all"
                >
                  知道了
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;