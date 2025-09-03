import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from "expo-file-system";
import * as SecureStore from 'expo-secure-store';
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CategoryItem, Document, SubcategoryItem, User } from '../../src/types';
import { styles } from './styles';

// ✅ Wrapper Storage cho Web + Mobile
const StorageOS = {
async setItem(key: string, value: string) {
if (Platform.OS === "web") {
localStorage.setItem(key, value);
} else {
await SecureStore.setItemAsync(key, value);
}
},
async getItem(key: string) {
if (Platform.OS === "web") {
return localStorage.getItem(key);
} else {
return await SecureStore.getItemAsync(key);
}
},
async deleteItem(key: string) {
if (Platform.OS === "web") {
localStorage.removeItem(key);
} else {
await SecureStore.deleteItemAsync(key);
}
},
};

const { width, height } = Dimensions.get('window');

// API Configuration - Change this to your backend server URL
const API_BASE_URL = 'http://192.168.0.109:3000/api'; // For development
// const API_BASE_URL = 'http://YOUR_SERVER_IP:3000/api'; // For production

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
    'user': '👤',
    'lock': '🔒',
    'eye': '👁',
    'eye-off': '🙈',
    'image': '🖼️',
    'video': '🎥',
    'download': '⬇️',
    'edit': '✏️',
    'training': '🎯',
    'party': '🏛️',
    'logout': '🚪',
  };

  const iconChar = iconMap[name] || '•';
  
  return (
    <Text style={{ fontSize: size, color, lineHeight: size }}>
      {iconChar}
    </Text>
  );
};

