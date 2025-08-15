// src/components/layout/HeaderBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Icon } from '../common/Icon';

interface HeaderBarProps {
  onMenuPress: () => void;
  onSearchPress: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onMenuPress, onSearchPress }) => {
  return (
    <View style={styles.headerBar}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Icon name="menu" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerBarTitle}>Kho Lưu Trữ Số</Text>
      <View style={styles.headerBarRight}>
        <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
          <Icon name="search" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="notifications" size={20} color="white" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    height: 60,
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButton: {
    padding: 8,
  },
  headerBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  headerBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4757',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});