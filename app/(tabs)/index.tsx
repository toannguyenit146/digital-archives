import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
    'chevron-back': '◀',
    'upload': '📤',
    'history': '📜',
    'resolution': '📋',
    'science': '🔬',
    'economics': '📊',
    'qs-qp': '🏛️',
    'culture': '🎭',
    'law': '⚖️',
    'decree': '📃',
    'circular': '🔄',
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
  hasSubcategories?: boolean;
}

interface SubcategoryItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  parentId: string;
}

const categories: CategoryItem[] = [
  {
    id: '1',
    title: 'Tài liệu',
    color: '#4A90E2',
    icon: 'document-text',
    description: 'Quản lý và truy cập tài liệu',
    hasSubcategories: true,
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

const documentSubcategories: SubcategoryItem[] = [
  { id: '1-1', title: 'Lịch sử', icon: 'history', description: 'Tài liệu lịch sử', parentId: '1' },
  { id: '1-2', title: 'Nghị quyết', icon: 'resolution', description: 'Nghị quyết và quyết định', parentId: '1' },
  { id: '1-3', title: 'Khoa học', icon: 'science', description: 'Tài liệu khoa học kỹ thuật', parentId: '1' },
  { id: '1-4', title: 'Kinh tế - Xã hội', icon: 'economics', description: 'Tài liệu kinh tế xã hội', parentId: '1' },
  { id: '1-5', title: 'QS-QP', icon: 'qs-qp', description: 'Quân sự - Quốc phòng', parentId: '1' },
  { id: '1-6', title: 'Văn hóa', icon: 'culture', description: 'Tài liệu văn hóa', parentId: '1' },
  { id: '1-7', title: 'Pháp luật', icon: 'law', description: 'Văn bản pháp luật', parentId: '1' },
  { id: '1-8', title: 'Nghị định', icon: 'decree', description: 'Nghị định của Chính phủ', parentId: '1' },
  { id: '1-9', title: 'Thông tư', icon: 'circular', description: 'Thông tư hướng dẫn', parentId: '1' },
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

const SubcategoryCard: React.FC<{
  item: SubcategoryItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.subcategoryCard} onPress={onPress}>
    <View style={styles.subcategoryContent}>
      <Icon name={item.icon} size={20} color="#667eea" />
      <Text style={styles.subcategoryTitle}>{item.title}</Text>
      <Text style={styles.subcategoryDescription}>{item.description}</Text>
      <Icon name="chevron-forward" size={16} color="#64748b" />
    </View>
  </TouchableOpacity>
);

const AnimatedDrawer: React.FC<{
  isVisible: boolean;
  onItemPress: (itemId: string) => void;
  onClose: () => void;
}> = ({ isVisible, onItemPress, onClose }) => {
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
        </Animated.View>
        
        <TouchableOpacity 
          style={styles.modalBackground} 
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const SearchModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
}> = ({ isVisible, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      Alert.alert('Tìm kiếm', `Đang tìm kiếm: "${searchQuery}"`, [
        { text: 'OK', onPress: onClose }
      ]);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.searchModalOverlay}>
        <View style={styles.searchModalContent}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>Tìm kiếm trong kho dữ liệu</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              onSubmitEditing={handleSearch}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const UploadModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  subcategory: SubcategoryItem | null;
}> = ({ isVisible, onClose, subcategory }) => {
  const [fileName, setFileName] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  
  const handleUpload = () => {
    if (!fileName.trim() || !uploaderName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    const uploadInfo = {
      category: 'Tài liệu',
      subcategory: subcategory?.title,
      fileName: fileName,
      fileType: fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      fileSize: '2.5 MB', // Mock data
      uploader: uploaderName,
    };
    
    Alert.alert(
      'Xác nhận tải lên',
      `Danh mục: ${uploadInfo.category} > ${uploadInfo.subcategory}\nTên file: ${uploadInfo.fileName}\nLoại file: ${uploadInfo.fileType}\nKích thước: ${uploadInfo.fileSize}\nNgười tải: ${uploadInfo.uploader}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Tải lên', 
          onPress: () => {
            Alert.alert('Thành công', 'Tài liệu đã được tải lên!');
            setFileName('');
            setUploaderName('');
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.uploadModalOverlay}>
        <View style={styles.uploadModalContent}>
          <View style={styles.uploadHeader}>
            <Text style={styles.uploadTitle}>Tải lên tài liệu</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadInfoLabel}>Vị trí lưu trữ:</Text>
            <Text style={styles.uploadInfoValue}>Tài liệu {'>'} {subcategory?.title}</Text>
          </View>
          
          <View style={styles.uploadInputContainer}>
            <Text style={styles.inputLabel}>Tên file:</Text>
            <TextInput
              style={styles.uploadInput}
              placeholder="Nhập tên file (ví dụ: document.pdf)"
              value={fileName}
              onChangeText={setFileName}
            />
          </View>
          
          <View style={styles.uploadInputContainer}>
            <Text style={styles.inputLabel}>Người tải lên:</Text>
            <TextInput
              style={styles.uploadInput}
              placeholder="Nhập tên người tải lên"
              value={uploaderName}
              onChangeText={setUploaderName}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUpload}
          >
            <Icon name="upload" size={20} color="white" />
            <Text style={styles.uploadButtonText}>Tải lên tài liệu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function EnhancedDigitalArchivesV2() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'subcategory'>('home');

  const handleCategoryPress = (categoryId: string, title: string) => {
    console.log(`Selected category: ${title}`);
    setSelectedCategory(categoryId);
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category?.hasSubcategories) {
      setCurrentView('category');
    }
  };

  const handleSubcategoryPress = (subcategory: SubcategoryItem) => {
    setSelectedSubcategory(subcategory);
    setCurrentView('subcategory');
  };

  const handleDrawerItemPress = (itemId: string) => {
    console.log(`Drawer item pressed: ${itemId}`);
    setIsDrawerOpen(false);
    
    switch (itemId) {
      case 'home':
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setCurrentView('home');
        break;
      case 'settings':
        Alert.alert('Cài đặt', 'Chức năng đang phát triển');
        break;
      case 'more':
        Alert.alert('Thêm', 'Chức năng bổ sung');
        break;
      case 'exit':
        Alert.alert('Thoát', 'Bạn có muốn thoát ứng dụng?', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thoát', onPress: () => console.log('Exit app') }
        ]);
        break;
      default:
        const category = categories.find(cat => cat.id === itemId);
        if (category) {
          handleCategoryPress(itemId, category.title);
        }
        break;
    }
  };

  const handleBackPress = () => {
    if (currentView === 'subcategory') {
      setCurrentView('category');
      setSelectedSubcategory(null);
    } else if (currentView === 'category') {
      setCurrentView('home');
      setSelectedCategory(null);
    }
  };

  const renderHomeView = () => (
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
  );

  const renderCategoryView = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    
    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.subcategoryHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
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
              onPress={() => handleSubcategoryPress(item)}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderSubcategoryView = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.subcategoryHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="chevron-back" size={20} color="#667eea" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.subcategoryTitle}>{selectedSubcategory?.title}</Text>
        <Text style={styles.subcategorySubtitle}>{selectedSubcategory?.description}</Text>
      </View>
      
      <View style={styles.uploadSection}>
        <TouchableOpacity 
          style={styles.uploadFloatingButton}
          onPress={() => setIsUploadModalOpen(true)}
        >
          <Icon name="upload" size={24} color="white" />
          <Text style={styles.uploadFloatingText}>Tải lên tài liệu</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.documentsContainer}>
        <Text style={styles.documentsTitle}>Tài liệu trong danh mục</Text>
        <Text style={styles.documentsPlaceholder}>Chưa có tài liệu nào</Text>
      </View>
    </ScrollView>
  );

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
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setIsSearchModalOpen(true)}
          >
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

      {/* Content based on current view */}
      {currentView === 'home' && renderHomeView()}
      {currentView === 'category' && renderCategoryView()}
      {currentView === 'subcategory' && renderSubcategoryView()}

      {/* Animated Navigation Drawer */}
      <AnimatedDrawer
        isVisible={isDrawerOpen}
        onItemPress={handleDrawerItemPress}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Upload Modal */}
      <UploadModal
        isVisible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        subcategory={selectedSubcategory}
      />
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
  // Subcategory View Styles
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
  subcategorySubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  subcategoriesContainer: {
    paddingHorizontal: 15,
  },
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
  subcategoryTitle: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  subcategoryDescription: {
    fontSize: 12,
    color: '#64748b',
    marginRight: 10,
  },
  // Upload Section Styles
  uploadSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  uploadFloatingButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadFloatingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  documentsContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 12,
  },
  documentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  documentsPlaceholder: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 30,
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
  // Search Modal Styles
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  searchModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 10,
  },
  searchButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Upload Modal Styles
  uploadModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  uploadModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  uploadInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  uploadInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  uploadInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  uploadInputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
    fontWeight: '500',
  },
  uploadInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  uploadButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});