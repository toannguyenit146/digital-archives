// src/components/navigation/AnimatedDrawer.tsx
import React, { useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions,
  StyleSheet 
} from 'react-native';
import { Icon } from '../common/Icon';
import { User } from '../../types/auth';
import { menuItems } from '../../data/menuItems';

const { width, height } = Dimensions.get('window');

interface AnimatedDrawerProps {
  isVisible: boolean;
  onItemPress: (itemId: string) => void;
  onClose: () => void;
  user: User;
}

export const AnimatedDrawer: React.FC<AnimatedDrawerProps> = ({
  isVisible,
  onItemPress,
  onClose,
  user,
}) => {
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  if (!isVisible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.drawerHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.drawerTitle}>Kho Lưu Trữ Số</Text>
            <Text style={styles.drawerSubtitle}>Digital Archives</Text>
            <View style={styles.userInfo}>
              <Icon name="user" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.userInfoText}>{user.name}</Text>
            </View>
          </View>
          
          <ScrollView style={styles.drawerContent}>
            {menuItems.map((item) => {
              if (item.title.startsWith('---')) {
                return (
                  <View key={item.id} style={styles.separatorContainer}>
                    <Text style={styles.separatorText}>{item.title}</Text>
                  </View>
                );
              }
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.drawerItem}
                  onPress={() => onItemPress(item.id)}
                >
                  {item.icon && (
                    <Icon 
                      name={item.icon} 
                      size={20} 
                      color={item.id === 'logout' ? '#ff4757' : '#64748b'} 
                    />
                  )}
                  <Text 
                    style={[
                      styles.drawerItemText,
                      item.id === 'logout' && { color: '#ff4757' }
                    ]}
                  >
                    {item.title}
                  </Text>
                  {(item as any).isCategory && (
                    <Icon name="chevron-forward" size={16} color="#64748b" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <View style={styles.drawerFooter}>
            <Text style={styles.footerText}>Version 1.0.0</Text>
            <Text style={styles.footerText}>© 2025 Digital Archives</Text>
          </View>
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.modalBackground} 
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackground: {
    flex: 1,
  },
  drawerContainer: {
    width: width * 0.8,
    backgroundColor: 'white',
    height: height,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  drawerHeader: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  userInfoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 8,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  drawerItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 15,
  },
  separatorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
  },
  separatorText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
});