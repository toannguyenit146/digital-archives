import ApiService from "@/src/api/ApiService";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
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
import { FileSystemItem, SubcategoryItem, User } from "../../src/types";

// API Configuration - Change this to your backend server URL
const API_BASE_URL = "http://:3000/api"; // For development

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
  const [searchResults, setSearchResults] = useState<FileSystemItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleApiError = async (error: any) => {
    if (error.message === "UNAUTHORIZED OR FORBIDDEN") {
      Alert.alert("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại");
      await StorageOS.deleteItem("authToken");
      await StorageOS.deleteItem("userData");
      setUser(null); // quay lại LoginScreen
    } else {
      console.error(error);
    }
  };

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
      setSearchResults([]);
    } else {
      Alert.alert("Đăng xuất", "Bạn có muốn đăng xuất?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              await StorageOS.deleteItem("authToken");
              await StorageOS.deleteItem("userData");

              setUser(null);
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              setCurrentView("home");
              setSearchResults([]);
            } catch (error) {
              console.log("Error during logout:", error);
            }
          },
        },
      ]);
    }
  };

  const handleSearch = async (query: string, category: string) => {
    setSearchQuery(query);
    setCurrentView("search");

    try {
      const response = await ApiService.searchFiles(query, category);
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
  };

  const handleDownload = async (fileSystemItem: FileSystemItem) => {
    try {
      const token = await StorageOS.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/file-system/${fileSystemItem.id}/download`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Download failed");
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(",")[1];
          let fileName = fileSystemItem.name;
          if (!fileName.includes(".") && fileSystemItem.file_type) {
            const ext = fileSystemItem.file_type.split("/")[1];
            fileName = `${fileName}.${ext}`;
          }

          if (Platform.OS === "android") {
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
              Alert.alert("Thông báo", "Không có quyền truy cập bộ nhớ");
              return;
            }

            const uri = await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              fileName,
              fileSystemItem.file_type || "application/octet-stream"
            );
            await FileSystem.writeAsStringAsync(uri, base64data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert("Thành công ✅", `Đã lưu file vào Download: ${fileName}`);
          } else {
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
      await handleApiError(error);
      Alert.alert("Lỗi", "Có lỗi khi tải file");
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const handleCategoryPress = (categoryId: string, title: string) => {
    setSelectedCategory(categoryId);
    const category = categories.find((cat) => cat.id === categoryId);

    if (category?.hasSubcategories === "false") {
      setCurrentFolderId(categoryId);
      setCurrentView("subcategory");
    } else if (category?.hasSubcategories === "true") {
      setCurrentView("category");
    }
  };

  const handleSubcategoryPress = (subcategory: SubcategoryItem) => {
    setCurrentFolderId(subcategory.id);
    setSelectedSubcategory(subcategory);
    setCurrentView("subcategory");
  };

  const handleDrawerItemPress = (itemId: string) => {
    setIsDrawerOpen(false);

    switch (itemId) {
      case "home":
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setCurrentView("home");
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
      } else {
        setCurrentView("home");
        setSelectedCategory(null);
        setSelectedSubcategory(null);
      }
    } else if (currentView === "category") {
      setCurrentView("home");
      setSelectedCategory(null);
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
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
    >
      {/* Header */}
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

      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Xin chào, {user.name}!</Text>
        <Text style={styles.welcomeSubtext}>
          Chọn danh mục để bắt đầu làm việc
        </Text>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục chính</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {categories.map((item) => (
            <View key={item.id} style={styles.categoryWrapper}>
              <CategoryCard
                item={item}
                onPress={() => handleCategoryPress(item.id, item.title)}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderCategoryView = () => {
    const category = categories.find((cat) => cat.id === selectedCategory);

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
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
    <View style={{ flex: 1, paddingBottom: 80 }}>
      <FileManager
        category={selectedCategory!}
        categoryName={getCurrentCategory()}
        onFileDownload={handleDownload}
        canUpload={canUpload()}
        onUploadRequest={(folderId) => {
          setCurrentFolderId(folderId);
          setIsUploadModalOpen(true);
        }}
        currentFolderId={currentFolderId}
        onFolderChange={(folderId) => setCurrentFolderId(folderId)}
        onNavigateHome={() => {
          setSelectedCategory(null);
          setSelectedSubcategory(null);
          setCurrentView("home");
          setCurrentFolderId(null);
        }}
        refreshTrigger={refreshTrigger}   // 🔥 truyền prop này
      />
    </View>
  );

  const renderSearchView = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
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

        {searchResults.length > 0 ? (
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
      <View style={{ flex: 1 }}>
        {currentView === "home" && renderHomeView()}
        {currentView === "category" && renderCategoryView()}
        {currentView === "subcategory" && renderSubcategoryView()}
        {currentView === "search" && renderSearchView()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setIsDrawerOpen(true)}
        >
          <Icon name="menu" size={24} color="white" />
          <Text style={styles.bottomNavText}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => handleDrawerItemPress("home")}
        >
          <Icon
            name="home"
            size={24}
            color={currentView === "home" ? "#FFD700" : "white"}
          />
          <Text
            style={[
              styles.bottomNavText,
              currentView === "home" && { color: "#FFD700" },
            ]}
          >
            Trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setIsSearchModalOpen(true)}
        >
          <Icon name="search" size={24} color="white" />
          <Text style={styles.bottomNavText}>Tìm kiếm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => {}}
        >
          <View style={{ position: "relative" }}>
            <Icon name="notifications" size={24} color="white" />
            <View style={styles.bottomNavBadge}>
              <Text style={styles.bottomNavBadgeText}>7</Text>
            </View>
          </View>
          <Text style={styles.bottomNavText}>Thông báo</Text>
        </TouchableOpacity>
      </View>

      {/* Drawer */}
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
        folderId={currentFolderId}
        onUploadSuccess={() => {
          setRefreshTrigger(prev => prev + 1); // 🔥 kích hoạt reload
        }}
      />
    </SafeAreaView>
  );
}
