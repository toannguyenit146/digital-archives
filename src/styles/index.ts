import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
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
      boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
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
      boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
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
      marginBottom: 15,
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
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      marginBottom: 5,
    },
    headerSubtitle: {
      fontSize: 16,
      fontStyle: 'italic',
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
      marginBottom: 0,
    },
    welcomeSection: {
      backgroundColor: 'white',
      marginHorizontal: 15,
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
      boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
    },
    welcomeText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 5,
    },
    welcomeSubtext: {
      fontSize: 14,
      fontStyle: 'italic',
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
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 5,
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
      boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
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
      boxShadow: "0px 1px 2.22px rgba(0,0,0,0.22)",
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
      boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
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
      boxShadow: "0px 2px 4px rgba(0,0,0,0.25)",
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
      marginBottom: 10,
    },
    documentsPlaceholder: {
      fontSize: 14,
      color: '#64748b',
      textAlign: 'center',
      paddingVertical: 30,
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
      boxShadow: "2px 0px 3.84px rgba(0,0,0,0.25)",
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
    // Upload Modal Styles - Updated and Complete
    uploadModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    uploadModalContent: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxHeight: '90%',
      elevation: 8,
      boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
    },
    uploadHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    uploadTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    uploadInfo: {
      backgroundColor: '#f8fafc',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    uploadInfoLabel: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 5,
      fontWeight: '500',
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
      borderWidth: 1,
      borderColor: '#e0f2fe',
    },
    // Input Section Styles
    inputSection: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: '#1e293b',
      backgroundColor: 'white',
      minHeight: 48,
    },
    textInputFocused: {
      borderColor: '#667eea',
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    },
    textInputError: {
      borderColor: '#ef4444',
      backgroundColor: '#fef2f2',
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
      minHeight: 80,
      justifyContent: 'center',
    },
    filePickerButtonDisabled: {
      borderColor: '#d1d5db',
      backgroundColor: '#f9fafb',
      opacity: 0.6,
    },
    filePickerText: {
      color: '#667eea',
      fontSize: 16,
      fontWeight: '600',
      marginTop: 10,
    },
    filePickerTextDisabled: {
      color: '#9ca3af',
    },
    selectedFileInfo: {
      backgroundColor: '#f1f5f9',
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    fileInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    fileInfoLabel: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: '500',
      minWidth: 80,
    },
    fileInfoValue: {
      fontSize: 14,
      color: '#1e293b',
      flex: 1,
      textAlign: 'right',
      marginLeft: 10,
      fontWeight: '500',
    },
    progressContainer: {
      marginBottom: 20,
      padding: 15,
      backgroundColor: '#f8fafc',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    progressBar: {
      height: 8,
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
      marginBottom: 10,
      overflow: 'hidden',
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
      fontWeight: '500',
    },
    uploadButton: {
      backgroundColor: '#667eea',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: 15,
      marginTop: 0,
      minHeight: 30,
      elevation: 2,
      boxShadow: "0px 2px 4px rgba(102, 126, 234, 0.2)",
    },
    uploadButtonDisabled: {
      backgroundColor: '#94a3b8',
      elevation: 0,
      boxShadow: "none",
    },
    uploadButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    // Enhanced Document Card Styles
    enhancedDocumentCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      marginBottom: 16,
      elevation: 3,
      boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
      overflow: 'hidden',
    },
    documentCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingBottom: 12,
    },
    fileTypeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    fileTypeIcon: {
      fontSize: 16,
      marginRight: 6,
    },
    fileTypeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
    },
    categoryIndicator: {
      width: 4,
      height: 24,
      borderRadius: 2,
    },
    enhancedDocumentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1e293b',
      lineHeight: 22,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    documentInfoGrid: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      color: '#64748b',
      marginLeft: 8,
      flex: 1,
    },
    documentActions: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
      backgroundColor: '#fafbfc',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginRight: 8,
    },
    downloadButton: {
      backgroundColor: '#667eea',
      flex: 1,
    },
    previewButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#667eea',
      minWidth: 44,
    },
    actionButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    // Enhanced Documents Container
    documentsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    documentsStats: {
      backgroundColor: '#f8fafc',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    documentsStatsText: {
      fontSize: 12,
      color: '#64748b',
      fontWeight: '500',
    },
    enhancedDocumentsGrid: {
      // Single column layout for better readability
    },
    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#64748b',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: '#94a3b8',
      textAlign: 'center',
      lineHeight: 20,
    },
    // Loading Container
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 14,
      color: '#64748b',
      marginTop: 12,
    },
