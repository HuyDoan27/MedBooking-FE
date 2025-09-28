import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Feather';
import { Specialty } from '../../../types';

interface SpecialtyCardProps {
  specialty: Specialty;
  onPress?: (specialty: Specialty) => void;
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ specialty, onPress }) => {
  const getIconName = (name: string): string => {
    const iconMap: Record<string, string> = {
      'Nội khoa': 'heart',
      'Nha khoa': 'shield',
      'Mắt': 'eye',
      'Da liễu': 'heart',
      'Tai mũi họng': 'shield',
      'Sản phụ khoa': 'user',
    };
    return iconMap[name] || 'heart';
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress?.(specialty)}
    >
      <Card containerStyle={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: specialty.color }]}>
          <Icon 
            name={getIconName(specialty.name)} 
            size={24} 
            color={specialty.textColor} 
          />
        </View>
        <Text style={styles.title}>{specialty.name}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '33.333%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});
