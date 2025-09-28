import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { QuickAction } from '../../../types';

interface QuickActionsProps {
  actions?: QuickAction[];
  onActionPress?: (action: QuickAction) => void;
}

const defaultActions: QuickAction[] = [
  {
    icon: 'map-pin',
    title: 'Gần tôi',
    subtitle: 'Tìm bác sĩ xung quanh',
  },
  {
    icon: 'video',
    title: 'Tư vấn online',
    subtitle: 'Khám từ xa tiện lợi',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.actionCard}
          onPress={() => onActionPress?.(action)}
        >
          <View style={styles.iconContainer}>
            <Icon name={action.icon} size={24} color="white" />
          </View>
          <Text style={styles.title}>{action.title}</Text>
          <Text style={styles.subtitle}>{action.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(147, 197, 253, 1)',
    fontSize: 12,
    textAlign: 'center',
  },
});
