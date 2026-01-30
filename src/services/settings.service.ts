import { Injectable, signal } from '@angular/core';

export type AiProvider = 'google' | 'local';
export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // --- UI & Theme Settings ---
  theme = signal<Theme>('light'); // Default to light mode

  // --- AI Feature Flags for Journalists ---
  // These flags control the visibility of Gemini features for non-admin users.
  // Admins can see everything, but can toggle them for journalists.
  isChatbotEnabled = signal<boolean>(true);
  isImageAnalysisEnabled = signal<boolean>(true);
  isSearchGroundingEnabled = signal<boolean>(true);
  isQuickSummaryEnabled = signal<boolean>(true);

  // --- "Haqiqa" Module Feature Flags ---
  isHaqiqaDeepfakeDetectionEnabled = signal<boolean>(true);
  isHaqiqaForensicAnalysisEnabled = signal<boolean>(true);

  // --- Low Bandwidth Mode ---
  isLowBandwidthMode = signal<boolean>(false);

  // --- New Feature Flags ---
  isOnboardingEnabled = signal<boolean>(true);
  isDataExportEnabled = signal<boolean>(true);
  isWebRtcEnabled = signal<boolean>(true);

  // --- Global AI Provider Setting ---
  // Admins can switch between Google's powerful cloud AI and a private local AI.
  aiProvider = signal<AiProvider>('google');

  constructor() { }
}
