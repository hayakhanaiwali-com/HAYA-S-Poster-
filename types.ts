export enum PosterFont {
  MODERN = 'font-modern',
  DISPLAY = 'font-display',
  SERIF = 'font-serif',
  HANDWRITTEN = 'font-handwritten',
  CLASSIC = 'font-classic',
}

export enum PosterLayout {
  CENTERED = 'centered',
  BOTTOM_HEAVY = 'bottom-heavy',
  TOP_HEAVY = 'top-heavy',
  SPLIT = 'split'
}

export interface PosterConfig {
  imagePrompt: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  fontStyle: PosterFont;
  layout: PosterLayout;
  moodDescription: string;
}

export interface GeneratedPosterState {
  config: PosterConfig | null;
  backgroundImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  step: 'idle' | 'analyzing' | 'generating_image' | 'complete';
}