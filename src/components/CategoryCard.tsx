import { CategoryItem } from '@/src/types';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../src/styles';
import Icon from './Icon';

const CategoryCard: React.FC<{
  item: CategoryItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: item.color }]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View
        style={[styles.cardIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}
      >
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

export default CategoryCard;
