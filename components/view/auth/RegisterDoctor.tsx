import { createDoctor } from "@/services/DoctorService";
import { getClinics, getSpecialtiesByClinic } from "@/services/ClinicService";
import {
  Building2,
  CheckCircle,
  Heart,
  Mail,
  Phone,
  Stethoscope,
  User,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterDoctor({ onRegisterSuccess }: any) {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    specialty: "",
    specialtyName: "",
    clinic: "",
    selectedClinic: null as any,
    clinicName: "",
    clinicAddress: "",
    experience: "",
    qualifications: [] as string[],
    newQualification: "",
    agreeTerms: false,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fetchSpecialtiesByClinic = async (clinicId: string) => {
    if (!clinicId) {
      setSpecialties([]);
      return;
    }

    try {
      setLoadingSpecialties(true);
      const response = await getSpecialtiesByClinic(clinicId);

      if (response.status !== 200) {
        throw new Error("Failed to fetch specialties");
      }

      const payload = response.data.specialties;
      setSpecialties(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      setSpecialties([]);
      alert("Không thể tải danh sách chuyên khoa cho phòng khám này");
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const fetchClinics = async () => {
    try {
      setLoadingClinics(true);
      const response = await getClinics();

      if (response.status !== 200) {
        throw new Error("Failed to fetch clinics");
      }

      const payload = response.data.data;
      setClinics(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      alert("Không thể tải danh sách phòng khám");
    } finally {
      setLoadingClinics(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClinicSelect = (clinic: any) => {
    const clinicId = clinic._id || clinic.id;

    // Reset specialty khi đổi phòng khám
    handleInputChange("selectedClinic", clinic);
    handleInputChange("clinic", clinicId);
    handleInputChange("clinicName", clinic.name || "");
    handleInputChange("clinicAddress", clinic.address || "");
    handleInputChange("specialty", "");
    handleInputChange("specialtyName", "");

    // Đóng modal và load chuyên khoa
    setShowClinicModal(false);
    fetchSpecialtiesByClinic(clinicId);
  };

  const handleRegister = async () => {
    setAttemptedSubmit(true);

    if (!isFormValid) {
      alert("Vui lòng hoàn thành các trường bắt buộc.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("fullName", formData.fullName);
      fd.append("email", formData.email);
      fd.append("phoneNumber", formData.phoneNumber);
      fd.append("role", "doctor");
      fd.append("specialty", formData.specialty);

      const clinicId =
        formData.clinic ||
        formData.selectedClinic?._id ||
        formData.selectedClinic?.id;
      if (clinicId) fd.append("clinic", clinicId);

      fd.append(
        "clinicName",
        formData.clinicName || formData.selectedClinic?.name || ""
      );
      fd.append(
        "clinicAddress",
        formData.clinicAddress || formData.selectedClinic?.address || ""
      );
      fd.append("experience", formData.experience || "");
      fd.append(
        "qualifications",
        JSON.stringify(formData.qualifications || [])
      );

      console.log("Doctor Register FormData prepared");
      const res = await createDoctor(fd);

      if (onRegisterSuccess) onRegisterSuccess(res);

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("RegisterDoctor error:", err);
      const backendMsg = err?.response?.data?.message;
      alert(backendMsg || "Đăng ký thất bại, vui lòng thử lại.");
    }
  };

  useEffect(() => {
    let t: any;
    if (showSuccessModal) {
      t = setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/");
      }, 5000);
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [showSuccessModal, router]);

  const isFormValid =
    Boolean(formData.fullName?.trim()) &&
    Boolean(formData.email?.trim()) &&
    Boolean(formData.phoneNumber?.trim()) &&
    Boolean(formData.specialty?.toString()?.trim()) &&
    Boolean(
      formData.clinic ||
        formData.selectedClinic?._id ||
        formData.clinicName?.trim()
    ) &&
    Boolean(formData.experience?.trim()) &&
    Array.isArray(formData.qualifications) &&
    formData.qualifications.length > 0 &&
    formData.agreeTerms;

  useEffect(() => {
    fetchClinics();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logo]}>
          <Heart size={40} color="#fff" />
        </View>
        <Text style={styles.title}>MedBooking</Text>
        <Text style={styles.subtitle}>Đăng ký tài khoản bác sĩ</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin bác sĩ</Text>
        <Text style={styles.cardSubtitle}>
          Vui lòng điền đầy đủ thông tin bên dưới
        </Text>

        {/* Họ và tên */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Họ và tên <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <User size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={[
                styles.input,
                attemptedSubmit &&
                  !formData.fullName?.trim() &&
                  styles.invalidInput,
              ]}
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChangeText={(v) => handleInputChange("fullName", v)}
            />
          </View>
          {attemptedSubmit && !formData.fullName?.trim() && (
            <Text style={styles.errorText}>Họ và tên là bắt buộc.</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={[
                styles.input,
                attemptedSubmit &&
                  !formData.email?.trim() &&
                  styles.invalidInput,
              ]}
              placeholder="doctor@example.com"
              value={formData.email}
              onChangeText={(v) => handleInputChange("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {attemptedSubmit && !formData.email?.trim() && (
            <Text style={styles.errorText}>Email là bắt buộc.</Text>
          )}
        </View>

        {/* Số điện thoại */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Số điện thoại <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Phone size={20} color="#9ca3af" style={styles.iconLeft} />
            <TextInput
              style={[
                styles.input,
                attemptedSubmit &&
                  !formData.phoneNumber?.trim() &&
                  styles.invalidInput,
              ]}
              placeholder="0901 234 567"
              value={formData.phoneNumber}
              onChangeText={(v) => handleInputChange("phoneNumber", v)}
              keyboardType="phone-pad"
            />
          </View>
          {attemptedSubmit && !formData.phoneNumber?.trim() && (
            <Text style={styles.errorText}>Số điện thoại là bắt buộc.</Text>
          )}
        </View>

        {/* Phòng khám */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Phòng khám / Cơ sở y tế <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.selectWrapper,
              attemptedSubmit &&
                !formData.selectedClinic &&
                styles.invalidInput,
            ]}
            onPress={() => setShowClinicModal(true)}
          >
            <Building2 size={20} color="#9ca3af" style={styles.iconLeft} />
            <Text
              style={[
                styles.selectText,
                !formData.selectedClinic && styles.selectPlaceholder,
              ]}
            >
              {formData.selectedClinic
                ? formData.selectedClinic.name
                : "Chọn phòng khám"}
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          {formData.selectedClinic && (
            <Text style={styles.selectedInfo}>
              📍 {formData.selectedClinic.address}
            </Text>
          )}
          {attemptedSubmit && !formData.selectedClinic && (
            <Text style={styles.errorText}>Phòng khám là bắt buộc.</Text>
          )}
        </View>

        {/* Chuyên khoa */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Chuyên khoa <Text style={styles.required}>*</Text>
          </Text>

          {!formData.selectedClinic ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                ℹ️ Vui lòng chọn phòng khám trước để xem danh sách chuyên khoa
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <Stethoscope
                  size={20}
                  color="#9ca3af"
                  style={styles.iconLeft}
                />
                <TextInput
                  style={[
                    styles.input,
                    attemptedSubmit &&
                      !formData.specialty?.toString()?.trim() &&
                      styles.invalidInput,
                  ]}
                  placeholder="Chọn chuyên khoa từ danh sách bên dưới"
                  value={formData.specialtyName}
                  editable={false}
                />
              </View>

              {attemptedSubmit && !formData.specialty?.toString()?.trim() && (
                <Text style={styles.errorText}>Chuyên khoa là bắt buộc.</Text>
              )}

              {loadingSpecialties ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#10b981" />
                  <Text style={styles.loadingText}>
                    Đang tải chuyên khoa...
                  </Text>
                </View>
              ) : specialties.length > 0 ? (
                <View style={styles.chipContainer}>
                  {specialties.map((spec: any) => (
                    <TouchableOpacity
                      key={spec._id || spec.id || spec.name}
                      style={[
                        styles.chip,
                        formData.specialty === (spec._id || spec.id) &&
                          styles.chipSelected,
                      ]}
                      onPress={() => {
                        handleInputChange("specialty", spec._id || spec.id);
                        handleInputChange("specialtyName", spec.name || "");
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.specialty === (spec._id || spec.id) &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {spec.name || spec}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeText}>
                    ⚠️ Phòng khám này chưa có chuyên khoa nào
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Kinh nghiệm */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Kinh nghiệm <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                attemptedSubmit &&
                  !formData.experience?.trim() &&
                  styles.invalidInput,
              ]}
              placeholder="Ví dụ: 10 năm"
              value={formData.experience}
              onChangeText={(v) => handleInputChange("experience", v)}
            />
          </View>
          {attemptedSubmit && !formData.experience?.trim() && (
            <Text style={styles.errorText}>Kinh nghiệm là bắt buộc.</Text>
          )}
        </View>

        {/* Bằng cấp / chứng chỉ */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Chứng chỉ<Text style={styles.required}>*</Text>
          </Text>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1, height: 44 }]}
              placeholder="Thêm bằng cấp (ví dụ: Bác sĩ Chuyên khoa II)"
              value={formData.newQualification}
              onChangeText={(v) => handleInputChange("newQualification", v)}
            />
            <TouchableOpacity
              style={[styles.button, { marginLeft: 8, paddingHorizontal: 12 }]}
              onPress={() => {
                if (formData.newQualification?.trim()) {
                  const next = [
                    ...formData.qualifications,
                    formData.newQualification.trim(),
                  ];
                  handleInputChange("qualifications", next);
                  handleInputChange("newQualification", "");
                }
              }}
            >
              <Text style={styles.buttonText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipContainer}>
            {formData.qualifications.map((q: string, idx: number) => (
              <TouchableOpacity
                key={`${q}-${idx}`}
                style={styles.chip}
                onPress={() => {
                  const filtered = formData.qualifications.filter(
                    (_, i) => i !== idx
                  );
                  handleInputChange("qualifications", filtered);
                }}
              >
                <Text style={styles.chipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {attemptedSubmit &&
            (!Array.isArray(formData.qualifications) ||
              formData.qualifications.length === 0) && (
              <Text style={styles.errorText}>
                Vui lòng thêm ít nhất một chứng chỉ.
              </Text>
            )}
        </View>

        {/* Điều khoản */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => handleInputChange("agreeTerms", !formData.agreeTerms)}
        >
          <View
            style={[
              styles.checkbox,
              attemptedSubmit && !formData.agreeTerms && styles.invalidCheckbox,
              formData.agreeTerms && styles.checkboxChecked,
            ]}
          />
          <Text style={styles.checkboxLabel}>
            Tôi đồng ý với <Text style={styles.link}>Điều khoản sử dụng</Text>{" "}
            và <Text style={styles.link}>Chính sách bảo mật</Text>
          </Text>
        </TouchableOpacity>
        {attemptedSubmit && !formData.agreeTerms && (
          <Text style={styles.errorText}>
            Bạn cần đồng ý với Điều khoản để tiếp tục.
          </Text>
        )}

        {/* Nút đăng ký */}
        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>Gửi yêu cầu đăng ký</Text>
        </TouchableOpacity>

        {/* Thông báo */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ⏳ Tài khoản sẽ được xét duyệt trong vòng 24-48 giờ
          </Text>
        </View>
      </View>

      {/* Modal chọn phòng khám */}
      <Modal
        visible={showClinicModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClinicModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phòng khám</Text>
              <TouchableOpacity onPress={() => setShowClinicModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {loadingClinics ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : (
              <FlatList
                data={clinics}
                keyExtractor={(item) =>
                  item._id?.toString() || item.id?.toString()
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.clinicItem,
                      formData.selectedClinic?._id === item._id &&
                        styles.clinicItemSelected,
                    ]}
                    onPress={() => handleClinicSelect(item)}
                  >
                    <View style={styles.clinicIcon}>
                      <Building2 size={24} color="#10b981" />
                    </View>
                    <View style={styles.clinicInfo}>
                      <Text style={styles.clinicName}>{item.name}</Text>
                      <Text style={styles.clinicAddress}>
                        📍 {item.address}
                      </Text>
                    </View>
                    {formData.selectedClinic?._id === item._id && (
                      <CheckCircle size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Success modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.push("/");
        }}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <Text style={styles.successTitle}>Yêu cầu đã gửi</Text>
            <Text style={styles.successMessage}>
              Yêu cầu của bạn đang được hệ thống phê duyệt. Kết quả sẽ được gửi
              về email của bạn trong vòng 24 giờ.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push("/");
              }}
            >
              <Text style={styles.successButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f9ff",
    padding: 20,
    alignItems: "center",
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#0891b2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },

  inputGroup: {
    marginTop: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  required: {
    color: "#ef4444",
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    paddingHorizontal: 8,
    color: "#111827",
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    padding: 6,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#10b981",
  },
  chipText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
  },

  uploadButton: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  uploadButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  uploadHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
  },

  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
  },

  selectWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 6,
    color: "#111827",
  },
  selectPlaceholder: {
    color: "#9ca3af",
  },
  arrow: {
    fontSize: 24,
    color: "#9ca3af",
  },
  selectedInfo: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#4b5563",
    flex: 1,
    lineHeight: 18,
  },

  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    height: 48,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  noticeBox: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  noticeText: {
    fontSize: 12,
    color: "#92400e",
    textAlign: "center",
  },

  signup: {
    marginTop: 20,
    alignItems: "center",
  },
  link: {
    color: "#10b981",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  clinicItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  clinicItemSelected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  clinicIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 13,
    color: "#6b7280",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#064e3b",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  successButton: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  successButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  invalidInput: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 6,
  },
  invalidCheckbox: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2",
  },
});
