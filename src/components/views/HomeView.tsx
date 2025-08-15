// src/components/views/HomeView.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { CategoryCard } from '../cards/CategoryCard';
import { Icon } from '../common/Icon';
import { categories } from '../../data/categories';
import { User } from '../../types/auth';

const { width } = Dimensions.get('window');

interface HomeViewProps {
  user: User;
  onCategoryPress: (categoryId: string, title: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ user, onCategoryPress }) => {
  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={[styles.headerBackground, { backgroundColor: '#667eea' }]} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Digital Archives</Text>
          <Text style={styles.headerSubtitle}>Hệ thống quản lý tài liệu số</Text>
          <View style={styles.mainTitleContainer}>
            <View style={styles.titleBorder}>
              <Text style={styles.mainTitle}>Những điều cần nắm</Text>
            </View>
          </View>
        </View>
      </View>

      {/* User Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Xin chào, {user.name}!</Text>
        <Text style={styles.welcomeSubtext}>Chọn danh mục để bắt đầu làm việc</Text>
      </View>

      {/* Categories Grid */}
      <View style={styles.categoriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục chính</Text>
          <Text style={styles.sectionSubtitle}>Chọn danh mục để bắt đầu</Text>
        </View>
        
        <View style={styles.categoriesGrid}>
          {categories.map((item) => (
            <View key={item.id} style={styles.categoryWrapper}>
              <CategoryCard
                item={item}
                onPress={() => onCategoryPress(item.id, item.title)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Thống kê hệ thống</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="folder" size={32} color="#667eea" />
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Danh mục</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="document-text" size={32} color="#7ED321" />
            <Text style={styles.statNumber}>1,250+</Text>
            <Text style={styles.statLabel}>Tài liệu</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="help-circle" size={32} color="#F5A623" />
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>Câu hỏi</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="people" size={32} color="#D0021B" />
            <Text style={styles.statNumber}>2,100+</Text>
            <Text style={styles.statLabel}>Người dùng</Text>
          </View>
        </View>
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
  header: {
    height: 180,
    position: 'relative',
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 15,
  },
  mainTitleContainer: {
    alignItems: 'center',
  },
  titleBorder: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  welcomeSection: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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
});