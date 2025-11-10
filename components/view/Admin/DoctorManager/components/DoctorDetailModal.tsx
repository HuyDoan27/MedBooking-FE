import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function DoctorDetailModal({ doctor, visible, onClose }) {
    if (!doctor) return null;

    const getStatusConfig = (status) => {
        switch (status) {
            case 1:
                return { label: "Hoạt động", bgColor: "#dcfce7", textColor: "#15803d", icon: "check-circle" };
            case 2:
                return { label: "Chờ duyệt", bgColor: "#fed7aa", textColor: "#c2410c", icon: "clock" };
            case 3:
                return { label: "Đã từ chối", bgColor: "#fee2e2", textColor: "#dc2626", icon: "x-circle" };
            default:
                return { label: "Khác", bgColor: "#f1f5f9", textColor: "#64748b", icon: "help-circle" };
        }
    };

    const statusConfig = getStatusConfig(doctor.status);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.modalContainer}>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                    >
                        {/* Doctor Avatar & Name */}
                        <View style={styles.profileSection}>
                            <Text style={styles.doctorName}>{doctor.fullName}</Text>
                            <Text style={styles.specialty}>{doctor.specialty?.name || "Chưa xác định"}</Text>

                            {/* Status Badge */}
                            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                                <Feather name={statusConfig.icon} size={14} color={statusConfig.textColor} />
                                <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                                    {statusConfig.label}
                                </Text>
                            </View>
                        </View>

                        {/* Stats Cards */}
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Feather name="star" size={18} color="#f59e0b" />
                                </View>
                                <Text style={styles.statValue}>{doctor.rating?.toFixed(1) || "0.0"}</Text>
                                <Text style={styles.statLabel}>Đánh giá</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Feather name="message-circle" size={18} color="#8b5cf6" />
                                </View>
                                <Text style={styles.statValue}>{doctor.totalReviews || 0}</Text>
                                <Text style={styles.statLabel}>Reviews</Text>
                            </View>

                            <View style={styles.statCard}>
                                <View style={styles.statIconContainer}>
                                    <Feather name="calendar" size={18} color="#0891b2" />
                                </View>
                                <Text style={styles.statValue}>{doctor.totalAppointments || 0}</Text>
                                <Text style={styles.statLabel}>Lịch khám</Text>
                            </View>
                        </View>

                        {/* Contact Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconCircle}>
                                        <Feather name="mail" size={16} color="#0891b2" />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Email</Text>
                                        <Text style={styles.infoValue} numberOfLines={1}>
                                            {doctor.email}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoDivider} />

                                <View style={styles.infoRow}>
                                    <View style={styles.infoIconCircle}>
                                        <Feather name="phone" size={16} color="#0891b2" />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Số điện thoại</Text>
                                        <Text style={styles.infoValue}>{doctor.phoneNumber}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Clinic Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Phòng khám</Text>
                            <View style={styles.clinicCard}>
                                <View style={styles.clinicHeader}>
                                    <View style={styles.clinicIconCircle}>
                                        <Feather name="map-pin" size={18} color="#0891b2" />
                                    </View>
                                    <Text style={styles.clinicName} numberOfLines={2}>
                                        {doctor.clinic?.name || doctor.clinicName || "Chưa có phòng khám"}
                                    </Text>
                                </View>
                                {(doctor.clinic?.address || doctor.clinicAddress) && (
                                    <Text style={styles.clinicAddress} numberOfLines={2}>
                                        {doctor.clinic?.address || doctor.clinicAddress}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Experience & Qualifications */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Kinh nghiệm & Trình độ</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.experienceRow}>
                                    <View style={styles.experienceIcon}>
                                        <Feather name="award" size={18} color="#0891b2" />
                                    </View>
                                    <View style={styles.experienceContent}>
                                        <Text style={styles.experienceLabel}>Kinh nghiệm</Text>
                                        <Text style={styles.experienceValue}>
                                            {typeof doctor.experience === "string"
                                                ? doctor.experience
                                                : `${doctor.experience || 0} năm`}
                                        </Text>
                                    </View>
                                </View>

                                {doctor.qualifications && doctor.qualifications.length > 0 && (
                                    <>
                                        <View style={styles.infoDivider} />
                                        <View style={styles.qualificationsSection}>
                                            <Text style={styles.qualificationsLabel}>Bằng cấp & Chứng chỉ:</Text>
                                            {doctor.qualifications.map((qual, index) => {
                                                // Parse if it's a JSON string
                                                let qualText = qual;
                                                try {
                                                    const parsed = JSON.parse(qual);
                                                    qualText = Array.isArray(parsed) ? parsed.join(", ") : qual;
                                                } catch (e) {
                                                    // Keep original if not JSON
                                                }
                                                return (
                                                    <View key={index} style={styles.qualificationItem}>
                                                        <Feather name="check" size={14} color="#10b981" />
                                                        <Text style={styles.qualificationText}>{qualText}</Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Reject Reason (if status is 3) */}
                        {doctor.status === 3 && doctor.rejectReason && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Lý do từ chối</Text>
                                <View style={styles.rejectCard}>
                                    <Feather name="alert-circle" size={18} color="#dc2626" />
                                    <Text style={styles.rejectText}>{doctor.rejectReason}</Text>
                                </View>
                            </View>
                        )}

                        {/* Created Date */}
                        {doctor.createdAt && (
                            <View style={styles.section}>
                                <View style={styles.dateCard}>
                                    <Feather name="clock" size={14} color="#64748b" />
                                    <Text style={styles.dateText}>
                                        Tham gia:{" "}
                                        {new Date(doctor.createdAt).toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.bottomSpacer} />
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.closeFooterButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.closeFooterButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    backdrop: {
        flex: 1,
    },
    modalContainer: {
        width: width,
        height: height * 0.9,
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: "#cbd5e1",
        borderRadius: 3,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: "700",
        color: "#0f172a",
    },
    closeButton: {
        position: "absolute",
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 24,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 3,
        borderColor: "#bae6fd",
    },
    doctorName: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
        textAlign: "center",
    },
    specialty: {
        fontSize: 15,
        color: "#0891b2",
        fontWeight: "600",
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 14,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    infoIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#e0f2fe",
        justifyContent: "center",
        alignItems: "center",
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#64748b",
        marginBottom: 2,
        fontWeight: "500",
    },
    infoValue: {
        fontSize: 14,
        color: "#0f172a",
        fontWeight: "600",
    },
    infoDivider: {
        height: 1,
        backgroundColor: "#e2e8f0",
        marginVertical: 12,
    },
    clinicCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    clinicHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    clinicIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e0f2fe",
        justifyContent: "center",
        alignItems: "center",
    },
    clinicName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
        lineHeight: 20,
    },
    clinicAddress: {
        fontSize: 13,
        color: "#64748b",
        lineHeight: 18,
        paddingLeft: 52,
    },
    experienceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    experienceIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e0f2fe",
        justifyContent: "center",
        alignItems: "center",
    },
    experienceContent: {
        flex: 1,
    },
    experienceLabel: {
        fontSize: 12,
        color: "#64748b",
        marginBottom: 2,
        fontWeight: "500",
    },
    experienceValue: {
        fontSize: 15,
        color: "#0f172a",
        fontWeight: "600",
    },
    qualificationsSection: {
        gap: 8,
    },
    qualificationsLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    qualificationItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    qualificationText: {
        flex: 1,
        fontSize: 13,
        color: "#475569",
        lineHeight: 18,
    },
    rejectCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        backgroundColor: "#fef2f2",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fee2e2",
    },
    rejectText: {
        flex: 1,
        fontSize: 14,
        color: "#dc2626",
        lineHeight: 20,
    },
    dateCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 10,
        justifyContent: "center",
    },
    dateText: {
        fontSize: 13,
        color: "#64748b",
        fontWeight: "500",
    },
    bottomSpacer: {
        height: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Platform.OS === "ios" ? 28 : 16,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        backgroundColor: "#ffffff",
    },
    closeFooterButton: {
        backgroundColor: "#0891b2",
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#0891b2",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    closeFooterButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
});