import React, { useState } from 'react';
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { styles } from '../styles';
import Icon from './Icon';

const SearchModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}> = ({ isVisible, onClose, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onClose();
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

          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SearchModal;
