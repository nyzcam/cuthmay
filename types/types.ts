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

export interface GuestCommentInput {
  guestSlug: string;
  guestName: string;
  pagePath: string;
  comment: string;
}

export interface GuestCommentRecord extends GuestCommentInput {
  id: string;
  createdAt: string;
  source: 'invite' | 'admin' | 'seed';
  status: 'new' | 'reviewed' | 'archived';
}
