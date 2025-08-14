// First, install required dependencies:
// npm install @supabase/supabase-js expo-secure-store

import React, { useRef, useState, useEffect } from 'react';
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
  View,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

// Supabase configuration
const supabaseUrl = 'https://fnfolijesketyasmmplq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZm9saWplc2tldHlhc21tcGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NzQ2MjEsImV4cCI6MjA3MDQ1MDYyMX0.j73Hx7cEdH5QISIXsgDvVy7RBdazJ1TysQejLt2OoIU';

const supabase = createClient(supabaseUrl, supabaseKey);

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

interface CategoryItem {
  id: string;
  title: string;
  color: string;
  icon: string;
  description: string;
  hasSubcategories?: boolean;
  allowUpload?: boolean;
  keyName: string;
}

interface SubcategoryItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  parentId: string;
  keyName: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  role?: string;
}

interface Document {
  id: string;
  title: string;
  filename: string;
  author: string;
  category: string;
  subcategory?: string;
  uploadedAt: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
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
    description: 'Hạ sĩ quan và binh sĩ luân phiên',
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
  { id: '1-11', title: 'Video', icon: 'video', description: 'Tài liệu video', parentId: '1', keyName: 'lich' },
];

const LoginScreen: React.FC<{
  onLogin: (user: User) => void;
}> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userData = await SecureStore.getItemAsync('userData');
      
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
      // Query user from Supabase
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password.trim())
        .single();

      setLoading(false);

      if (error || !users) {
        Alert.alert('Lỗi đăng nhập', 'Tên đăng nhập hoặc mật khẩu không đúng');
        return;
      }

      const user: User = {
        id: users.id,
        username: users.username,
        name: users.full_name,
        role: users.role || 'User',
      };

      // Store session
      await SecureStore.setItemAsync('userToken', `token_${users.id}`);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));

      onLogin(user);
    } catch (error) {
      setLoading(false);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình đăng nhập');
    }
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

