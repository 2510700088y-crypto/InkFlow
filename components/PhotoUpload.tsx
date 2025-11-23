import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPhotoSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPhotoSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in px-4">
      <h2 className="text-2xl font-serif text-stone-800 mb-2">上传粉丝照片</h2>
      <p className="text-stone-500 mb-8 text-center max-w-md">
        选择一张照片开始创作，支持相册导入或直接拍摄。
      </p>

      <div
        className="relative group w-full max-w-lg aspect-[4/3] bg-white rounded-3xl border-2 border-dashed border-stone-300 hover:border-stone-800 transition-colors cursor-pointer flex flex-col items-center justify-center shadow-sm hover:shadow-md"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="p-4 bg-stone-50 rounded-full mb-4 group-hover:bg-stone-100 transition-colors">
          <Upload className="w-8 h-8 text-stone-600" />
        </div>
        <span className="text-lg font-medium text-stone-700">点击上传照片</span>
        <span className="text-sm text-stone-400 mt-2">或将图片拖拽至此</span>
        
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      <div className="mt-8">
        <button 
          onClick={async () => {
             // 演示用：使用随机图片
             const response = await fetch("https://picsum.photos/800/600");
             const blob = await response.blob();
             const file = new File([blob], "sample.jpg", { type: "image/jpeg" });
             onPhotoSelected(file);
          }}
          className="text-xs text-stone-400 hover:text-stone-800 underline"
        >
          试用随机示例图片
        </button>
      </div>
    </div>
  );
};

export default PhotoUpload;