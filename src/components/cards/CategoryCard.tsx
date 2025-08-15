// src/components/cards/CategoryCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon } from '../common/Icon';
import { CategoryItem } from '../../types/category';

interface CategoryCardProps {
  item: CategoryItem;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={[styles.categoryCard, { backgroundColor: item.color }]} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Icon name={item.icon} size={24} color="white" />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.cardArrow}>
        <Icon name="chevron-forward" size={20} color="white" />
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  categoryCard: {
    height: 140,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    lineHeight: 16,
    marginVertical: 4,
  },
  cardDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 12,
    flex: 1,
    marginBottom: 8,
  },
  cardArrow: {
    alignSelf: 'flex-end',
  },
});