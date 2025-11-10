import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAppointment } from "@/services/AppointmentService";
import {
  getClinicsWithDoctors,
  getSpecialtiesByClinic,
} from "@/services/ClinicService";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { getDoctorsBySpecialty } from "@/services/DoctorService";

interface CreateAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [clinics, setClinics] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [form, setForm] = useState({
    appointmentDate: new Date(),
    clinicId: "",
    clinicName: "",
    reason: "",
    notes: "",
    location: "",
    specialtyId: "",
    doctorId: "",
  });

  // --- Fetch data ---
  useEffect(() => {
    if (visible) {
      fetchClinics();
      setStep(1);
    }
  }, [visible]);

  useEffect(() => {
    if (form.clinicId) fetchSpecialties(form.clinicId);
    else setSpecialties([]);
  }, [form.clinicId]);

  useEffect(() => {
    if (form.specialtyId) fetchDoctors(form.specialtyId);
    else setDoctors([]);
  }, [form.specialtyId]);

  const fetchClinics = async () => {
    try {
      const res = await getClinicsWithDoctors();
      setClinics(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setClinics([]);
    }
  };

  const fetchSpecialties = async (clinicId: string) => {
    try {
      const res = await getSpecialtiesByClinic(clinicId);
      setSpecialties(Array.isArray(res.data.specialties) ? res.data.specialties : []);
    } catch {
      setSpecialties([]);
    }
  };

  const fetchDoctors = async (specialtyId: string) => {
    try {
      const res = await getDoctorsBySpecialty({ specialtyId });
      setDoctors(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setDoctors([]);
    }
  };

  const handleOpenDatePicker = () => {
    // Bước 1: chọn ngày
    DateTimePickerAndroid.open({
      value: form.appointmentDate,
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type !== "set" || !selectedDate) return;

        // Lưu ngày được chọn
        const chosenDate = new Date(selectedDate);

        // Bước 2: chọn giờ
        DateTimePickerAndroid.open({
          value: form.appointmentDate,
          mode: "time",
          is24Hour: true,
          onChange: (event2, selectedTime) => {
            if (event2.type === "set" && selectedTime) {
              const chosenTime = new Date(selectedTime);
              chosenDate.setHours(chosenTime.getHours());
              chosenDate.setMinutes(chosenTime.getMinutes());
              setForm({ ...form, appointmentDate: chosenDate });
            }
          },
        });
      },
    });
  };


  const handleCreateAppointment = async () => {
    if (!form.clinicId || !form.specialtyId || !form.doctorId || !form.reason) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
        return;
      }

      const payload = { ...form };
      const res = await createAppointment(payload, token);

      if (res.data?.success) {
        Alert.alert("Thành công", "Đặt lịch hẹn thành công");
        resetForm();
        onClose();
        onSuccess();
      } else {
        Alert.alert("Lỗi", res.data?.message || "Không thể đặt lịch.");
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      appointmentDate: new Date(),
      clinicId: "",
      clinicName: "",
      reason: "",
      notes: "",
      location: "",
      specialtyId: "",
      doctorId: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // --- Step UI rendering ---
  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {[1, 2].map((s) => (
        <View key={s} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              step >= s ? styles.stepActive : styles.stepInactive,
            ]}
          >
            <Text style={styles.stepNumber}>{s}</Text>
          </View>
          {s < 2 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <>
      {/* Phòng khám */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          Phòng khám <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={18} color="#0891b2" style={styles.inputIcon} />
          <Picker
            selectedValue={form.clinicId}
            onValueChange={(value) => {
              const selectedClinic = clinics.find((c) => c._id === value);
              setForm({
                ...form,
                clinicId: value,
                clinicName: selectedClinic ? selectedClinic.name : "",
                specialtyId: "",
                doctorId: "",
              });
            }}
            style={styles.picker}
            enabled={!loading}
          >
            <Picker.Item label="Chọn phòng khám" value="" />
            {clinics.map((c) => (
              <Picker.Item key={c._id} label={c.name} value={c._id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Chuyên khoa */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          Chuyên khoa <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="medkit-outline" size={18} color="#dc2626" style={styles.inputIcon} />
          <Picker
            selectedValue={form.specialtyId}
            onValueChange={(value) => {
              setForm({ ...form, specialtyId: value, doctorId: "" });
            }}
            style={styles.picker}
            enabled={!!form.clinicId && !loading}
          >
            <Picker.Item label="Chọn chuyên khoa" value="" />
            {specialties.map((s) => (
              <Picker.Item key={s._id} label={s.name} value={s._id} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Bác sĩ */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          Bác sĩ <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-circle-outline" size={18} color="#16a34a" style={styles.inputIcon} />
          <Picker
            selectedValue={form.doctorId}
            onValueChange={(value) => setForm({ ...form, doctorId: value })}
            style={styles.picker}
            enabled={!!form.specialtyId && !loading}
          >
            <Picker.Item label="Chọn bác sĩ" value="" />
            {doctors.map((d) => (
              <Picker.Item key={d._id} label={d.fullName} value={d._id} />
            ))}
          </Picker>
        </View>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Ngày giờ */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          Ngày giờ khám <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          onPress={handleOpenDatePicker}
          style={styles.inputWrapper}
          disabled={loading}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#0891b2"
            style={styles.inputIcon}
          />
          <Text style={styles.dateText}>
            {form.appointmentDate.toLocaleString("vi-VN")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lý do khám */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          Lý do khám <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="document-text-outline"
            size={18}
            color="#ca8a04"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Nhập lý do khám"
            placeholderTextColor="#9ca3af"
            value={form.reason}
            onChangeText={(text) => setForm({ ...form, reason: text })}
            editable={!loading}
            maxLength={200}
          />
        </View>
        <Text style={styles.charCount}>{form.reason.length}/200</Text>
      </View>

      {/* Ghi chú */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Ghi chú</Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#0891b2"
            style={[styles.inputIcon, { marginTop: 8 }]}
          />
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Nhập ghi chú thêm"
            placeholderTextColor="#9ca3af"
            value={form.notes}
            onChangeText={(text) => setForm({ ...form, notes: text })}
            multiline
            numberOfLines={3}
            editable={!loading}
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>{form.notes.length}/500</Text>
      </View>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đặt lịch khám</Text>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {renderStepIndicator()}

        {/* Nội dung các bước */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </ScrollView>

        {/* Footer: chỉ còn 2 bước */}
        <View style={styles.footer}>
          {step === 2 ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setStep(1)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleCreateAppointment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Đặt lịch</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={() => setStep(2)}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", paddingTop: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },

  stepContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
  },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: { backgroundColor: "#0891b2" },
  stepInactive: { backgroundColor: "#d1d5db" },
  stepNumber: { color: "#fff", fontWeight: "700" },
  stepLine: { width: 40, height: 2, backgroundColor: "#d1d5db" },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  section: { marginBottom: 18 },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 8 },
  required: { color: "#dc2626" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 10 },
  picker: { flex: 1, color: "#111827" },
  textInput: { flex: 1, color: "#111827", fontSize: 14, padding: 0 },
  textAreaWrapper: { height: "auto", paddingVertical: 10, alignItems: "flex-start" },
  textArea: { paddingTop: 8, paddingBottom: 8 },
  dateText: { color: "#111827", fontSize: 14 },
  charCount: { fontSize: 12, color: "#9ca3af", marginTop: 4, textAlign: "right" },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#d1d5db" },
  cancelButtonText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  submitButton: { backgroundColor: "#0891b2" },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});

export default CreateAppointmentModal;
