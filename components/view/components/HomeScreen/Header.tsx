// Components/Header.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar, Badge } from "react-native-elements";
import Icon from "react-native-vector-icons/Feather";

interface HeaderProps {
  userName?: string;
  avatarUri?: string;
  onNotificationPress?: () => void;
  onCalendarPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = "Minh",
  avatarUri,
  onNotificationPress,
  onCalendarPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Avatar
          rounded
          size={48}
          source={avatarUri ? { uri: avatarUri } : undefined}
          containerStyle={styles.avatar}
          title={userName.charAt(0).toUpperCase()}
        />
        <View style={styles.greeting}>
          <Text style={styles.welcomeText}>Xin chào, {userName}!</Text>
          <Text style={styles.subText}>Hôm nay bạn cảm thấy thế nào?</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
        >
          <Icon name="bell" size={20} color="white" />
          <Badge
            status="error"
            containerStyle={styles.badge}
            badgeStyle={styles.badgeStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onCalendarPress}>
          <Icon name="calendar" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  greeting: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subText: {
    fontSize: 14,
    color: "rgba(147, 197, 253, 1)",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  badgeStyle: {
    width: 12,
    height: 12,
  },
});
