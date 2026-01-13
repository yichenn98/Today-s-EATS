
import React from 'react';
import { Sandwich, Sun, Moon, CupSoda } from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Category[] = ['早餐', '午餐', '晚餐', '飲料/零食/宵夜'];

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  '早餐': <Sandwich className="w-5 h-5" />,
  '午餐': <Sun className="w-5 h-5" />,
  '晚餐': <Moon className="w-5 h-5" />,
  '飲料/零食/宵夜': <CupSoda className="w-5 h-5" />
};

export const CATEGORY_COLORS: Record<Category, string> = {
  '早餐': '#D5A6A3', // Morandi Dusty Rose
  '午餐': '#ABB6A4', // Morandi Sage
  '晚餐': '#9DA8B5', // Morandi Slate Blue
  '飲料/零食/宵夜': '#B8A7B5' // Morandi Grayish Purple
};

export const MORANDI_PRIMARY = '#5D6D7E';
export const MORANDI_BG = '#F2F0EB';
export const MORANDI_SURFACE = '#E5DCD3';
