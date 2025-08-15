// src/data/menuItems.ts
import { categories } from './categories';

export const menuItems = [
  { id: 'home', title: 'Trang chủ', icon: 'home' },
  { id: 'separator1', title: '--- Danh mục ---', icon: null },
  ...categories.map(cat => ({ 
    id: cat.id, 
    title: cat.title, 
    icon: cat.icon,
    isCategory: true 
  })),
  { id: 'separator2', title: '--- Khác ---', icon: null },
  { id: 'settings', title: 'Cài đặt', icon: 'settings' },
  { id: 'logout', title: 'Đăng xuất', icon: 'logout' },
];