import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  createAppointment,
  getUserAppointments,
} from "../../../services/AppointmentService";
import {
  getClinics,
  getSpecialtiesByClinic,
} from "../../../services/ClinicService";
import { getDoctorsBySpecialty } from "../../../services/DoctorService";

const getStatusConfig = (status) => {
  switch (status) {
    case "confirmed":
      return {
        text: "Đã xác nhận",
        color: "#16a34a",
        bgColor: "#dcfce7",
        icon: "checkmark-circle",
      };
    case "pending":
      return {
        text: "Chờ xác nhận",
        color: "#ca8a04",
        bgColor: "#fef3c7",
        icon: "time",
      };
    case "completed":
      return {
        text: "Đã khám",
        color: "#0891b2",
        bgColor: "#dbeafe",
        icon: "checkmark-done-circle",
      };
    case "cancelled":
      return {
        text: "Đã hủy",
        color: "#dc2626",
        bgColor: "#fee2e2",
        icon: "close-circle",
      };
    case "rescheduled":
      return {
        text: "Đã dời lịch",
        color: "#7c3aed",
        bgColor: "#ede9fe",
        icon: "calendar",
      };
    default:
      return {
        text: status,
        color: "#6b7280",
        bgColor: "#f3f4f6",
        icon: "help-circle",
      };
  }
};

