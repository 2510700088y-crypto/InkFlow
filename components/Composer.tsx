import React, { useEffect, useRef, useState } from 'react';
import { Download, Move, Trash2, RefreshCcw } from 'lucide-react';

interface ComposerProps {
  photoUrl: string;
  signatureUrl: string;
  onReset: () => void;
}

const Composer: React.FC<ComposerProps> = ({ photoUrl, signatureUrl, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  
  // Signature state
  const [sigState, setSigState] = useState({
    x: 0.5, // Percent 0-1
    y: 0.5, // Percent 0-1
    scale: 0.4,
    rotation: 0
  });

  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [sigImage, setSigImage] = useState<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      setIsProcessing(true);
      try {
        const bg = new Image();
        bg.crossOrigin = "anonymous";
        bg.src = photoUrl;
        await new Promise((resolve) => { bg.onload = resolve; });

        const sig = new Image();
        sig.crossOrigin = "anonymous";
        sig.src = signatureUrl;
        await new Promise((resolve) => { sig.onload = resolve; });

        setBgImage(bg);
        setSigImage(sig);
      } catch (e) {
        console.error("Failed to load images", e);
      } finally {
        setIsProcessing(false);
      }
    };
    loadImages();
  }, [photoUrl, signatureUrl]);

  // Draw Canvas
  useEffect(() => {
    if (!canvasRef.current || !bgImage || !sigImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MAX_DIM = 2048;
    let width = bgImage.naturalWidth;
    let height = bgImage.naturalHeight;

    if (width > MAX_DIM || height > MAX_DIM) {
      const ratio = width / height;
      if (width > height) {
        width = MAX_DIM;
        height = MAX_DIM / ratio;
      } else {
        height = MAX_DIM;
        width = MAX_DIM * ratio;
      }
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(bgImage, 0, 0, width, height);

    // 2. Draw Signature
    ctx.save();
    
    // Position
    const sigW = sigImage.naturalWidth * sigState.scale;
    const sigH = sigImage.naturalHeight * sigState.scale;
    
    // Convert relative coordinates to pixels
    const px = width * sigState.x;
    const py = height * sigState.y;

    ctx.translate(px, py);
    ctx.rotate(sigState.rotation);
    
    // KEY: Multiply blend mode makes white transparent and keeps black ink
    ctx.globalCompositeOperation = 'multiply';
    
    ctx.drawImage(sigImage, -sigW / 2, -sigH / 2, sigW, sigH);
    ctx.restore();

  }, [bgImage, sigImage, sigState]);

  // Touch/Mouse Handling
  const interactionRef = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    interactionRef.current.isDragging = true;
    interactionRef.current.lastX = e.clientX;
    interactionRef.current.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactionRef.current.isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const deltaX = e.clientX - interactionRef.current.lastX;
    const deltaY = e.clientY - interactionRef.current.lastY;
    
    setSigState(prev => ({
      ...prev,
      x: prev.x + (deltaX / rect.width),
      y: prev.y + (deltaY / rect.height)
    }));

    interactionRef.current.lastX = e.clientX;
    interactionRef.current.lastY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    interactionRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `inkflow-signature-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-4">
        <button onClick={onReset} className="p-2 text-stone-500 hover:text-red-500 transition-colors" title="重新开始">
          <Trash2 size={24} />
        </button>
        <div className="text-stone-400 text-sm flex items-center space-x-1">
            <Move size={14}/> <span>拖动以调整位置</span>
        </div>
        <button 
          onClick={handleDownload}
          className="bg-stone-900 text-white px-6 py-2 rounded-full flex items-center space-x-2 shadow-lg hover:bg-stone-800 transition-all active:scale-95"
        >
          <Download size={18} />
          <span>保存图片</span>
        </button>
      </div>

      <div className="flex-1 relative bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 shadow-inner flex items-center justify-center m-2">
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <RefreshCcw className="animate-spin text-stone-400" />
          </div>
        )}
        
        <div className="relative w-full h-full p-4 flex items-center justify-center">
            <canvas 
                ref={canvasRef}
                className="max-w-full max-h-full shadow-2xl object-contain cursor-move touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            />
        </div>
      </div>

      <div className="h-24 bg-white border-t border-stone-200 p-4 flex items-center justify-center space-x-8">
        <div className="flex flex-col items-center w-1/3">
           <label className="text-xs text-stone-500 mb-1 font-medium">大小</label>
           <input 
             type="range" 
             min="0.1" 
             max="1.5" 
             step="0.05" 
             value={sigState.scale}
             onChange={(e) => setSigState(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
             className="w-full accent-stone-800"
           />
        </div>
        <div className="flex flex-col items-center w-1/3">
           <label className="text-xs text-stone-500 mb-1 font-medium">旋转</label>
           <input 
             type="range" 
             min="-3.14" 
             max="3.14" 
             step="0.1" 
             value={sigState.rotation}
             onChange={(e) => setSigState(prev => ({ ...prev, rotation: parseFloat(e.target.value) }))}
             className="w-full accent-stone-800"
           />
        </div>
      </div>
    </div>
  );
};

export default Composer;