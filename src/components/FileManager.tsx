// src/components/FileManager.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ApiService from '../api/ApiService';
import { styles } from '../styles';
import { BreadcrumbItem, FileManagerProps, FileSystemItem } from '../types';
import Icon from './Icon';

const FileManager: React.FC<FileManagerProps> = ({
  category,
  categoryName,
  onFileDownload,
  canUpload,
  onUploadRequest,
}) => {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Modals
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [renameItemId, setRenameItemId] = useState<string | null>(null);

  useEffect(() => {
    loadFolderContents();
    loadBreadcrumb();
  }, [currentFolderId, category]);

  const loadFolderContents = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getFolderContents(currentFolderId, category);
      if (response.success) {
        setItems(response.items || []);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải nội dung thư mục');
    }
    setLoading(false);
  };

  const loadBreadcrumb = async () => {
    try {
      const response = await ApiService.getBreadcrumb(currentFolderId);
      if (response.success) {
        setBreadcrumb([
          { id: null, name: categoryName, path: `/${categoryName}` },
          ...response.breadcrumb
        ]);
      }
    } catch (error) {
      console.error('Error loading breadcrumb:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const response = await ApiService.createFolder(
        newFolderName.trim(),
        currentFolderId,
        category
      );
      if (response.success) {
        setNewFolderName('');
        setShowCreateFolder(false);
        loadFolderContents();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo thư mục mới');
    }
  };

  const handleRename = async () => {
    if (!renameValue.trim() || !renameItemId) return;
    
    try {
      const response = await ApiService.renameItem(renameItemId, renameValue.trim());
      if (response.success) {
        setRenameValue('');
        setRenameItemId(null);
        setShowRename(false);
        loadFolderContents();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đổi tên');
    }
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${itemName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteItem(itemId);
              if (response.success) {
                loadFolderContents();
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa mục này');
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
    } else {
      onFileDownload(item);
    }
  };

  const handleBreadcrumbPress = (breadcrumbItem: BreadcrumbItem) => {
    setCurrentFolderId(breadcrumbItem.id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getFileIcon = (item: FileSystemItem) => {
    if (item.type === 'folder') return '📁';
    
    const fileType = item.file_type?.toLowerCase() || '';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    return '📄';
  };

  return (
    <View style={styles.fileManagerContainer}>
      {/* Toolbar */}
      <View style={styles.fileManagerToolbar}>
        <View style={styles.toolbarLeft}>
          {canUpload && (
            <>
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={() => setShowCreateFolder(true)}
              >
                <Icon name="folder" size={20} color="#667eea" />
                <Text style={styles.toolbarButtonText}>Tạo thư mục</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={() => onUploadRequest(currentFolderId)}
              >
                <Icon name="upload" size={20} color="#667eea" />
                <Text style={styles.toolbarButtonText}>Tải lên</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <View style={styles.toolbarRight}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'list' && styles.viewModeActive
            ]}
            onPress={() => setViewMode('list')}
          >
            <Icon name="list" size={20} color={viewMode === 'list' ? '#667eea' : '#64748b'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'grid' && styles.viewModeActive
            ]}
            onPress={() => setViewMode('grid')}
          >
            <Icon name="grid" size={20} color={viewMode === 'grid' ? '#667eea' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Breadcrumb */}
      <ScrollView
        horizontal
        style={styles.breadcrumbContainer}
        showsHorizontalScrollIndicator={false}
      >
        {breadcrumb.map((item, index) => (
          <TouchableOpacity
            key={item.id || 'root'}
            style={styles.breadcrumbItem}
            onPress={() => handleBreadcrumbPress(item)}
          >
            <Text style={styles.breadcrumbText}>{item.name}</Text>
            {index < breadcrumb.length - 1 && (
              <Icon name="chevron-forward" size={14} color="#64748b" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* File List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <ScrollView style={styles.fileList}>
          {items.length === 0 ? (
            <View style={styles.emptyFolder}>
              <Icon name="folder" size={64} color="#cbd5e1" />
              <Text style={styles.emptyFolderText}>Thư mục trống</Text>
            </View>
          ) : (
            <View style={viewMode === 'grid' ? styles.fileGrid : styles.fileListView}>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={viewMode === 'grid' ? styles.fileGridItem : styles.fileListItem}
                  onPress={() => handleItemPress(item)}
                  onLongPress={() => {
                    // Show context menu
                    Alert.alert(
                      item.name,
                      'Chọn hành động',
                      [
                        { text: 'Hủy', style: 'cancel' },
                        {
                          text: 'Đổi tên',
                          onPress: () => {
                            setRenameItemId(item.id);
                            setRenameValue(item.name);
                            setShowRename(true);
                          },
                        },
                        {
                          text: 'Xóa',
                          style: 'destructive',
                          onPress: () => handleDelete(item.id, item.name),
                        },
                      ]
                    );
                  }}
                >
                  <View style={styles.fileItemIcon}>
                    <Text style={styles.fileIcon}>{getFileIcon(item)}</Text>
                  </View>
                  
                  <View style={styles.fileItemDetails}>
                    <Text style={styles.fileItemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    
                    {viewMode === 'list' && (
                      <View style={styles.fileItemMeta}>
                        <Text style={styles.fileItemMetaText}>
                          {formatDate(item.created_at)}
                        </Text>
                        {item.type === 'file' && item.file_size && (
                          <Text style={styles.fileItemMetaText}>
                            {formatFileSize(item.file_size)}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  
                  {item.type === 'folder' && (
                    <Icon name="chevron-forward" size={16} color="#64748b" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Create Folder Modal */}
      <Modal
        visible={showCreateFolder}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateFolder(false)}
      >
        <View style={styles.modalOverlayFolder}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo thư mục mới</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Tên thư mục"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCreateFolder(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCreateFolder}
              >
                <Text style={styles.modalConfirmText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={showRename}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRename(false)}
      >
        <View style={styles.modalOverlayFolder}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi tên</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Tên mới"
              value={renameValue}
              onChangeText={setRenameValue}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRename(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleRename}
              >
                <Text style={styles.modalConfirmText}>Đổi tên</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FileManager;