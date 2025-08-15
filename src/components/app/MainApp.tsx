// src/components/app/MainApp.tsx - Main Application Layout
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { HeaderBar } from '../layout/HeaderBar';
import { HomeView } from '../views/HomeView';
import { CategoryView } from '../views/CategoryView';
import { SubcategoryView } from '../views/SubcategoryView';
import { AnimatedDrawer } from '../navigation/AnimatedDrawer';
import { SearchModal } from '../modals/SearchModal';
import { UploadModal } from '../modals/UploadModal';
import { User } from '../../types/auth';
import { categories } from '../../data/categories';
import { documentSubcategories } from '../../data/subcategories';
import { authService } from '../../services/auth';
import { Alert } from 'react-native';
import { styles } from '../../styles/main';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

export type ViewType = 'home' | 'category' | 'subcategory';

export const MainApp: React.FC<MainAppProps> = ({ user, onLogout }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        onPress: async () => {
          try {
            await authService.logout();
            // Reset app state
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setCurrentView('home');
            onLogout();
          } catch (error) {
            console.log('Error during logout:', error);
            onLogout(); // Still log out even if there's an error
          }
        }
      }
    ]);
  };

  const handleCategoryPress = (categoryId: string, title: string) => {
    console.log(`Selected category: ${title}`);
    setSelectedCategory(categoryId);
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category && !category?.hasSubcategories) {
      setCurrentView('subcategory');
      setSelectedSubcategory({
        id: `${categoryId}-main`,
        title: category.title,
        icon: category.icon,
        description: category.description,
        parentId: categoryId,
        keyName: category.keyName,
      });}
    }
}