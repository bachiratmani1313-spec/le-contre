export type Section = 'intro' | 'world' | 'geopolitics' | 'weather' | 'europe' | 'finance' | 'ai';

export interface SectionData {
  title: string;
  summary: string;
  content: string;
  truthContent: string;
  physicalFacts: string;
  strategicAdvice: {
    action: string;
    details: string;
  };
  audio: string | null;
  image: string | null;
}