const DocumentCard: React.FC<{
  document: Document;
  onDownload: () => void;
}> = ({ document, onDownload }) => {
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

  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Icon name="document-text" size={24} color="#667eea" />
        <Text style={styles.documentTitle} numberOfLines={2}>{document.title}</Text>
      </View>
      
      <View style={styles.documentInfo}>
        <Text style={styles.documentInfoText}>Tác giả: {document.author}</Text>
        <Text style={styles.documentInfoText}>Tải lên: {formatDate(document.uploadedAt)}</Text>
        <Text style={styles.documentInfoText}>Kích thước: {formatFileSize(document.fileSize)}</Text>
      </View>
      
      <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
        <Icon name="download" size={16} color="white" />
        <Text style={styles.downloadButtonText}>Tải xuống</Text>
      </TouchableOpacity>
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
      // Upload file to Supabase Storage
      const keyNameCategory = categories.find(cat => cat.title === category)?.keyName;
      const keyNameSubCategory = documentSubcategories.find(cat => cat.title === subcategory)?.keyName;
      console.log(`Selected sub category: ${keyNameSubCategory}`);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${keyNameCategory}/${keyNameSubCategory || 'general'}/${fileName}`;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType,
        name: selectedFile.name,
      } as any);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      console.log(selectedFile.type);
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: true,
        });

      clearInterval(progressInterval);
      setUploadProgress(100);
      console.log(`File path: ${filePath}`);
      if (uploadError) {
        console.log(`Upload error: ${uploadError}`);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log(`URL data: ${urlData}`);
      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          title: documentTitle,
          filename: selectedFile.name,
          author: authorName,
          category: keyNameCategory,
          subcategory: keyNameSubCategory || null,
          file_url: urlData.publicUrl,
          file_size: selectedFile.size || 0,
          file_type: selectedFile.mimeType || 'application/octet-stream',
        });

      if (dbError) {
        throw dbError;
      }

      setUploading(false);
      Alert.alert(
        'Thành công', 
        'Tài liệu đã được tải lên thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedFile(null);
              setDocumentTitle('');
              setAuthorName('');
              setUploadProgress(0);
              onUploadSuccess();
              onClose();
            }
          }
        ]
      );

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      Alert.alert('Lỗi ' + error, 'Có lỗi xảy ra trong quá trình tải lên tài liệu');
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

export default function EnhancedDigitalArchivesV3() {
  const [user, setUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubcategoryItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'subcategory'>('home');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Đăng xuất', 
        onPress: async () => {
          try {
            // Clear stored session
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
            
            // Reset app state
            setUser(null);
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            setCurrentView('home');
            setDocuments([]);
          } catch (error) {
            console.log('Error during logout:', error);
          }
        }
      }
    ]);
  };

  const loadDocuments = async (categoryId: string, subcategoryId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('documents')
        .select(`
          id,
          title,
          filename,
          author,
          category,
          subcategory,
          created_at,
          file_url,
          file_size,
          file_type
        `)
        .eq('category', categoryId);

      if (subcategoryId) {
        query = query.eq('subcategory', subcategoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedDocuments: Document[] = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        filename: doc.filename,
        author: doc.author,
        category: doc.category,
        subcategory: doc.subcategory,
        uploadedAt: doc.created_at,
        fileUrl: doc.file_url,
        fileSize: doc.file_size,
        fileType: doc.file_type,
      }));

      setDocuments(formattedDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
    setLoading(false);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      // For web, open in new tab
      if (Platform.OS === 'web') {
        window.open(document.fileUrl, '_blank');
      } else {
        // For mobile, you would typically use expo-file-system or similar
        Alert.alert('Tải xuống', `Đang tải xuống: ${document.title}`);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải xuống tệp');
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const handleCategoryPress = (categoryId: string, title: string) => {
    console.log(`Selected category: ${title}`);
    setSelectedCategory(categoryId);
    
    const category = categories.find(cat => cat.id === categoryId);
    if (category && !category?.hasSubcategories) {
      setCurrentView('subcategory');
      setSelectedSubcategory({
        id: `${categoryId}-main`,
        title: category.title,
        icon: category.icon,
        description: category.description,
        parentId: categoryId,
        keyName: category.keyName,
      });
      loadDocuments(categoryId);
    } else if (category) {
      setCurrentView('category');
    }
  };

  const handleSubcategoryPress = (subcategory: SubcategoryItem) => {
    console.log(`Selected sub category: ${subcategory.title}`);
    setSelectedSubcategory(subcategory);
    setCurrentView('subcategory');
    loadDocuments(subcategory.parentId, subcategory.title);
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
    return user.username === 'bantuyenhuan' && currentView !== 'home';
  };

  const handleUploadSuccess = () => {
    // Reload documents after successful upload
    if (selectedCategory) {
      const subcategoryTitle = selectedSubcategory && selectedSubcategory.title !== getCurrentCategory() 
        ? selectedSubcategory.title 
        : undefined;
      loadDocuments(selectedCategory, subcategoryTitle);
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
            <Text style={styles.statNumber}>{categories.length}</Text>
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
        <Text style={styles.documentsTitle}>Tài liệu trong danh mục</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Đang tải tài liệu...</Text>
          </View>
        ) : documents.length > 0 ? (
          <View style={styles.documentsGrid}>
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDownload={() => handleDownloadDocument(doc)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.documentsPlaceholder}>Chưa có tài liệu nào</Text>
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
      />

      {/* Upload Modal - Only for bantuyenhuan */}
      {canUpload() && (
        <UploadModal
          isVisible={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          category={getCurrentCategory()}
          subcategory={getCurrentSubcategory()}
          user={user}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Login Screen Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  loginForm: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoCredentials: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 5,
  },
  demoText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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
  welcomeSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#64748b',
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
    marginBottom: 15,
  },
  documentsPlaceholder: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 10,
  },
  documentsGrid: {
    gap: 15,
  },
  // Document Card Styles
  documentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 10,
    flex: 1,
  },
  documentInfo: {
    marginBottom: 12,
  },
  documentInfoText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 3,
  },
  downloadButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
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
  },
  uploadModalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  uploadModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
    marginBottom: 15,
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
  uploaderInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filePickerButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#667eea',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  filePickerText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  selectedFileInfo: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  fileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fileInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  fileInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
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
  uploadButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});