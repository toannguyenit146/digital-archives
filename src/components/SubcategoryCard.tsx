import { SubcategoryItem } from '@/src/types';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../src/styles';
import Icon from './Icon';

const SubcategoryCard: React.FC<{
  item: SubcategoryItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.subcategoryCard} onPress={onPress}>
    <View style={styles.subcategoryContent}>
      <Icon name={item.icon} size={20} color="#667eea" />
      <Text style={styles.subcategoryTitle}>{item.title}</Text>
      <Text style={styles.subcategoryDescription}>{item.description}</Text>
    </View>
  </TouchableOpacity>
);

export default SubcategoryCard;
