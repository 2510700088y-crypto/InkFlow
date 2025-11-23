import React from 'react';
import { AppStep } from '../types';
import { Camera, PenTool, Download } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.UploadPhoto, label: '上传照片', icon: Camera },
    { id: AppStep.GenerateSignature, label: '设计签名', icon: PenTool },
    { id: AppStep.CompositeAndSave, label: '合成保存', icon: Download },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-sm border border-stone-200">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className={`flex items-center space-x-2 ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>
                <div className={`p-2 rounded-full ${isActive ? 'bg-stone-100' : ''}`}>
                  <Icon size={20} className={isActive ? 'stroke-2' : 'stroke-1'} />
                </div>
                <span className={`text-sm font-medium ${isActive ? 'block' : 'hidden md:block'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-[1px] mx-4 ${isCompleted ? 'bg-stone-800' : 'bg-stone-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;