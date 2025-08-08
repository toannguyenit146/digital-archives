import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface CategoryItem {
  id: string;
  title: string;
  color: string;
  icon?: string;
}

const categories: CategoryItem[] = [
  {
    id: '1',
    title: 'Tài liệu',
    color: '#4A90E2',
  },
  {
    id: '2',
    title: 'Kiến thức thường trực',
    color: '#7ED321',
  },
  {
    id: '3',
    title: 'Đối tượng SQ, QNCN',
    color: '#F5A623',
  },
  {
    id: '4',
    title: 'Đối tượng HSQ, BS',
    color: '#D0021B',
  },
  {
    id: '5',
    title: 'ĐTB, ĐVM',
    color: '#9013FE',
  },
  {
    id: '6',
    title: 'Đối tượng Đoàn viên',
    color: '#50E3C2',
  },
  {
    id: '7',
    title: 'Cấu hỏi kiến thức GDCT',
    color: '#B8E986',
  },
  {
    id: '8',
    title: 'Cấu hỏi kiến thức pháp luật',
    color: '#4BD5EA',
  },
];

const CategoryCard: React.FC<{
  item: CategoryItem;
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity style={[styles.categoryCard, { backgroundColor: item.color }]} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Text style={styles.cardIconText}>📁</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardArrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const handleCategoryPress = (categoryId: string, title: string) => {
    console.log(`Selected category: ${title}`);
    // Navigate to category detail screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.headerBackground, { backgroundColor: '#667eea' }]} />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Kho Lưu Trữ Số</Text>
            <Text style={styles.headerSubtitle}>Digital Archives</Text>
            <View style={styles.mainTitleContainer}>
              <View style={styles.titleBorder}>
                <Text style={styles.mainTitle}>Những điều cần nắm</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          <View style={styles.categoriesGrid}>
            {categories.map((item, index) => (
              <View key={item.id} style={styles.categoryWrapper}>
                {/* Connection Line */}
                {index === 0 && (
                  <View style={styles.connectionLine} />
                )}
                <CategoryCard
                  item={item}
                  onPress={() => handleCategoryPress(item.id, item.title)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Danh mục</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1,250+</Text>
              <Text style={styles.statLabel}>Tài liệu</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Câu hỏi</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    height: 200,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  mainTitleContainer: {
    alignItems: 'center',
  },
  titleBorder: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
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
  connectionLine: {
    position: 'absolute',
    top: -25,
    left: '50%',
    width: 2,
    height: 25,
    backgroundColor: '#667eea',
    marginLeft: -1,
  },
  categoryCard: {
    height: 120,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
    marginVertical: 8,
  },
  cardArrow: {
    alignSelf: 'flex-end',
  },
  arrowText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});