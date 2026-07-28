import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SettingsState {
  studentName: string;
  theme: 'Dark' | 'Light' | 'System';
  accentColor: 'Sky' | 'Emerald' | 'Indigo' | 'Amber';
  fontSize: 'Small' | 'Medium' | 'Large';
  compactMode: boolean;
  enableAnimations: boolean;
  learningMode: 'Beginner' | 'Intermediate' | 'Advanced';
  showStepByStep: boolean;
  autoExpandPipelines: boolean;
  displayBackendDetails: boolean;
  showTooltips: boolean;
  showTechnicalTerms: boolean;
  showEducationalTips: boolean;
  demoMode: boolean;
  autoPlayAnimations: boolean;
  highlightActivePipeline: boolean;
  slowAnimationSpeed: boolean;
  hideAdvancedDetails: boolean;
  notifyReminders: boolean;
  notifyQuizReview: boolean;
  notifyPlatformUpdates: boolean;
  defaultLandingRoute: string;
  rememberSidebarState: boolean;
  isSidebarCollapsed: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  quizScores: Record<string, number>;
}

const DEFAULT_SETTINGS: SettingsState = {
  studentName: 'Alex Rivera',
  theme: 'Dark',
  accentColor: 'Sky',
  fontSize: 'Medium',
  compactMode: false,
  enableAnimations: true,
  learningMode: 'Advanced',
  showStepByStep: true,
  autoExpandPipelines: true,
  displayBackendDetails: true,
  showTooltips: true,
  showTechnicalTerms: true,
  showEducationalTips: true,
  demoMode: false,
  autoPlayAnimations: true,
  highlightActivePipeline: true,
  slowAnimationSpeed: false,
  hideAdvancedDetails: false,
  notifyReminders: true,
  notifyQuizReview: true,
  notifyPlatformUpdates: true,
  defaultLandingRoute: '/architecture',
  rememberSidebarState: true,
  isSidebarCollapsed: false,
  highContrast: false,
  reduceMotion: false,
  quizScores: {},
};

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (partial: Partial<SettingsState>) => void;
  resetPreferences: () => void;
  resetQuizScores: () => void;
  exportProgress: () => void;
  toggleSidebar: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'genai_vision_studio_settings_v1';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Memory fallback
    }

    // Apply root DOM attributes dynamically
    const root = document.documentElement;

    // Theme Class
    if (settings.theme === 'Light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    // Accent Color attribute
    root.setAttribute('data-accent', settings.accentColor.toLowerCase());

    // Font Size attribute & class
    root.setAttribute('data-font-size', settings.fontSize.toLowerCase());
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${settings.fontSize.toLowerCase()}`);

    // High Contrast attribute
    if (settings.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Compact Mode attribute
    if (settings.compactMode) {
      root.setAttribute('data-compact-mode', 'true');
    } else {
      root.removeAttribute('data-compact-mode');
    }

    // Reduce Motion attribute
    if (settings.reduceMotion || !settings.enableAnimations) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }
  }, [settings]);

  const updateSettings = (partial: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetPreferences = () => {
    setSettings((prev) => ({
      ...DEFAULT_SETTINGS,
      studentName: prev.studentName,
      quizScores: prev.quizScores,
    }));
  };

  const resetQuizScores = () => {
    setSettings((prev) => ({
      ...prev,
      quizScores: {},
    }));
  };

  const toggleSidebar = () => {
    setSettings((prev) => ({
      ...prev,
      isSidebarCollapsed: !prev.isSidebarCollapsed,
    }));
  };

  const exportProgress = () => {
    const data = {
      studentName: settings.studentName,
      learningProgress: '84%',
      modulesCompleted: 7,
      quizScores: settings.quizScores,
      exportTimestamp: new Date().toISOString(),
      activePreferences: settings,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.href = jsonStr;
    link.download = `GenAI_Vision_Studio_Progress_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetPreferences,
        resetQuizScores,
        exportProgress,
        toggleSidebar,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
