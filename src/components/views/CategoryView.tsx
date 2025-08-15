// src/components/views/CategoryView.tsx
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SubcategoryCard } from '../cards/SubcategoryCard';
import { Icon } from '../common/Icon';
import { categories } from '../../data/categories';
import { documentSubcategories } from '../../data/subcategories';
import { SubcategoryItem } from '../../types/category';

interface CategoryViewProps {
  selectedCategory: string | null;
  onBackPress: () => void;
  onSubcategoryPress: (subcategory: SubcategoryItem) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  selectedCategory,
  onBackPress,
  onSubcategoryPress,
}) => {
  const category = categories.find(cat => cat.id === selectedCategory);
  
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.subcategoryHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Icon name="chevron-back" size={20} color="#667eea" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.subcategoryTitle}>{category?.title}</Text>
        <Text style={styles.subcategorySubtitle}>Chọn danh mục con để xem chi tiết</Text>
      </View>
      
      <View style={styles.subcategoriesContainer}>
        {documentSubcategories.map((item) => (
          <SubcategoryCard
            key={item.id}
            item={item}
            onPress={() => onSubcategoryPress(item)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  subcategoryHeader: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
    marginLeft: 5,
  },
  subcategoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subcategorySubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  subcategoriesContainer: {
    paddingHorizontal: 15,
  },
});
