import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getSpecialty } from "@/services/SpecialtyService" ;

const AddClinicModal = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [specialties, setSpecialties] = useState([]); // danh sách từ API
  const [selectedSpecialties, setSelectedSpecialties] = useState([]); // ID chuyên khoa được chọn
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy danh sách chuyên khoa khi mở modal
  useEffect(() => {
    if (visible) fetchSpecialties();
  }, [visible]);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await getSpecialty();
      if (res.data.success) {
        setSpecialties(res.data.data || []);
      } else {
        console.warn("Lấy danh sách chuyên khoa thất bại");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy chuyên khoa:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (id) => {
    setSelectedSpecialties((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (!name.trim() || !address.trim()) {
      alert("Vui lòng nhập Tên và Địa chỉ phòng khám.");
      return;
    }

    onSubmit({
      name,
      address,
      phone,
      description,
      specialties: selectedSpecialties,
    });

    // Reset
    setName("");
    setAddress("");
    setPhone("");
    setDescription("");
    setSelectedSpecialties([]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Thêm phòng khám mới</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.input}
              placeholder="Tên phòng khám"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại (không bắt buộc)"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Mô tả (không bắt buộc)"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.subTitle}>Chọn chuyên khoa:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : (
              <View style={styles.specialtyList}>
                {specialties.length === 0 ? (
                  <Text style={{ color: "#777" }}>Không có chuyên khoa nào</Text>
                ) : (
                  specialties.map((sp) => (
                    <TouchableOpacity
                      key={sp._id}
                      style={[
                        styles.specialtyItem,
                        selectedSpecialties.includes(sp._id) && styles.specialtySelected,
                      ]}
                      onPress={() => toggleSpecialty(sp._id)}
                    >
                      <Text
                        style={[
                          styles.specialtyText,
                          selectedSpecialties.includes(sp._id) && { color: "#fff" },
                        ]}
                      >
                        {sp.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.addBtn]} onPress={handleAdd}>
              <Text style={styles.buttonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddClinicModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  subTitle: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  specialtyList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specialtyItem: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  specialtySelected: {
    backgroundColor: "#007bff",
  },
  specialtyText: {
    color: "#007bff",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  button: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
