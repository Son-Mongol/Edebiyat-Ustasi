export enum GameMode {
  MATCHING = 'MATCHING',
  TRUE_FALSE = 'TRUE_FALSE',
  WORD_HUNT = 'WORD_HUNT',
  PERIOD_QUIZ = 'PERIOD_QUIZ',
  SPY_CARD = 'SPY_CARD',
  SHADOW_AUTHOR = 'SHADOW_AUTHOR',
  INK_BLOT = 'INK_BLOT'
}

export type ThemeType = 'THEME' | 'AVATAR' | 'TITLE';

export interface Theme {
  id: string;
  type: 'THEME';
  name: string;
  cost: number;
  description: string;
  colors: {
    bgGradient: string;
    surface: string;
    surfaceBorder: string;
    text: string;
    textSecondary: string;
    accent: string;
    button: string;
    cardBack: string;
    cardFront: string;
  };
}

export interface AvatarItem {
  id: string;
  name: string;
  iconName: string;
  cost: number;
  type: 'AVATAR';
}

export interface TitleItem {
  id: string;
  name: string;
  cost: number;
  type: 'TITLE';
}

export type ShopItem = Theme | AvatarItem | TitleItem;

export interface AuthorWorkPair {
  author: string;
  work: string;
  period: string;
  clue: string;
}

export interface CardItem {
  id: string;
  content: string;
  type: 'AUTHOR' | 'WORK';
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface UserSettings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
}

export interface UserState {
  points: number;
  ownedThemes: string[];
  ownedAvatars: string[];
  ownedTitles: string[];
  currentThemeId: string;
  currentAvatarId: string;
  currentTitleId: string;
  settings: UserSettings;
  lastLoginDate: string;
  loginStreak: number;
  freezeCount: number;
  frozenDates: string[];
  favorites: string[];
  gameHistory: any[];
  highScores: {
    [key in GameMode]: number;
  };
}