// src/components/views/SubcategoryView.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { DocumentCard } from '../cards/DocumentCard';
import { Icon } from '../common/Icon';
import { documentService } from '../../services/documents';
import { Document } from '../../types/document';

interface SubcategoryViewProps {
  selectedSubcategory: any;
  selectedCategory: string | null;
  onBackPress: () => void;
  canUpload: boolean;
  onUploadPress: () => void;
}

export const SubcategoryView: React.FC<SubcategoryViewProps> = ({
  selectedSubcategory,
  selectedCategory,
  onBackPress,
  canUpload,
  onUploadPress,
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      loadDocuments();
    }
  }, [selectedCategory, selectedSubcategory]);

  const loadDocuments = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      const subcategoryTitle = selectedSubcategory && selectedSubcategory.title !== selectedSubcategory.title 
        ? selectedSubcategory.title 
        : undefined;
      const docs = await documentService.loadDocuments(selectedCategory, subcategoryTitle);
      setDocuments(docs);
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

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.subcategoryHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Icon name="chevron-back" size={20} color="#667eea" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.subcategoryTitle}>{selectedSubcategory?.title}</Text>
        <Text style={styles.subcategorySubtitle}>{selectedSubcategory?.description}</Text>
      </View>
      
      {canUpload && (
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadFloatingButton} onPress={onUploadPress}>
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
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
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
  subcategoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subcategorySubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
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
});