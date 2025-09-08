import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ApiService from "../../src/api/ApiService";
import AnimatedDrawer from "../../src/components/AnimatedDrawer";
import CategoryCard from "../../src/components/CategoryCard";
import DocumentCard from "../../src/components/DocumentCard";
import FileManager from "../../src/components/FileManager";
import Icon from "../../src/components/Icon";
import SearchModal from "../../src/components/SearchModal";
import SubcategoryCard from "../../src/components/SubcategoryCard";
import UploadModal from "../../src/components/UploadModal";
import { categories, documentSubcategories } from "../../src/constants/categories";
import LoginScreen from "../../src/screens/LoginScreen";
import StorageOS from "../../src/storage/StorageOS";
import { styles } from "../../src/styles";
import { Document, FileSystemItem, SubcategoryItem, User } from "../../src/types";

// API Configuration - Change this to your backend server URL
const API_BASE_URL = "http://192.168.0.109:3000/api"; // For development
// const API_BASE_URL = 'http://YOUR_SERVER_IP:3000/api'; // For production

export default function EnhancedDigitalArchivesV4() {
  const [user, setUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SubcategoryItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<
    "home" | "category" | "subcategory" | "search"
  >("home");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FileSystemItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

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
      setCurrentView("home");
      setDocuments([]);
      setSearchResults([]);
    } else {
      Alert.alert("Đăng xuất", "Bạn có muốn đăng xuất?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              // Clear stored session
              await StorageOS.deleteItem("authToken");
              await StorageOS.deleteItem("userData");

              // Reset app state
              setUser(null);
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setCurrentView("home");
              setDocuments([]);
              setSearchResults([]);
            } catch (error) {
              console.log("Error during logout:", error);
            }
          },
        },
      ]);
    }
  };

  const loadDocuments = async (categoryId: string, subcategoryId?: string) => {
    setLoading(true);
    try {
      const category = categories.find((cat) => cat.id === categoryId);
      const subcategory = documentSubcategories.find(
        (sub) => sub.keyName === subcategoryId
      );

      const response = await ApiService.getFolderContents(
        currentFolderId,
        category?.keyName || subcategory?.keyName
      );

      if (response.success) {
        setDocuments(response.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
      Alert.alert("Lỗi", "Không thể tải danh sách tài liệu");
    }
    setLoading(false);
  };

  const handleSearch = async (query: string, category: string) => {
    setSearchQuery(query);
    setLoading(true);
    setCurrentView("search");

    try {
      const response = await ApiService.searchFiles(
        query,
        category
      );

      if (response.success) {
        setSearchResults(response.documents);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      Alert.alert("Lỗi", "Không thể thực hiện tìm kiếm");
    }
    setLoading(false);
  };

  const handleDownload = async (fileSystemItem: FileSystemItem) => {
    try {
      const token = await StorageOS.getItem("authToken");
      if (!token) {;
        return;
      }
      // Gọi API download với Authorization header
      const response = await fetch(
        `${API_BASE_URL}/file-system/${fileSystemItem.id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
          let fileName = fileSystemItem.name;
          if (!fileName.includes(".") && fileSystemItem.file_type) {
            const ext = fileSystemItem.file_type.split("/")[1];
            fileName = `${fileName}.${ext}`;
          }

          if (Platform.OS === "android") {
            // Xin quyền thư mục Download
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
              Alert.alert("Thông báo", "Không có quyền truy cập bộ nhớ");
              return;
            }

            // Tạo file trong thư mục Download và ghi nội dung
            const uri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              fileSystemItem.file_type || "application/octet-stream"
            );
            await FileSystem.writeAsStringAsync(uri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert(
              "Thành công ✅",
              `Đã lưu file vào Download: ${fileName}`
            );
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
    console.log(`Selected category: ${categoryId} - ${title}`);
    setSelectedCategory(categoryId);

    const category = categories.find((cat) => cat.id === categoryId);
    console.log("Category details:", category);
    if (category != undefined && category?.hasSubcategories == "false") {
      // Load documents for this category
      loadDocuments(categoryId);
      setCurrentView("subcategory");
    } else if (category != undefined && category?.hasSubcategories == "true") {
      // For categories with subcategories, show subcategory list
      setCurrentView("category");
    }
  };

  const handleSubcategoryPress = (subcategory: SubcategoryItem) => {
    setCurrentFolderId(subcategory.id);
    setSelectedSubcategory(subcategory);
    setCurrentView("subcategory");
    // Load documents for this subcategory
    loadDocuments(selectedCategory!, subcategory.keyName);
  };

  const handleDrawerItemPress = (itemId: string) => {
    console.log(`Drawer item pressed: ${itemId}`);
    setIsDrawerOpen(false);

    switch (itemId) {
      case "home":
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setCurrentView("home");
        setDocuments([]);
        setSearchResults([]);
        break;
      case "settings":
        Alert.alert("Cài đặt", "Chức năng đang phát triển");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        const category = categories.find((cat) => cat.id === itemId);
        if (category) {
          handleCategoryPress(itemId, category.title);
        }
        break;
    }
  };

  const handleBackPress = () => {
    if (currentView === "subcategory") {
      const category = categories.find((cat) => cat.id === selectedCategory);
      if (category?.hasSubcategories) {
        setCurrentView("category");
        setSelectedSubcategory(null);
        setDocuments([]);
      } else {
        setCurrentView("home");
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setDocuments([]);
      }
    } else if (currentView === "category") {
      setCurrentView("home");
      setSelectedCategory(null);
      setDocuments([]);
    } else if (currentView === "search") {
      setCurrentView("home");
      setSearchResults([]);
      setSearchQuery("");
    }
  };

  const getCurrentCategory = () => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.title || "";
  };

  const getCurrentSubcategory = () => {
    return selectedSubcategory?.title || "";
  };

  const canUpload = () => {
    if (currentView === "home") return "false";
    const category = categories.find((cat) => cat.id === selectedCategory);
    return category?.allowUpload || "false";
  };

  const renderHomeView = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View
          style={[styles.headerBackground, { backgroundColor: "#667eea" }]}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Digital Archives</Text>
          <Text style={styles.headerSubtitle}>
            Hệ thống quản lý tài liệu số
          </Text>
        </View>
      </View>

      {/* User Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Xin chào, {user.name}!</Text>
        <Text style={styles.welcomeSubtext}>
          Chọn danh mục để bắt đầu làm việc
        </Text>
      </View>

      {/* Categories Grid */}
      <View style={styles.categoriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục chính</Text>
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
    const category = categories.find((cat) => cat.id === selectedCategory);

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.subcategoryHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="chevron-back" size={20} color="#667eea" />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.subcategoryTitle}>{category?.title}</Text>
          <Text style={styles.subcategorySubtitle}>
            Chọn danh mục con để xem chi tiết
          </Text>
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
  <FileManager
    category={selectedCategory!}
    categoryName={getCurrentCategory()}
    onFileDownload={handleDownload}
    canUpload={canUpload()}
    onUploadRequest={(folderId) => {
      setCurrentFolderId(selectedCategory);
      setIsUploadModalOpen(true);
    }}
    currentFolderId={selectedCategory}
    onFolderChange={(folderId) => setCurrentFolderId(selectedCategory)}
    onNavigateHome={() => {
      // Navigate về home
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setCurrentView("home");
      setCurrentFolderId(null);
      setDocuments([]);
      setSearchResults([]);
    }}
  />
);

  const renderSearchView = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
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
              <Text style={styles.notificationBadgeText}>7</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content based on current view */}
      {currentView === "home" && renderHomeView()}
      {currentView === "category" && renderCategoryView()}
      {currentView === "subcategory" && renderSubcategoryView()}
      {currentView === "search" && renderSearchView()}

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
        folderId={selectedCategory} // Truyền folderId vào
        onUploadSuccess={() => {
          // Refresh FileManager content
          if (selectedCategory) {
            // FileManager sẽ tự động refresh khi props thay đổi
            loadDocuments(selectedCategory, selectedSubcategory?.keyName);
          }
        }}
      />
    </SafeAreaView>
  );
}
