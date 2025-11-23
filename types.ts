export enum CalligraphyStyle {
  RunningScript = '行书 (Running)',
  Cursive = '草书 (Cursive)',
  Regular = '楷书 (Regular)',
  Clerical = '隶书 (Clerical)',
  Artistic = '现代艺术 (Artistic)'
}

export interface GeneratedSignature {
  id: string;
  url: string;
  name: string;
  style: CalligraphyStyle;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export enum AppStep {
  UploadPhoto = 0,
  GenerateSignature = 1,
  CompositeAndSave = 2
}

declare global {
  interface Window {
    // Extend window if needed for custom props
  }
}