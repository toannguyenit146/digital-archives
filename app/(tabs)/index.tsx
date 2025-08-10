import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Icon component that works across all platforms
const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ 
  name, 
  size = 20, 
  color = '#000' 
}) => {
  const iconMap: { [key: string]: string } = {
    'menu': '☰',
    'search': '🔍',
    'notifications': '🔔',
    'close': '✕',
    'home': '🏠',
    'document-text': '📄',
    'school': '🎓',
    'people': '👥',
    'shield': '🛡️',
    'medal': '🏅',
    'ribbon': '🎗️',
    'help-circle': '❓',
    'library': '📚',
    'ellipsis-horizontal': '⋯',
    'settings': '⚙️',
    'exit': '🚪',
    'chevron-forward': '▶',
    'folder': '📁',
  };

  const iconChar = iconMap[name] || '•';
  
  return (
    <Text style={{ fontSize: size, color, lineHeight: size }}>
      {iconChar}
    </Text>
  );
};

interface CategoryItem {
  id: string;
  title: string;
  color: string;
  icon: string;
  description: string;
}

const categories: CategoryItem[] = [
  {
    id: '1',
    title: 'Tài liệu',
    color: '#4A90E2',
    icon: 'document-text',
    description: 'Quản lý và truy cập tài liệu',
  },
  {
    id: '2',
    title: 'Kiến thức thường trực',
    color: '#7ED321',
    icon: 'school',
    description: 'Kiến thức cần thiết thường xuyên',
  },
  {
    id: '3',
    title: 'Đối tượng SQ, QNCN',
    color: '#F5A623',
    icon: 'people',
    description: 'Thông tin sĩ quan, quân nhân chuyên nghiệp',
  },
  {
    id: '4',
    title: 'Đối tượng HSQ, BS',
    color: '#D0021B',
    icon: 'shield',
    description: 'Hạ sĩ quan và binh sĩ',
  },
  {
    id: '5',
    title: 'ĐTB, ĐVM',
    color: '#9013FE',
    icon: 'medal',
    description: 'Đảng viên và đoàn viên',
  },
  {
    id: '6',
    title: 'Đối tượng Đoàn viên',
    color: '#50E3C2',
    icon: 'ribbon',
    description: 'Thông tin về đoàn viên',
  },
  {
    id: '7',
    title: 'Cấu hỏi kiến thức GDCT',
    color: '#B8E986',
    icon: 'help-circle',
    description: 'Câu hỏi giáo dục chính trị',
  },
  {
    id: '8',
    title: 'Cấu hỏi kiến thức pháp luật',
    color: '#4BD5EA',
    icon: 'library',
    description: 'Câu hỏi về pháp luật',
  },
];

const menuItems = [
  { id: 'home', title: 'Trang chủ', icon: 'home' },
  { id: 'separator1', title: '--- Danh mục ---', icon: null },
  ...categories.map(cat => ({ 
    id: cat.id, 
    title: cat.title, 
    icon: cat.icon,
    isCategory: true 
  })),
  { id: 'separator2', title: '--- Khác ---', icon: null },
  { id: 'more', title: 'Thêm', icon: 'ellipsis-horizontal' },
  { id: 'settings', title: 'Cài đặt', icon: 'settings' },
  { id: 'exit', title: 'Thoát', icon: 'exit' },
];

const CategoryCard: React.FC<{
  item: CategoryItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
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

const DrawerContent: React.FC<{
  onItemPress: (itemId: string) => void;
  onClose: () => void;
}> = ({ onItemPress, onClose }) => (
  <View style={styles.drawerContainer}>
    <View style={styles.drawerHeader}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.drawerTitle}>Kho Lưu Trữ Số</Text>
      <Text style={styles.drawerSubtitle}>Digital Archives</Text>
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
                color={item.id === 'exit' ? '#ff4757' : '#64748b'} 
              />
            )}
            <Text 
              style={[
                styles.drawerItemText,
                item.id === 'exit' && { color: '#ff4757' }
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
  </View>
);

export default function EnhancedDigitalArchives() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (categoryId: string, title: string) => {
    console.log(`Selected category: ${title}`);
    setSelectedCategory(categoryId);
    // Navigate to category detail screen
  };

  const handleDrawerItemPress = (itemId: string) => {
    console.log(`Drawer item pressed: ${itemId}`);
    setIsDrawerOpen(false);
    
    switch (itemId) {
      case 'home':
        setSelectedCategory(null);
        break;
      case 'settings':
        // Navigate to settings
        break;
      case 'more':
        // Show more options
        break;
      case 'exit':
        // Handle app exit
        break;
      default:
        // Check if it's a category
        const category = categories.find(cat => cat.id === itemId);
        if (category) {
          handleCategoryPress(itemId, category.title);
        }
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Menu Button */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setIsDrawerOpen(true)}
        >
          <Icon name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Kho Lưu Trữ Số</Text>
        <View style={styles.headerBarRight}>
          <TouchableOpacity style={styles.searchButton}>
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.headerBackground, { backgroundColor: '#667eea' }]} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Digital Archives</Text>
            <Text style={styles.headerSubtitle}>Hệ thống quản lý tài liệu số</Text>
            <View style={styles.mainTitleContainer}>
              <View style={styles.titleBorder}>
                <Text style={styles.mainTitle}>Những điều cần nắm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục chính</Text>
            <Text style={styles.sectionSubtitle}>Chọn danh mục để bắt đầu</Text>
          </View>
          
          <View style={styles.categoriesGrid}>
            {categories.map((item, index) => (
              <View key={item.id} style={styles.categoryWrapper}>
                {/* Connection Line */}
                {/*index === 0 && (
                  <View style={styles.connectionLine} />
                )*/}
                <CategoryCard
                  item={item}
                  onPress={() => handleCategoryPress(item.id, item.title)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Thống kê hệ thống</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="folder" size={32} color="#667eea" />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Danh mục</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="document-text" size={32} color="#7ED321" />
              <Text style={styles.statNumber}>1,250+</Text>
              <Text style={styles.statLabel}>Tài liệu</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="help-circle" size={32} color="#F5A623" />
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Câu hỏi</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="people" size={32} color="#D0021B" />
              <Text style={styles.statNumber}>2,100+</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Drawer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDrawerOpen}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <DrawerContent 
            onItemPress={handleDrawerItemPress}
            onClose={() => setIsDrawerOpen(false)}
          />
          <TouchableOpacity 
            style={styles.modalBackground} 
            onPress={() => setIsDrawerOpen(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    height: 180,
    position: 'relative',
    marginBottom: 20,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 15,
  },
  mainTitleContainer: {
    alignItems: 'center',
  },
  titleBorder: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  sectionHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    width: (width - 45) / 2,
    marginBottom: 15,
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    top: -25,
    left: '50%',
    width: 2,
    height: 25,
    backgroundColor: '#667eea',
    marginLeft: -1,
  },
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
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: (width - 55) / 2,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  // Drawer Styles
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