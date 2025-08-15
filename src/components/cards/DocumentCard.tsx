// src/components/cards/DocumentCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Icon } from '../common/Icon';
import { Document } from '../../types/document';

interface DocumentCardProps {
  document: Document;
  onDownload: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDownload }) => {
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

const styles = StyleSheet.create({
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
});