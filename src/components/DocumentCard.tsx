import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../src/styles';
import { Document } from '../../src/types';
import Icon from './Icon';

const DocumentCard: React.FC<{
  document: Document;
  onDownload: () => void;
}> = ({ document, onDownload }) => {
  const [downloading, setDownloading] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getFileTypeIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("doc")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "📺";
    if (type.includes("image") || type.includes("jpg") || type.includes("png"))
      return "🖼️";
    if (type.includes("video") || type.includes("mp4") || type.includes("avi"))
      return "🎥";
    if (type.includes("audio") || type.includes("mp3") || type.includes("wav"))
      return "🎵";
    if (type.includes("zip") || type.includes("rar")) return "🗜️";
    return "📁";
  };

  const getCategoryColor = (category: string) => {
    const categoryColors = {
      tailieu: "#4A90E2",
      kienthucthuongtruc: "#7ED321",
      doituongsqvaqncn: "#F5A623",
      doituonghltpd: "#FF6B6B",
      hasiquanvabinhsi: "#D0021B",
      dangvienvadangvienmoi: "#9013FE",
      doituongdoanvien: "#50E3C2",
      cauhoikienthucgdct: "#B8E986",
      cauhoikienthucphapluat: "#4BD5EA",
    };
    return categoryColors[category as keyof typeof categoryColors] || "#667eea";
  };

  return (
    <View style={styles.enhancedDocumentCard}>
      {/* Header with file type and category indicator */}
      <View style={styles.documentCardHeader}>
        <View style={styles.fileTypeContainer}>
          <Text style={styles.fileTypeIcon}>
            {getFileTypeIcon(document.file_type)}
          </Text>
          <Text style={styles.fileTypeText}>
            {document.file_type.split("/")[1]?.toUpperCase() || "FILE"}
          </Text>
        </View>
        <View
          style={[
            styles.categoryIndicator,
            { backgroundColor: getCategoryColor(document.category) },
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
          <Text style={styles.infoText} numberOfLines={1}>
            {document.author}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="history" size={14} color="#64748b" />
          <Text style={styles.infoText}>{formatDate(document.created_at)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="document-text" size={14} color="#64748b" />
          <Text style={styles.infoText}>
            {formatFileSize(document.file_size)}
          </Text>
        </View>
        {document.uploader_name && (
          <View style={styles.infoItem}>
            <Icon name="upload" size={14} color="#64748b" />
            <Text style={styles.infoText} numberOfLines={1}>
              {document.uploader_name}
            </Text>
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
export default DocumentCard;
