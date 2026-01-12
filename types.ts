
export interface Persona {
  id: string;
  jobField: string;
  title: string;
  bio: string;
  skills: string[];
  personality: string;
  imageUrl: string;
  isGenerating?: boolean;
}

export interface CareerOption {
  field: string;
  icon: string;
  prompt: string;
}

export enum AppState {
  PRD = 'PRD',
  UPLOAD = 'UPLOAD',
  REFINEMENT = 'REFINEMENT',
  GENERATING = 'GENERATING',
  VIEWER = 'VIEWER'
}
