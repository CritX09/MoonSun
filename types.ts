export enum AppTheme {
  SUNSHINE = 'sunshine',
  MOONLIGHT = 'moonlight',
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface AutomationScript {
  title: string;
  description: string;
  code: string;
  language: 'batch' | 'powershell' | 'bash' | 'json';
}

export interface NetworkStats {
  timestamp: string;
  latency: number;
  bitrate: number;
}
