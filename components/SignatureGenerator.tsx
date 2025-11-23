import React, { useState } from 'react';
import { CalligraphyStyle } from '../types';
import { generateCalligraphy } from '../services/gemini';
import { Sparkles, ArrowRight, Loader2, RotateCcw } from 'lucide-react';

interface SignatureGeneratorProps {
  onSignatureGenerated: (url: string) => void;
  onBack: () => void;
}

const SignatureGenerator: React.FC<SignatureGeneratorProps> = ({ onSignatureGenerated, onBack }) => {
  const [name, setName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<CalligraphyStyle>(CalligraphyStyle.RunningScript);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const imageUrl = await generateCalligraphy(name, selectedStyle);
      onSignatureGenerated(imageUrl);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("API Key")) {
         setError("请先点击右上角设置图标，配置您的 API Key。");
      } else {
         setError("生成失败：" + (err.message || "请检查网络或代理设置"));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-stone-100">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-800 text-sm font-medium transition-colors">
          &larr; 返回照片
        </button>
        <h2 className="text-2xl font-serif text-stone-900">设计签名</h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">粉丝姓名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：李白、张三"
            className="w-full px-4 py-3 text-lg border-2 border-stone-200 rounded-xl focus:border-stone-800 focus:outline-none transition-colors bg-stone-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">书法风格</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(CalligraphyStyle).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-4 py-3 rounded-xl text-left transition-all ${
                  selectedStyle === style
                    ? 'bg-stone-800 text-white shadow-lg scale-[1.02]'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
             {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!name.trim() || isGenerating}
          className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center space-x-2 transition-all ${
            !name.trim() || isGenerating
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-stone-900 text-white shadow-xl hover:bg-stone-800 active:scale-[0.98]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" />
              <span>大师构思中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>生成签名</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SignatureGenerator;