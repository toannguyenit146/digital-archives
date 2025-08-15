// src/components/cards/SubcategoryCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon } from '../common/Icon';
import { SubcategoryItem } from '../../types/category';

interface SubcategoryCardProps {
  item: SubcategoryItem;
  onPress: () => void;
}

export const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.subcategoryCard} onPress={onPress}>
    <View style={styles.subcategoryContent}>
      <Icon name={item.icon} size={20} color="#667eea" />
      <View style={styles.textContainer}>
        <Text style={styles.subcategoryTitle}>{item.title}</Text>
        <Text style={styles.subcategoryDescription}>{item.description}</Text>
      </View>
      <Icon name="chevron-forward" size={16} color="#64748b" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  subcategoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  subcategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  subcategoryDescription: {
    fontSize: 12,
    color: '#64748b',
  },
});