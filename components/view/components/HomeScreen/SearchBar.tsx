import React from "react";
import { StyleSheet, View } from "react-native";
import { SearchBar as RNESearchBar } from "react-native-elements";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Tìm bác sĩ, chuyên khoa, phòng khám...",
  onSubmit,
}) => {
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <View style={styles.container}>
      <RNESearchBar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.inputContainer}
        inputStyle={styles.input}
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        searchIcon={{ color: "rgba(255, 255, 255, 0.8)", size: 22 }}
        clearIcon={{ color: "rgba(255, 255, 255, 0.8)", size: 22 }}
        onSubmitEditing={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  searchContainer: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  inputContainer: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  input: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
});