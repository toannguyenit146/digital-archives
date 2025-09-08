import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';
import { BreadcrumbItem } from '../types';
import Icon from './Icon';

interface CompactBreadcrumbProps {
  breadcrumb: BreadcrumbItem[];
  onItemPress: (item: BreadcrumbItem) => void;
}

const CompactBreadcrumb: React.FC<CompactBreadcrumbProps> = ({
  breadcrumb,
  onItemPress
}) => {
  const truncateText = (text: string, maxLength: number = 15) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <ScrollView
      horizontal
      style={styles.breadcrumbContainer}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ 
        alignItems: 'center', 
        minHeight: 32,
        paddingVertical: 6
      }}
    >
      {breadcrumb.map((item, index) => {
        const isLast = index === breadcrumb.length - 1;
        const isHome = item.isHome;
        
        return (
          <View 
            key={item.id || `breadcrumb-${index}`} 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              flex: 0 // Prevent flex grow
            }}
          >
            <TouchableOpacity
              style={[
                styles.breadcrumbItem,
                isHome && styles.breadcrumbHomeItem,
                isLast && styles.breadcrumbActiveItem,
                { 
                  opacity: isLast ? 0.8 : 1,
                  minWidth: isHome ? 32 : 'auto'
                }
              ]}
              onPress={() => onItemPress(item)}
              disabled={isLast}
              activeOpacity={isLast ? 1 : 0.7}
            >
              {isHome && (
                <View style={{ marginRight: isLast ? 4 : 3 }}>
                  <Icon 
                    name="home" 
                    size={11} 
                    color={isLast ? "white" : "#667eea"} 
                  />
                </View>
              )}
              
              <Text 
                style={[
                  styles.breadcrumbText,
                  isHome && !isLast && styles.breadcrumbHomeText,
                  isLast && styles.breadcrumbActiveText,
                  { 
                    fontSize: 12,
                    lineHeight: 16
                  }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {truncateText(item.name, isHome ? 8 : 12)}
              </Text>
            </TouchableOpacity>
            
            {index < breadcrumb.length - 1 && (
              <View style={{ 
                marginHorizontal: 3,
                opacity: 0.6
              }}>
                <Icon name="chevron-forward" size={9} color="#94a3b8" />
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default CompactBreadcrumb;