// API Helper functions
class ApiService {
  static async makeRequest(endpoint: string, options = {}) {
    try {
      const token = await StorageOS.getItem('authToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        },
        ...options
      };
      console.log('['+(new Date()).toISOString()+'] '+'Fetch Config:', config);
      console.log('Fetching from:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Network error');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  static async login(username: string, password: string) {
    try {
      console.log('Login Payload:', { username, password });
      console.log('Logging in to:', `${API_BASE_URL}/auth/login`);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login Response Status:', response.status);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Lưu token lại
      if (data.token) {
        await StorageOS.setItem("authToken", data.token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async getDocuments(category: string | undefined, subcategory: string | undefined, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (category) params.append('category', category);
    if (subcategory) params.append('subcategory', subcategory);

    return this.makeRequest(`/documents?${params.toString()}`);
  }

  static async uploadDocument(formData: FormData) {
    // Extract category and subcategory from formData
    const categoryKey = formData.get('category') as string;
    const subcategoryKey = formData.get('subcategory') as string;
    const token = await StorageOS.getItem('authToken');
    const url = `${API_BASE_URL}/documents/upload?category=${encodeURIComponent(categoryKey || "general")}&subcategory=${encodeURIComponent(subcategoryKey || "general")}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let the browser set it
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  static async downloadDocument(documentId: any) {
    const token = await StorageOS.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Download failed');
    }

    return response;
  }
  
  // Add new method for getting download URL
  static async getDownloadUrl(documentId: any) {
    const token = await StorageOS.getItem('authToken');
    return `${API_BASE_URL}/documents/${documentId}/download?token=${token}`;
  }

  static async searchDocuments(query: string, category: string | undefined, subcategory: string | undefined) {
    const params = new URLSearchParams({ query });
    if (category) params.append('category', category);
    if (subcategory) params.append('subcategory', subcategory);

    return this.makeRequest(`/documents/search?${params.toString()}`);
  }
}



const categories: CategoryItem[] = [
  {
    id: '1',
    title: 'Tài liệu',
    color: '#4A90E2',
    icon: 'document-text',
    description: 'Quản lý và truy cập tài liệu',
    hasSubcategories: true,
    allowUpload: true,
    keyName: "tailieu",
  },
  {
    id: '2',
    title: 'Kiến thức thường trực',
    color: '#7ED321',
    icon: 'school',
    description: 'Kiến thức cần thiết thường xuyên',
    allowUpload: true,
    keyName: "kienthucthuongtruc",
  },
  {
    id: '3',
    title: 'Đối tượng SQ, QNCN',
    color: '#F5A623',
    icon: 'people',
    description: 'Thông tin sĩ quan, quân nhân chuyên nghiệp',
    allowUpload: true,
    keyName: "doituongsqvaqncn",
  },
  {
    id: '4',
    title: 'Đối tượng HLTPĐ',
    color: '#FF6B6B',
    icon: 'training',
    description: 'HSQ, BS thay phiên đảo',
    allowUpload: true,
    keyName: "doituonghltpd",
  },
  {
    id: '5',
    title: 'Đối tượng HSQ, BS',
    color: '#D0021B',
    icon: 'shield',
    description: 'Hạ sĩ quan và binh sĩ',
    allowUpload: true,
    keyName: "hasiquanvabinhsi",
  },
  {
    id: '6',
    title: 'ĐTĐ, ĐVM',
    color: '#9013FE',
    icon: 'party',
    description: 'Đảng viên và đảng viên mới',
    allowUpload: true,
    keyName: "dangvienvadangvienmoi",
  },
  {
    id: '7',
    title: 'Đối tượng Đoàn viên',
    color: '#50E3C2',
    icon: 'ribbon',
    description: 'Thông tin về đoàn viên',
    allowUpload: true,
    keyName: "doituongdoanvien",
  },
  {
    id: '8',
    title: 'Cấu hỏi kiến thức GDCT',
    color: '#B8E986',
    icon: 'help-circle',
    description: 'Câu hỏi giáo dục chính trị',
    allowUpload: true,
    keyName: "cauhoikienthucgdct",
  },
  {
    id: '9',
    title: 'Cấu hỏi kiến thức pháp luật',
    color: '#4BD5EA',
    icon: 'library',
    description: 'Câu hỏi về pháp luật',
    allowUpload: true,
    keyName: "cauhoikienthucphapluat",
  },
];

const documentSubcategories: SubcategoryItem[] = [
  { id: '1-1', title: 'Lịch sử', icon: 'history', description: 'Tài liệu lịch sử', parentId: '1', keyName: 'lichsu'},
  { id: '1-2', title: 'Nghị quyết', icon: 'resolution', description: 'Nghị quyết và quyết định', parentId: '1', keyName: 'nghiquyet'},
  { id: '1-3', title: 'Khoa học', icon: 'science', description: 'Tài liệu khoa học kỹ thuật', parentId: '1', keyName: 'khoahoc' },
  { id: '1-4', title: 'Kinh tế - Xã hội', icon: 'economics', description: 'Tài liệu kinh tế xã hội', parentId: '1', keyName: 'kt-xh' },
  { id: '1-5', title: 'Quân sự - Quốc phòng', icon: 'qs-qp', description: 'Quân sự - Quốc phòng', parentId: '1', keyName: 'quansuvaquocphong' },
  { id: '1-6', title: 'Văn hóa', icon: 'culture', description: 'Tài liệu văn hóa', parentId: '1', keyName: 'vanhoa' },
  { id: '1-7', title: 'Pháp luật', icon: 'law', description: 'Văn bản pháp luật', parentId: '1', keyName: 'phapluat' },
  { id: '1-8', title: 'Nghị định', icon: 'decree', description: 'Nghị định của Chính phủ', parentId: '1', keyName: 'nghidinh' },
  { id: '1-9', title: 'Thông tư', icon: 'circular', description: 'Thông tư hướng dẫn', parentId: '1', keyName: 'thongtu' },
  { id: '1-10', title: 'Hình ảnh', icon: 'image', description: 'Tài liệu hình ảnh', parentId: '1', keyName: 'hinhanh' },
  { id: '1-11', title: 'Video', icon: 'video', description: 'Tài liệu video', parentId: '1', keyName: 'video' },
];

// Mock user database
// const mockUsers = [
//   { username: 'admin', password: '123456', name: 'Quản trị viên', role: 'Administrator' },
//   { username: 'hoangocanh', password: '12346789', name: 'Hoa Ngọc Ánh', role: 'TL THc' },
//   { username: 'nhtt', password: '18082002', name: 'Nguyễn Huỳnh Thanh Toàn', role: 'Programmer' },
// ];

const LoginScreen: React.FC<{
  onLogin: (user: User) => void;
}> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await StorageOS.getItem('authToken');
      const userData = await StorageOS.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        onLogin(user);
      }
    } catch (error) {
      console.log('No existing session');
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.login(username.trim(), password.trim());
      
      if (response.success) {
        // Store session
        await StorageOS.setItem('authToken', response.token);
        await StorageOS.setItem('userData', JSON.stringify(response.user));

        onLogin(response.user);
      } else {
        Alert.alert('Lỗi đăng nhập', 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      Alert.alert('Lỗi đăng nhập' + error || 'Có lỗi xảy ra trong quá trình đăng nhập');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.loginContent}>
        <View style={styles.loginHeader}>
          <Icon name="document-text" size={80} color="#667eea" />
          <Text style={styles.loginTitle}>Digital Archives</Text>
          <Text style={styles.loginSubtitle}>Hệ thống quản lý tài liệu số</Text>
        </View>

        <View style={styles.loginForm}>
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#64748b" />
            <TextInput
              style={styles.loginInput}
              placeholder="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#64748b" />
            <TextInput
              style={styles.loginInput}
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Tài khoản demo:</Text>
            <Text style={styles.demoText}>bantuyenhuan / 12346789</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  { id: 'settings', title: 'Cài đặt', icon: 'settings' },
  { id: 'logout', title: 'Đăng xuất', icon: 'logout' },
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

// 3. Replace the existing DocumentCard component with this enhanced version
const DocumentCard: React.FC<{
  document: Document;
  onDownload: () => void;
}> = ({ document, onDownload }) => {
  const [downloading, setDownloading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getFileTypeIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📺';
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return '🖼️';
    if (type.includes('video') || type.includes('mp4') || type.includes('avi')) return '🎥';
    if (type.includes('audio') || type.includes('mp3') || type.includes('wav')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📁';
  };

  const getCategoryColor = (category: string) => {
    const categoryColors = {
      'tailieu': '#4A90E2',
      'kienthucthuongtruc': '#7ED321',
      'doituongsqvaqncn': '#F5A623',
      'doituonghltpd': '#FF6B6B',
      'hasiquanvabinhsi': '#D0021B',
      'dangvienvadangvienmoi': '#9013FE',
      'doituongdoanvien': '#50E3C2',
      'cauhoikienthucgdct': '#B8E986',
      'cauhoikienthucphapluat': '#4BD5EA',
    };
    return categoryColors[category as keyof typeof categoryColors] || '#667eea';
  };

  return (
    <View style={styles.enhancedDocumentCard}>
      {/* Header with file type and category indicator */}
      <View style={styles.documentCardHeader}>
        <View style={styles.fileTypeContainer}>
          <Text style={styles.fileTypeIcon}>{getFileTypeIcon(document.file_type)}</Text>
          <Text style={styles.fileTypeText}>{document.file_type.split('/')[1]?.toUpperCase() || 'FILE'}</Text>
        </View>
        <View 
          style={[
            styles.categoryIndicator, 
            { backgroundColor: getCategoryColor(document.category) }
          ]}
        />
      </View>

      {/* Document Title */}
      <Text style={styles.enhancedDocumentTitle} numberOfLines={2}>
        {document.title}
      </Text>

      {/* Document Info Grid */}
      <View style={styles.documentInfoGrid}>
        <View style={styles.infoItem}>
          <Icon name="user" size={14} color="#64748b" />
          <Text style={styles.infoText} numberOfLines={1}>{document.author}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="history" size={14} color="#64748b" />
          <Text style={styles.infoText}>{formatDate(document.created_at)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="document-text" size={14} color="#64748b" />
          <Text style={styles.infoText}>{formatFileSize(document.file_size)}</Text>
        </View>
        {document.uploader_name && (
          <View style={styles.infoItem}>
            <Icon name="upload" size={14} color="#64748b" />
            <Text style={styles.infoText} numberOfLines={1}>{document.uploader_name}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.documentActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.downloadButton]}
          onPress={onDownload}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Icon name="download" size={16} color="white" />
              <Text style={styles.actionButtonText}>Tải xuống</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* <TouchableOpacity 
          style={[styles.actionButton, styles.previewButton]}
          onPress={() => {
            // Preview functionality can be added here
            Alert.alert('Xem trước', 'Chức năng xem trước đang phát triển');
          }}
        >
          <Icon name="eye" size={16} color="#667eea" />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

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

const SearchModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}> = ({ isVisible, onClose, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onClose();
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
  category: string;
  subcategory?: string;
  user: User;
  onUploadSuccess: () => void;
}> = ({ isVisible, onClose, category, subcategory, user, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentTitle, setDocumentTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn tệp');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Lỗi', 'Vui lòng chọn tệp để tải lên');
      return;
    }

    if (!documentTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên tài liệu');
      return;
    }

    if (!authorName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên tác giả');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get category/subcategory keys
      const categoryKey = categories.find(cat => cat.title === category)?.keyName;
      const subcategoryKey = documentSubcategories.find(sub => sub.title === subcategory)?.keyName;

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'application/octet-stream',
        name: selectedFile.name,
      } as any);
      formData.append('title', documentTitle);
      formData.append('author', authorName);
      formData.append('category', categoryKey || 'general');
      if (subcategoryKey) {
        formData.append('subcategory', subcategoryKey);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      console.log('Uploading to category:', categoryKey, 'subcategory:', subcategoryKey);
      const response = await ApiService.uploadDocument(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setUploading(false);
        Alert.alert('Thành công', 'Tài liệu đã được tải lên thành công!', [
          {
            text: 'OK',
            onPress: () => {
              setSelectedFile(null);
              setDocumentTitle('');
              setAuthorName('');
              setUploadProgress(0);
              onUploadSuccess?.();
              onClose();
            },
          },
        ]);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình tải lên tài liệu:\n' + error);
    }
  };  

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.uploadModalOverlay}>
        <ScrollView contentContainerStyle={styles.uploadModalContainer}>
          <View style={styles.uploadModalContent}>
            <View style={styles.uploadHeader}>
              <Text style={styles.uploadTitle}>Tải lên tài liệu</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.uploadInfo}>
              <Text style={styles.uploadInfoLabel}>Vị trí lưu trữ:</Text>
              <Text style={styles.uploadInfoValue}>
                {category} {subcategory && subcategory !== category && `> ${subcategory}`}
              </Text>
            </View>

            <View style={styles.uploaderInfo}>
              <Text style={styles.uploadInfoLabel}>Người tải lên:</Text>
              <Text style={styles.uploadInfoValue}>{user.name}</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tên tài liệu *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập tên tài liệu"
                value={documentTitle}
                onChangeText={setDocumentTitle}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tác giả *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập tên tác giả"
                value={authorName}
                onChangeText={setAuthorName}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.filePickerButton}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Icon name="folder" size={20} color="#667eea" />
              <Text style={styles.filePickerText}>
                {selectedFile ? 'Chọn tệp khác' : 'Chọn tệp từ máy'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <View style={styles.selectedFileInfo}>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>Tên tệp:</Text>
                  <Text style={styles.fileInfoValue}>{selectedFile.name}</Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>Kích thước:</Text>
                  <Text style={styles.fileInfoValue}>
                    {selectedFile.size ? formatFileSize(selectedFile.size) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>Loại tệp:</Text>
                  <Text style={styles.fileInfoValue}>
                    {selectedFile.mimeType || 'N/A'}
                  </Text>
                </View>
              </View>
            )}

            {uploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${uploadProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(uploadProgress)}% - Đang tải lên...
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[
                styles.uploadButton,
                (!selectedFile || !documentTitle.trim() || !authorName.trim() || uploading) && styles.uploadButtonDisabled
              ]}
              onPress={handleUpload}
              disabled={!selectedFile || !documentTitle.trim() || !authorName.trim() || uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon name="upload" size={20} color="white" />
                  <Text style={styles.uploadButtonText}>Tải lên tài liệu</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default function EnhancedDigitalArchivesV4() {
  const [user, setUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'subcategory' | 'search'>('home');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      alert("Đăng xuất thành công");
      localStorage.clear();

      // Reset app state
      setUser(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setCurrentView('home');
      setDocuments([]);
      setSearchResults([]);
    } else {
      Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        onPress: async () => {
          try {
            // Clear stored session
            await StorageOS.deleteItem('authToken');
            await StorageOS.deleteItem('userData');
            
            // Reset app state
            setUser(null);
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setCurrentView('home');
            setDocuments([]);
            setSearchResults([]);
          } catch (error) {
            console.log('Error during logout:', error);
          }
        }
      }
    ]);
    }
  };

  const loadDocuments = async (categoryId: string, subcategoryId?: string) => {
    setLoading(true);
    try {
      const category = categories.find(cat => cat.id === categoryId);
      const subcategory = documentSubcategories.find(sub => sub.keyName === subcategoryId);
      
      const response = await ApiService.getDocuments(
        category?.keyName, 
        subcategory?.keyName
      );

      if (response.success) {
        setDocuments(response.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
      Alert.alert('Lỗi', 'Không thể tải danh sách tài liệu');
    }
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    setCurrentView('search');

    try {
      const response = await ApiService.searchDocuments(query, undefined, undefined);
      
      if (response.success) {
        setSearchResults(response.documents);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      Alert.alert('Lỗi', 'Không thể thực hiện tìm kiếm');
    }
    setLoading(false);
  };

  // 4. Replace the handleDownload function with this enhanced version
const handleDownload = async (document: Document) => {
  try {
    const token = await StorageOS.getItem("authToken");
    if (!token) {
      Alert.alert("Lỗi", "Không tìm thấy token đăng nhập");
      return;
    }

    // Gọi API download với Authorization header
    const response = await fetch(`${API_BASE_URL}/documents/${document.id}/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Download failed");
    }

    // Đổi response thành blob → base64
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = async () => {
      try {
        const base64data = (reader.result as string).split(",")[1];

        // Tên file
        let fileName = document.filename;
        if (!fileName.includes(".") && document.file_type) {
          const ext = document.file_type.split("/")[1];
          fileName = `${fileName}.${ext}`;
        }

        if (Platform.OS === "android") {
          // Xin quyền thư mục Download
          const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permissions.granted) {
            Alert.alert("Thông báo", "Không có quyền truy cập bộ nhớ");
            return;
          }

          // Tạo file trong thư mục Download và ghi nội dung
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            document.file_type || "application/octet-stream"
          );
          await FileSystem.writeAsStringAsync(uri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert("Thành công ✅", `Đã lưu file vào Download: ${fileName}`);
        } else {
          // iOS: lưu cache rồi mở qua Share
          const fileUri = FileSystem.cacheDirectory + fileName;
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          } else {
            Alert.alert("Thành công ✅", `File đã lưu: ${fileUri}`);
          }
        }
      } catch (err) {
        console.error("Save error:", err);
        Alert.alert("Lỗi", "Không thể lưu file");
      }
    };
  } catch (error) {
    console.error("Download exception:", error);
    Alert.alert("Lỗi", "Có lỗi khi tải file");
  }
};


  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const handleCategoryPress = (categoryId: string, title: string) => {
    console.log(`Selected category: ${title}`);
    setSelectedCategory(categoryId);
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category != undefined && !category?.hasSubcategories) {
      setCurrentView('subcategory');
      // For categories without subcategories, create a virtual subcategory
      setSelectedSubcategory({
        id: `${categoryId}-main`,
        title: category.title,
        icon: category.icon,
        description: category.description,
        parentId: categoryId,
        keyName: category.keyName,
      });
      // Load documents for this category
      loadDocuments(categoryId);
    } else if (category != undefined && category?.hasSubcategories) {
      // For categories with subcategories, show subcategory list
      setCurrentView('category');
    }
  };

  const handleSubcategoryPress = (subcategory: SubcategoryItem) => {
    setSelectedSubcategory(subcategory);
    setCurrentView('subcategory');
    // Load documents for this subcategory
    loadDocuments(selectedCategory!, subcategory.keyName);
  };

  const handleDrawerItemPress = (itemId: string) => {
    console.log(`Drawer item pressed: ${itemId}`);
    setIsDrawerOpen(false);
    
    switch (itemId) {
      case 'home':
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setCurrentView('home');
        setDocuments([]);
        setSearchResults([]);
        break;
      case 'settings':
        Alert.alert('Cài đặt', 'Chức năng đang phát triển');
        break;
      case 'logout':
        handleLogout();
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
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category?.hasSubcategories) {
        setCurrentView('category');
        setSelectedSubcategory(null);
        setDocuments([]);
      } else {
        setCurrentView('home');
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setDocuments([]);
      }
    } else if (currentView === 'category') {
      setCurrentView('home');
      setSelectedCategory(null);
      setDocuments([]);
    } else if (currentView === 'search') {
      setCurrentView('home');
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const getCurrentCategory = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    return category?.title || '';
  };

  const getCurrentSubcategory = () => {
    return selectedSubcategory?.title || '';
  };

  const canUpload = () => {
    if (currentView === 'home') return false;
    const category = categories.find(cat => cat.id === selectedCategory);
    return category?.allowUpload || false;
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

      {/* User Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Xin chào, {user.name}!</Text>
        <Text style={styles.welcomeSubtext}>Chọn danh mục để bắt đầu làm việc</Text>
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
            <Text style={styles.statNumber}>9</Text>
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

  // 5. Update the renderSubcategoryView to use improved document grid
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
    
    {canUpload() && (
      <View style={styles.uploadSection}>
        <TouchableOpacity 
          style={styles.uploadFloatingButton}
          onPress={() => setIsUploadModalOpen(true)}
        >
          <Icon name="upload" size={24} color="white" />
          <Text style={styles.uploadFloatingText}>Tải lên tài liệu</Text>
        </TouchableOpacity>
      </View>
    )}
    
    <View style={styles.documentsContainer}>
      <View style={styles.documentsHeader}>
        <Text style={styles.documentsTitle}>
          Tài liệu ({documents.length})
        </Text>
        <View style={styles.documentsStats}>
          <Text style={styles.documentsStatsText}>
            {documents.reduce((total, doc) => total + doc.file_size, 0) > 0 && 
              `${(documents.reduce((total, doc) => total + doc.file_size, 0) / (1024 * 1024)).toFixed(1)} MB`}
          </Text>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải tài liệu...</Text>
        </View>
      ) : documents.length > 0 ? (
        <View style={styles.enhancedDocumentsGrid}>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDownload={() => handleDownload(doc)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="folder" size={64} color="#cbd5e1" />
          <Text style={styles.emptyStateTitle}>Chưa có tài liệu</Text>
          <Text style={styles.emptyStateText}>
            Danh mục này chưa có tài liệu nào được tải lên
          </Text>
        </View>
      )}
    </View>
  </ScrollView>
);

  const renderSearchView = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.subcategoryHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="chevron-back" size={20} color="#667eea" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.subcategoryTitle}>Kết quả tìm kiếm</Text>
        <Text style={styles.subcategorySubtitle}>
          Từ khóa: "{searchQuery}" ({searchResults.length} kết quả)
        </Text>
      </View>
      
      <View style={styles.documentsContainer}>
        <Text style={styles.documentsTitle}>
          Tài liệu tìm thấy ({searchResults.length})
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.documentInfoGrid}>
            {searchResults.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDownload={() => handleDownload(doc)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.documentsPlaceholder}>
            Không tìm thấy tài liệu nào với từ khóa "{searchQuery}"
          </Text>
        )}
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
      {currentView === 'search' && renderSearchView()}

      {/* Animated Navigation Drawer */}
      <AnimatedDrawer
        isVisible={isDrawerOpen}
        onItemPress={handleDrawerItemPress}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleSearch}
      />

      {/* Upload Modal */}
      <UploadModal
        isVisible={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        category={getCurrentCategory()}
        subcategory={getCurrentSubcategory()}
        user={user}
        onUploadSuccess={() => {
          if (selectedCategory) {
            loadDocuments(selectedCategory, selectedSubcategory?.keyName);
          }
        }}
      />
    </SafeAreaView>
  );
}