export default function EnhancedAppointmentsScreen() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    appointmentDate: new Date(),
    clinicId: "",
    clinicName: "",
    reason: "",
    notes: "",
    location: "",
    duration: "30 phút",
    specialtyId: "",
    doctorId: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  // Lấy danh sách lịch hẹn khi component mount hoặc activeTab thay đổi
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true); // thêm dòng này
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user._id);

          let statusParam = "upcoming";
          if (activeTab === "completed") statusParam = "completed";
          if (activeTab === "cancelled") statusParam = "cancelled";
          if (activeTab === "pending") statusParam = "pending";

          const params = {
            status: statusParam,
            page: 1,
            limit: 10,
          };
          const response = await getUserAppointments(user._id, params);
          setAppointments(response.data.data);
        }
      } catch (err) {
        setError("Không thể tải danh sách lịch hẹn. Vui lòng thử lại.");
        console.error("Error loading:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [activeTab]);

  // Hooks và hàm fetch
  const fetchClinics = async () => {
    // Gọi API lấy danh sách chuyên khoa
    try {
      const res = await getClinics();

      // Đảm bảo luôn là mảng
      setClinics(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setClinics([]);
    }
  };
  const fetchSpecialties = async (clinicId) => {
    // Gọi API lấy danh sách chuyên khoa
    try {
      const res = await getSpecialtiesByClinic(clinicId);

      // Đảm bảo luôn là mảng
      setSpecialties(
        Array.isArray(res.data.specialties) ? res.data.specialties : []
      );
    } catch {
      setSpecialties([]);
    }
  };
  const fetchDoctors = async (specialtyId) => {
    try {
      const res = await getDoctorsBySpecialty({ specialtyId: specialtyId }); // Đúng format
      setDoctors(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setDoctors([]);
    }
  };

  useEffect(() => {
    if (showModal) fetchClinics();
  }, [showModal]);

  useEffect(() => {
    if (form.clinicId) {
      fetchSpecialties(form.clinicId);
    } else {
      setSpecialties([]);
    }
  }, [form.clinicId]);

  useEffect(() => {
    if (form.specialtyId) {
      fetchDoctors(form.specialtyId);
    } else {
      setDoctors([]);
    }
  }, [form.specialtyId]);

  const handleCreateAppointment = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
      }
      console.log("Creating appointment with user:", token);

      const payload = {
        ...form,
      };

      const res = await createAppointment(payload, token); // ✅ truyền token

      if (res.data?.success) {
        Alert.alert("Thành công", "Đặt lịch hẹn thành công");
        setShowModal(false);
        setForm({
          appointmentDate: new Date(),
          clinicId: "",
          clinicName: "",
          reason: "",
          notes: "",
          location: "",
          duration: "30 phút",
          specialtyId: "",
          doctorId: "",
        });
        setActiveTab("upcoming");
      } else {
        Alert.alert("Lỗi", res.data?.message || "Không thể đặt lịch.");
      }
    } catch (err) {
      console.error("handleCreateAppointment error:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const renderAppointmentCard = (item) => {
    const status = getStatusConfig(item.status);
    return (
      <View key={item._id} style={styles.beautyCard}>
        {/* Banner trạng thái & thanh toán */}
        <View style={styles.beautyBanner}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={status.icon}
              size={20}
              color={status.color}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{ color: status.color, fontWeight: "bold", fontSize: 15 }}
            >
              {status.text}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={
                item.paymentStatus === "pending"
                  ? "card-outline"
                  : "checkmark-circle-outline"
              }
              size={18}
              color={item.paymentStatus === "pending" ? "#ca8a04" : "#16a34a"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: item.paymentStatus === "pending" ? "#ca8a04" : "#16a34a",
                fontWeight: "600",
              }}
            >
              {item.paymentStatus === "pending"
                ? "Chưa thanh toán"
                : "Đã thanh toán"}
            </Text>
          </View>
        </View>

        {/* Thông tin lịch hẹn */}
        <View style={styles.beautyInfoBlock}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#0891b2"
              style={{ marginRight: 6 }}
            />
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#0891b2" }}
            >
              Thời gian hẹn khám :{" "}
              {new Date(item.appointmentDate).toLocaleString("vi-VN")}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="location-outline"
              size={18}
              color="#6b7280"
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 15, color: "#374151" }}>
              {item.location}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="person"
              size={18}
              color="#ca0404ff"
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 15, color: "#ca0404ff" }}>
              Bác sĩ:{" "}
              <Text style={{ color: "#374151" }}>
                {item.doctorId ? item.doctorId.fullName : "Chưa có bác sĩ"}
              </Text>{" "}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color="#ca8a04"
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 15, color: "#ca8a04" }}>
              Lý do: <Text style={{ color: "#374151" }}>{item.reason}</Text>
            </Text>
          </View>
          {item.notes && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#0891b2"
                style={{ marginRight: 6 }}
              />
              <Text style={{ fontSize: 15, color: "#0891b2" }}>
                Ghi chú: <Text style={{ color: "#374151" }}>{item.notes}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Thông tin bệnh nhân */}
        <View style={styles.beautyPatientBlock}>
          <Text style={{ fontWeight: "bold", fontSize: 15, color: "#0891b2" }}>
            Thông tin của tôi
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: 15,
                color: "#374151",
                marginRight: 30,
              }}
            >
              {item.userId?.fullName}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 13, marginRight: 30 }}>
              {item.userId?.email}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 13 }}>
              {item.userId?.phoneNumber}
            </Text>
          </View>
        </View>

        {/* Ngày tạo, cập nhật */}
        <View style={styles.beautyFooterBlock}>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            Tạo: {new Date(item.createdAt).toLocaleString("vi-VN")}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            Cập nhật: {new Date(item.updatedAt).toLocaleString("vi-VN")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />

      {/* Enhanced Header */}
      <View style={styles.enhancedHeader}>
        <Text style={styles.enhancedHeaderTitle}>Lịch khám của tôi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={24} color="#0891b2" />
        </TouchableOpacity>
      </View>

      {/* Enhanced Tabs */}
      <View style={styles.enhancedTabs}>
        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "upcoming" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "upcoming" && styles.enhancedTabTextActive,
            ]}
          >
            Sắp tới
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "completed" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "completed" && styles.enhancedTabTextActive,
            ]}
          >
            Đã khám
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "cancelled" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "cancelled" && styles.enhancedTabTextActive,
            ]}
          >
            Đã hủy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            activeTab === "pending" && styles.enhancedTabActive,
          ]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.enhancedTabText,
              activeTab === "pending" && styles.enhancedTabTextActive,
            ]}
          >
            Chờ duyệt
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0891b2" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
            <Text style={styles.emptyTitle}>{error}</Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={() => setActiveTab(activeTab)} // Trigger reload
            >
              <Text style={styles.emptyActionText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>
              {activeTab === "upcoming"
                ? "Chưa có lịch khám"
                : "Chưa có lịch sử khám"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "upcoming"
                ? "Đặt lịch khám với bác sĩ ngay hôm nay"
                : "Các cuộc hẹn đã hoàn thành sẽ hiển thị ở đây"}
            </Text>
            {activeTab === "upcoming" && (
              <TouchableOpacity style={styles.emptyActionButton}>
                <Text style={styles.emptyActionText}>Đặt lịch ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          appointments.map(renderAppointmentCard)
        )}
      </ScrollView>

      {/* Modal đặt lịch */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}
            >
              Đặt lịch khám
            </Text>
            {/* chọn phòng khám */}
            <View style={styles.inputField}>
              <Ionicons name="business-outline" size={18} color="#0891b2" />
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
              >
                <Picker.Item label="Chọn phòng khám" value="" />
                {clinics.map((c) => (
                  <Picker.Item key={c._id} label={c.name} value={c._id} />
                ))}
              </Picker>
            </View>
            {/* chọn chuyên khoa */}
            <View style={styles.inputField}>
              <Ionicons name="medkit-outline" size={18} color="#dc2626" />
              <Picker
                selectedValue={form.specialtyId}
                onValueChange={(value) => {
                  setForm({ ...form, specialtyId: value, doctorId: "" });
                }}
              >
                <Picker.Item label="Chọn chuyên khoa" value="" />
                {specialties.map((s) => (
                  <Picker.Item key={s._id} label={s.name} value={s._id} />
                ))}
              </Picker>
            </View>
            {/* chọn bác sĩ */}
            <View style={styles.inputField}>
              <Ionicons
                name="person-circle-outline"
                size={18}
                color="#16a34a"
              />
              <Picker
                selectedValue={form.doctorId}
                style={{ flex: 1 }}
                onValueChange={(value) => setForm({ ...form, doctorId: value })}
                enabled={!!form.specialtyId}
              >
                <Picker.Item label="-- Chọn bác sĩ --" value="" />
                {doctors.map((d) => (
                  <Picker.Item key={d._id} label={d.fullName} value={d._id} />
                ))}
              </Picker>
            </View>
            {/* chọn ngày giờ */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.inputField}
            >
              <Ionicons name="calendar-outline" size={18} color="#0891b2" />
              <Text style={{ marginLeft: 8 }}>
                {form.appointmentDate.toLocaleString("vi-VN")}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.appointmentDate}
                mode="datetime"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setForm({ ...form, appointmentDate: date });
                }}
              />
            )}
            {/* lý do khám */}
            <View style={styles.inputField}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#ca8a04"
              />
              <TextInput
                style={styles.textInput}
                placeholder="Lý do khám"
                value={form.reason}
                onChangeText={(text) => setForm({ ...form, reason: text })}
              />
            </View>

            {/* địa điểm */}
            <View style={styles.inputField}>
              <Ionicons name="location-outline" size={18} color="#6b7280" />
              <TextInput
                style={styles.textInput}
                placeholder="Địa điểm"
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
              />
            </View>

            {/* ghi chú */}
            <View style={styles.inputField}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#0891b2"
              />
              <TextInput
                style={styles.textInput}
                placeholder="Ghi chú"
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
              />
            </View>

            {/* thời lượng */}
            <View style={styles.inputField}>
              <Ionicons name="timer-outline" size={18} color="#7c3aed" />
              <TextInput
                style={styles.textInput}
                placeholder="Thời lượng"
                value={form.duration}
                onChangeText={(text) => setForm({ ...form, duration: text })}
              />
            </View>

            {/* nút action */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.modalButton, { backgroundColor: "#e5e7eb" }]}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateAppointment}
                style={[
                  styles.modalButton,
                  { backgroundColor: "#0891b2", marginLeft: 8 },
                ]}
              >
                <Text style={{ color: "white" }}>Đặt lịch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  beautyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  beautyBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  beautyInfoBlock: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  beautyPatientBlock: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  beautyFooterBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  enhancedHeader: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomStartRadius: 16,
    borderBottomEndRadius: 16,
  },
  enhancedHeaderTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  addButton: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  enhancedTabs: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  enhancedTabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  enhancedTabActive: {
    backgroundColor: "#0891b2",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  enhancedTabTextActive: {
    color: "white",
  },
  enhancedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  moreButton: {
    padding: 4,
  },
  cardContent: {
    padding: 20,
  },
  enhancedAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#e2e8f0",
  },
  onlineBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#16a34a",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  enhancedDoctorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  specialtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  enhancedSpecialty: {
    fontSize: 14,
    color: "#0891b2",
    fontWeight: "600",
  },
  duration: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 4,
  },
  enhancedClinic: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
    flex: 1,
  },
  dateTimeContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  roomInfo: {
    fontSize: 13,
    color: "#6b7280",
    marginLeft: 6,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  notesText: {
    fontSize: 13,
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
    fontStyle: "italic",
  },
  diagnosisContainer: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  diagnosisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  diagnosisTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  diagnosisText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  nextCheckupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#fef3c7",
    padding: 8,
    borderRadius: 8,
  },
  nextCheckupText: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: "500",
    marginLeft: 6,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  enhancedPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0891b2",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },
  primaryButton: {
    backgroundColor: "#0891b2",
    borderColor: "#0891b2",
  },
  actionButtonText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
    color: "#374151",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyActionButton: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#374151",
    marginTop: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#374151",
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
