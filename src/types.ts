export type LogType = 'state' | 'meal' | 'event' | 'sos';

export interface BaseLog {
  id?: string;
  userId: string;
  timestamp: any;
  type: LogType;
}

export interface StateLogData {
  category: 'morning' | 'interval';
  sleepDuration?: number;
  sleepQuality?: number;
  remSleep?: number;
  deepSleep?: number;
  lightSleep?: number;
  rhr?: number;
  energy: number;
  focus: number;
  moodTags: string[];
  gutTags: string[];
}

export interface MealLogData {
  foodSequencing: {
    veggies: boolean;
    protein: boolean;
    carbs: boolean;
  };
  hydrationContext: boolean;
  notes: string;
}

export interface EventLogData {
  title: string;
  intensity: number;
  description: string;
}

export interface SOSLogData {
  issue: string;
  intervention: string;
}

export interface LogEntry extends BaseLog {
  data: StateLogData | MealLogData | EventLogData | SOSLogData;
}

export interface LabResult {
  id?: string;
  userId: string;
  marker: string;
  value: number;
  unit: string;
  date: any;
}

export interface UserProfile {
  email: string;
  displayName: string;
  createdAt: any;
  biomarkerGoals?: Record<string, number>;
  lifestyleGoals?: string[];
  onboardingCompleted?: boolean;
}
