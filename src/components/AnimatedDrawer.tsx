import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../../src/styles';
import { User } from '../../src/types';
import { categories } from '../constants/categories';
import Icon from './Icon';

const { width, height } = Dimensions.get("window");

const menuItems = [
  { id: "home", title: "Trang chủ", icon: "home" },
  { id: "separator1", title: "--- Danh mục ---", icon: null },
  ...categories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    icon: cat.icon,
    isCategory: true,
  })),
  { id: "separator2", title: "--- Khác ---", icon: null },
  { id: "settings", title: "Cài đặt", icon: "settings" },
  { id: "logout", title: "Đăng xuất", icon: "logout" },
];

const AnimatedDrawer: React.FC<{
  isVisible: boolean;
  onItemPress: (itemId: string) => void;
  onClose: () => void;
  user: User;
}> = ({ isVisible, onItemPress, onClose, user }) => {
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
            { transform: [{ translateX: slideAnim }] },
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
              if (item.title.startsWith("---")) {
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
                      color={item.id === "logout" ? "#ff4757" : "#64748b"}
                    />
                  )}
                  <Text
                    style={[
                      styles.drawerItemText,
                      item.id === "logout" && { color: "#ff4757" },
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

        <TouchableOpacity style={styles.modalBackground} onPress={onClose} />
      </View>
    </Modal>
  );
};

export default AnimatedDrawer;
