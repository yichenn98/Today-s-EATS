
export type Category = '早餐' | '午餐' | '晚餐' | '飲料/零食/宵夜';

export interface MealRecord {
  id: string;
  date: string; // ISO format (YYYY-MM-DD)
  category: Category;
  shopName: string;
  mealName: string;
  price: number;
  imageUrl?: string; // base64
}

export interface User {
  name: string;
  avatar: string;
  email?: string;
  provider?: 'google' | 'line';
}

export type ViewType = 'records' | 'stats' | 'wheel';