// File Manager Styles
fileManagerContainer: {
  flex: 1,
  backgroundColor: '#fff',
},

fileManagerToolbar: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#f8fafc',
  borderBottomWidth: 1,
  borderBottomColor: '#e2e8f0',
},

toolbarLeft: {
  flexDirection: 'row',
  alignItems: 'center',
},

toolbarRight: {
  flexDirection: 'row',
  alignItems: 'center',
},

toolbarButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: '#fff',
  borderRadius: 6,
  marginRight: 8,
  borderWidth: 1,
  borderColor: '#e2e8f0',
},

toolbarButtonText: {
  marginLeft: 6,
  fontSize: 14,
  color: '#334155',
  fontWeight: '500',
},

viewModeButton: {
  padding: 8,
  marginLeft: 4,
  borderRadius: 4,
},

viewModeActive: {
  backgroundColor: '#e0e7ff',
},

fileList: {
  flex: 1,
  backgroundColor: '#fff',
},

fileListView: {
  padding: 16,
},

fileGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  padding: 16,
},

fileListItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  marginBottom: 4,
  backgroundColor: '#fff',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#f1f5f9',
},

fileGridItem: {
  width: '47%',
  aspectRatio: 1,
  margin: '1.5%',
  padding: 16,
  backgroundColor: '#fff',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#f1f5f9',
  justifyContent: 'center',
  alignItems: 'center',
},

fileItemIcon: {
  marginRight: 12,
},

fileIcon: {
  fontSize: 24,
},

fileItemDetails: {
  flex: 1,
},

fileItemName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: 4,
},

fileItemMeta: {
  flexDirection: 'row',
  alignItems: 'center',
},

fileItemMetaText: {
  fontSize: 12,
  color: '#64748b',
  marginRight: 12,
},

emptyFolder: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 60,
},

emptyFolderText: {
  fontSize: 16,
  color: '#94a3b8',
  marginTop: 16,
},

// Modal styles for file operations
modalOverlayFolder: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContent: {
  backgroundColor: '#fff',
  margin: 20,
  padding: 20,
  borderRadius: 12,
  minWidth: 280,
},

modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: 16,
  textAlign: 'center',
},

modalTextInput: {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 20,
},

modalButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
},

modalCancelButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginRight: 8,
},

modalCancelText: {
  fontSize: 16,
  color: '#64748b',
},

modalConfirmButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: '#667eea',
  borderRadius: 6,
},

modalConfirmText: {
  fontSize: 16,
  color: '#fff',
  fontWeight: '500',
},

// Empty folder upload button
emptyFolderUploadButton: {
  marginTop: 16,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: '#f8faff',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#667eea',
  borderStyle: 'dashed',
},

emptyFolderUploadText: {
  marginLeft: 8,
  color: '#667eea',
  fontSize: 14,
  fontWeight: '500',
},
breadcrumbContainer: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  backgroundColor: '#fafbfc',
  borderBottomWidth: 1,
  borderBottomColor: '#e2e8f0',
  maxHeight: 44, // Giới hạn chiều cao
},

breadcrumbItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  marginRight: 2,
  maxWidth: 120, // Giới hạn độ rộng để tránh quá dài
},

breadcrumbText: {
  fontSize: 13, // Giảm từ 14 xuống 13
  color: '#64748b',
  fontWeight: '500',
  marginRight: 3,
},

// Enhanced Home breadcrumb styles
breadcrumbHomeItem: {
  backgroundColor: 'rgba(102, 126, 234, 0.08)',
  borderRadius: 6,
  paddingHorizontal: 6,
  paddingVertical: 4,
},

breadcrumbHomeText: {
  color: '#667eea',
  fontWeight: '600',
  fontSize: 13,
},

// Current/active breadcrumb item
breadcrumbActiveItem: {
  backgroundColor: '#667eea',
  borderRadius: 6,
  paddingHorizontal: 8,
  paddingVertical: 4,
},

breadcrumbActiveText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 13,
},
});