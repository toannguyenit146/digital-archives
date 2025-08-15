// src/components/modals/UploadModal.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Icon } from '../common/Icon';
import { User } from '../../types/auth';
import { supabase } from '../../services/auth';
import { documentService } from '../../services/documents';
import { categories } from '../../data/categories';
import { documentSubcategories } from '../../data/subcategories';
import mime from 'mime';

interface UploadModalProps {
  isVisible: boolean;
  onClose: () => void;
  category: string;
  subcategory?: string;
  user: User;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isVisible,
  onClose,
  category,
  subcategory,
  user,
  onUploadSuccess,
}) => {
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
      // Category / Subcategory
      const keyNameCategory = categories.find(cat => cat.title === category)?.keyName;
      const keyNameSubCategory = documentSubcategories.find(cat => cat.title === subcategory)?.keyName;

      // Extension & MIME type auto detect
      const fileExt = selectedFile.name?.split('.').pop()?.toLowerCase() || '';
      const mimeType = selectedFile.mimeType || selectedFile.type || mime.getType(fileExt) || 'application/octet-stream';

      // Create file name & path
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${keyNameCategory}/${keyNameSubCategory || 'general'}/${fileName}`;

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Convert file URI to Blob
      const fileResponse = await fetch(selectedFile.uri);
      const fileBlob = await fileResponse.blob();

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBlob, {
          contentType: mimeType,
          upsert: true,
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);

      // Save to database
      await documentService.uploadDocument({
        title: documentTitle,
        filename: selectedFile.name,
        author: authorName,
        category: keyNameCategory || '',
        subcategory: keyNameSubCategory || undefined,
        fileUrl: urlData.publicUrl,
        fileSize: selectedFile.size || 0,
        fileType: mimeType,
      });

      setUploading(false);
      Alert.alert('Thành công', 'Tài liệu đã được tải lên thành công!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedFile(null);
            setDocumentTitle('');
            setAuthorName('');
            setUploadProgress(0);
            onUploadSuccess();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      setUploading(false);
      setUploadProgress(0);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình tải lên tài liệu:\n' + error.message);
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

const styles = StyleSheet.create({
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