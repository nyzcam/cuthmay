export enum AppPhase {
  LOADING = 'LOADING',
  EXITING = 'EXITING',
  COMPLETE = 'COMPLETE'
}

export interface WelcomeData {
  message: string;
  version: string;
  timestamp: string;
}

export interface LoadingState {
  progress: number; // 0 to 100
  phase: AppPhase;
  statusMessage: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: 'ring' | 'users' | 'scissors' | 'music' | 'camera' | 'utensils' | 'heart' | 'moon' | 'sun';
  session?: 'morning' | 'evening';
}
