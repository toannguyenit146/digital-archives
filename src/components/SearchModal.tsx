// src/components/SearchModal.tsx
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles";
import Icon from "./Icon";

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string, category?: string, fileType?: string) => void;
}

const fileTypeOptions = [
  { label: "Tất cả", value: "" },
  { label: "PDF", value: "pdf" },
  { label: "Word", value: "word" },
  { label: "Excel", value: "excel" },
  { label: "Ảnh", value: "image" },
  { label: "Video", value: "video" },
];

const SearchModal: React.FC<SearchModalProps> = ({
  isVisible,
  onClose,
  onSearch,
}) => {
  const [query, setQuery] = useState("");
  const [fileType, setFileType] = useState("");

const fileTypeMapping: Record<string, string> = {
  pdf: "pdf",
  word: "word",
  doc: "word",
  docx: "word",
  excel: "excel",
  xls: "excel",
  xlsx: "excel",
  img: "image",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  bmp: "image",
  video: "video",
  mp4: "video",
  avi: "video",
  mkv: "video",
  mov: "video",
};

const handleSubmit = () => {
  if (!query.trim()) return;

  let detectedFileType = fileType || undefined;
  const lowerQuery = query.trim().toLowerCase();

  // Nếu query khớp fileType → gán thêm filter nhưng vẫn giữ nguyên query
  if (!fileType && fileTypeMapping[lowerQuery]) {
    detectedFileType = fileTypeMapping[lowerQuery];
  }

  onSearch(query, undefined, detectedFileType);
  onClose();
  setQuery("");
  setFileType("");
};

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tìm kiếm tài liệu</Text>

          {/* Ô nhập từ khóa */}
          <TextInput
            style={styles.modalTextInput}
            placeholder="Nhập từ khóa..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />

          {/* Dropdown chọn loại file */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ marginBottom: 6, fontWeight: "600" }}>
              Loại file:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: "row", gap: 8 }}
            >
              {fileTypeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    {
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor:
                        fileType === opt.value ? "#667eea" : "#cbd5e1",
                      backgroundColor:
                        fileType === opt.value ? "#667eea" : "white",
                    },
                  ]}
                  onPress={() => setFileType(opt.value)}
                >
                  <Text
                    style={{
                      color: fileType === opt.value ? "white" : "#475569",
                      fontWeight: fileType === opt.value ? "600" : "400",
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Nút hành động */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleSubmit}
            >
              <Icon name="search" size={18} color="white" />
              <Text style={styles.modalConfirmText}>Tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SearchModal;
