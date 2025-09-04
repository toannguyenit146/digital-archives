import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
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
import ApiService from '../../src/api/ApiService';
import { categories, documentSubcategories } from '../../src/constants/categories';
import { User } from '../../src/types';
import { styles } from '../styles';
import Icon from './Icon';

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
  const [documentTitle, setDocumentTitle] = useState("");
  const [authorName, setAuthorName] = useState("");

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn tệp");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Lỗi", "Vui lòng chọn tệp để tải lên");
      return;
    }

    if (!documentTitle.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên tài liệu");
      return;
    }

    if (!authorName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên tác giả");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get category/subcategory keys
      const categoryKey = categories.find(
        (cat) => cat.title === category
      )?.keyName;
      const subcategoryKey = documentSubcategories.find(
        (sub) => sub.title === subcategory
      )?.keyName;

      // Create FormData
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || "application/octet-stream",
        name: selectedFile.name,
      } as any);
      formData.append("title", documentTitle);
      formData.append("author", authorName);
      formData.append("category", categoryKey || "general");
      if (subcategoryKey) {
        formData.append("subcategory", subcategoryKey);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      console.log(
        "Uploading to category:",
        categoryKey,
        "subcategory:",
        subcategoryKey
      );
      const response = await ApiService.uploadDocument(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setUploading(false);
        Alert.alert("Thành công", "Tài liệu đã được tải lên thành công!", [
          {
            text: "OK",
            onPress: () => {
              setSelectedFile(null);
              setDocumentTitle("");
              setAuthorName("");
              setUploadProgress(0);
              onUploadSuccess?.();
              onClose();
            },
          },
        ]);
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      Alert.alert(
        "Lỗi",
        "Có lỗi xảy ra trong quá trình tải lên tài liệu:\n" + error
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentTitle("");
    setAuthorName("");
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.uploadModalOverlay}>
        <View style={styles.uploadModalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.uploadHeader}>
              <Text style={styles.uploadTitle}>Tải lên tài liệu</Text>
              <TouchableOpacity onPress={handleClose} disabled={uploading}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Location Info */}
            <View style={styles.uploadInfo}>
              <Text style={styles.uploadInfoLabel}>Vị trí lưu trữ:</Text>
              <Text style={styles.uploadInfoValue}>
                {category}{" "}
                {subcategory && subcategory !== category && `> ${subcategory}`}
              </Text>
            </View>

            {/* Uploader Info */}
            <View style={styles.uploaderInfo}>
              <Text style={styles.uploadInfoLabel}>Người tải lên:</Text>
              <Text style={styles.uploadInfoValue}>{user.name}</Text>
            </View>

            {/* Document Title Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tên tài liệu *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  !documentTitle.trim() && styles.textInputError
                ]}
                placeholder="Nhập tên tài liệu"
                value={documentTitle}
                onChangeText={setDocumentTitle}
                editable={!uploading}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Author Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tác giả *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  !authorName.trim() && styles.textInputError
                ]}
                placeholder="Nhập tên tác giả"
                value={authorName}
                onChangeText={setAuthorName}
                editable={!uploading}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* File Picker */}
            <TouchableOpacity
              style={[
                styles.filePickerButton,
                uploading && styles.filePickerButtonDisabled
              ]}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Icon name="folder" size={20} color={uploading ? "#9ca3af" : "#667eea"} />
              <Text style={[
                styles.filePickerText,
                uploading && styles.filePickerTextDisabled
              ]}>
                {selectedFile ? "Chọn tệp khác" : "Chọn tệp từ máy"}
              </Text>
            </TouchableOpacity>

            {/* Selected File Info */}
            {selectedFile && (
              <View style={styles.selectedFileInfo}>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>Tên tệp:</Text>
                  <Text style={styles.fileInfoValue} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>Kích thước:</Text>
                  <Text style={styles.fileInfoValue}>
                    {selectedFile.size ? formatFileSize(selectedFile.size) : "N/A"}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>Loại tệp:</Text>
                  <Text style={styles.fileInfoValue} numberOfLines={1}>
                    {selectedFile.mimeType || "N/A"}
                  </Text>
                </View>
              </View>
            )}

            {/* Upload Progress */}
            {uploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${uploadProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(uploadProgress)}% - Đang tải lên...
                </Text>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={[
                styles.uploadButton,
                (!selectedFile ||
                  !documentTitle.trim() ||
                  !authorName.trim() ||
                  uploading) &&
                  styles.uploadButtonDisabled,
              ]}
              onPress={handleUpload}
              disabled={
                !selectedFile ||
                !documentTitle.trim() ||
                !authorName.trim() ||
                uploading
              }
            >
              {uploading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.uploadButtonText}>Đang tải lên...</Text>
                </>
              ) : (
                <>
                  <Icon name="upload" size={20} color="white" />
                  <Text style={styles.uploadButtonText}>Tải lên tài liệu</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default UploadModal;