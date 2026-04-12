import type { SoundEventKey } from './sound';

export interface LessonContent {
  intro:          string;           // One-sentence hook
  steps:          LessonStep[];     // 4–6 steps, each ~30 seconds
  tip:            string;           // Pro tip at the end
  relatedLessons: string[];         // Lesson slugs (2–3)
}

export interface LessonStep {
  stepNumber:       number;
  title:            string;         // Short verb phrase
  instruction:      string;         // What the user does
  highlightEngine:  string;         // e.g. "chromadesk", "glowkit"
  highlightElement: string;         // CSS selector to spotlight
  animationHint:    'pulse' | 'zoom_to' | 'slide_in' | 'none';
  beforeValue?:     number;
  afterValue?:      number;
  soundEvent?:      SoundEventKey;
  image?:           string;
}

export type SkillLevel   = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';
export type LessonStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type AcademyLevel = 'BEGINNER' | 'APPRENTICE' | 'PROFESSIONAL' | 'MASTER' | 'LEGEND';

export interface CoachTip {
  headline: string;
  body:     string;
  lessonSlug: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}
