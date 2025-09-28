import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showViewAll = true,
  onViewAllPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAll}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  viewAll: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});