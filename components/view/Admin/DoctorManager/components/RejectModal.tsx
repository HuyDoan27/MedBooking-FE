import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { Feather } from "@expo/vector-icons";

const RejectModal = ({
  visible,
  onClose,
  reason,
  setReason,
  onSubmit,
  doctorName,
}) => (
  <Modal
    isVisible={visible}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    animationIn="fadeIn"
    animationOut="fadeOut"
    avoidKeyboard
    backdropTransitionOutTiming={0}
  >
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Feather name="alert-circle" size={24} color="#ef4444" />
        <Text style={styles.modalTitle}>Lý do từ chối</Text>
      </View>

      <Text style={styles.modalSubtitle}>
        Vui lòng nhập lý do từ chối bác sĩ {doctorName}
      </Text>

      <TextInput
        style={styles.rejectInput}
        placeholder="Nhập lý do từ chối..."
        placeholderTextColor="#94a3b8"
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <View style={styles.modalActions}>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalCancelButton]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.modalCancelText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, styles.modalSubmitButton]}
          onPress={onSubmit}
          activeOpacity={0.7}
        >
          <Text style={styles.modalSubmitText}>Xác nhận từ chối</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignSelf: "center",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 120,
    backgroundColor: "#f8fafc",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#f1f5f9",
  },
  modalSubmitButton: {
    backgroundColor: "#ef4444",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
});

export default RejectModal;
