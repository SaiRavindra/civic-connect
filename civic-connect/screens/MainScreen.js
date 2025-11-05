// // screens/MainScreen.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import API from "../utils/api"; // <- use your existing API helper

// const MainScreen = ({ navigation }) => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [userInfo, setUserInfo] = useState({ name: "", email: "" });
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   useFocusEffect(
//     React.useCallback(() => {
//       const fetchUser = async () => {
//         const name = await AsyncStorage.getItem("name");
//         const email = await AsyncStorage.getItem("email");
//         setUserInfo({ name: name || "", email: email || "" });
//       };
//       fetchUser();
//       fetchAlerts();
//     }, [])
//   );

//   const fetchAlerts = async () => {
//     try {
//       setLoading(true);
//       // call backend route exactly
//       const response = await API.get("/alerts/all");
//       // backend returns { success: true, data: [...] }
//       const arr = response.data?.data ?? response.data ?? [];
//       if (!Array.isArray(arr)) {
//         console.warn("Unexpected alerts payload:", response.data);
//       }
//       setAlerts(Array.isArray(arr) ? arr : []);
//     } catch (err) {
//       console.error("❌ Error fetching alerts:", err?.message, err?.response?.data ?? err);
//       // show a helpful message to user
//       Alert.alert("Error", "Failed to load alerts. Check network / server.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchAlerts();
//   };

//   const handleLogout = async () => {
//     await AsyncStorage.clear();
//     navigation.reset({
//       index: 0,
//       routes: [{ name: "Login" }],
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         <View style={styles.header}>
//           <Text style={styles.title}>CivicConnect</Text>
//           <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.profileIcon}>
//             <Ionicons name="person-circle-outline" size={30} color="#1672ce" />
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.sectionTitle}>Quick Access</Text>
//         <View style={styles.quickAccessContainer}>
//           {["Water", "Garbage", "Electricity", "Office Help"].map((item, index) => (
//             <TouchableOpacity key={index} style={styles.quickButton}>
//               <Text style={styles.quickButtonText}>{item}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <TouchableOpacity style={styles.complaintButton} onPress={() => navigation.navigate("Complaint")}>
//           <Ionicons name="add-circle-outline" size={20} color="#fff" />
//           <Text style={styles.complaintButtonText}>Raise a Complaint</Text>
//         </TouchableOpacity>

//         {/* Improved Buttons */}
//         <View style={styles.actionButtonsContainer}>
//           <TouchableOpacity
//             style={styles.secondaryButton}
//             onPress={() => navigation.navigate("ComplaintHistory")}
//           >
//             <Ionicons name="time-outline" size={18} color="#1672ce" />
//             <Text style={styles.secondaryButtonText}>Complaint History</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.refreshButton} onPress={fetchAlerts}>
//             <Ionicons name="refresh" size={18} color="#1672ce" />
//             <Text style={styles.secondaryButtonText}>Refresh</Text>
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.sectionTitle}>Alerts</Text>

//         {loading ? (
//           <ActivityIndicator size="large" color="#1672ce" style={{ marginTop: 20 }} />
//         ) : alerts.length === 0 ? (
//           <Text style={styles.noAlertsText}>No active alerts at the moment.</Text>
//         ) : (
//           alerts.map((alert) => (
//             <View
//               key={alert._id}
//               style={[
//                 styles.alertCard,
//                 alert.urgency === "High" ? { borderLeftColor: "#ef4444", borderLeftWidth: 6 } : {},
//               ]}
//             >
//               <View style={styles.alertHeader}>
//                 <Ionicons
//                   name={alert.alertType === "General" ? "information-circle" : "alert-circle"}
//                   size={20}
//                   color={alert.urgency === "High" ? "#ef4444" : "#1672ce"}
//                 />
//                 <Text style={styles.alertTitle}>{alert.title}</Text>
//               </View>

//               <Text style={styles.alertMessage}>{alert.message}</Text>

//               <View style={styles.alertFooter}>
//                 <Text style={styles.alertDetail}>📍 {alert.location}</Text>
//                 <Text
//                   style={[
//                     styles.alertUrgency,
//                     {
//                       color:
//                         alert.urgency === "High"
//                           ? "#dc2626"
//                           : alert.urgency === "Medium"
//                           ? "#ea580c"
//                           : "#16a34a",
//                     },
//                   ]}
//                 >
//                   {alert.urgency ?? "Low"}
//                 </Text>
//               </View>
//             </View>
//           ))
//         )}
//       </ScrollView>

//       {/* Profile Modal */}
//       <Modal visible={modalVisible} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>User Info</Text>
//             <Text>Name: {userInfo.name}</Text>
//             <Text>Email: {userInfo.email}</Text>

//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
//               <Text style={styles.closeText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default MainScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   header: { padding: 16, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e7edf3" },
//   title: { fontSize: 22, fontWeight: "bold", color: "#0e141b" },
//   sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#0e141b", paddingHorizontal: 16, paddingTop: 20 },
//   quickAccessContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", padding: 16 },
//   quickButton: { backgroundColor: "#1672ce", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginVertical: 8, minWidth: "45%", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   quickButtonText: { color: "white", fontWeight: "bold" },
//   complaintButton: { flexDirection: "row", backgroundColor: "#1672ce", marginHorizontal: 16, borderRadius: 10, alignItems: "center", justifyContent: "center", height: 50, marginTop: 16, gap: 8, shadowColor: "#1672ce", shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
//   complaintButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   actionButtonsContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 15 },
//   secondaryButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#e0f2fe", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
//   refreshButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
//   secondaryButtonText: { color: "#1672ce", fontWeight: "bold", fontSize: 14 },
//   alertCard: { backgroundColor: "#ffffff", marginHorizontal: 16, marginVertical: 10, borderRadius: 10, padding: 14, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
//   alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
//   alertTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 8, color: "#0f172a" },
//   alertMessage: { fontSize: 14, color: "#334155", marginBottom: 8 },
//   alertFooter: { flexDirection: "row", justifyContent: "space-between" },
//   alertDetail: { fontSize: 13, color: "#475569" },
//   alertUrgency: { fontSize: 13, fontWeight: "bold" },
//   noAlertsText: { textAlign: "center", color: "#64748b", marginTop: 20 },
//   profileIcon: { position: "absolute", right: 16, top: 10 },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 },
//   modalBox: { backgroundColor: "white", padding: 24, borderRadius: 10, width: "80%", alignItems: "center" },
//   modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
//   logoutButton: { backgroundColor: "#e11d48", padding: 10, borderRadius: 8, alignItems: "center", width: "100%", marginTop: 20 },
//   logoutText: { color: "white", fontWeight: "bold" },
//   closeButton: { marginTop: 10 },
//   closeText: { color: "#1672ce", fontWeight: "bold" },
// });

//


// screens/MainScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import API from "../utils/api";

const MainScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        const name = await AsyncStorage.getItem("name");
        const email = await AsyncStorage.getItem("email");
        setUserInfo({ name: name || "", email: email || "" });
      };
      fetchUser();
      fetchAlerts();
    }, [])
  );

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await API.get("/alerts/all");
      const arr = response.data?.data ?? response.data ?? [];
      if (!Array.isArray(arr)) {
        console.warn("Unexpected alerts payload:", response.data);
      }
      setAlerts(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("❌ Error fetching alerts:", err?.message, err?.response?.data ?? err);
      Alert.alert("Error", "Failed to load alerts. Check network / server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const quickAccessIcons = {
    Water: "water",
    Garbage: "trash-bin",
    Electricity: "flash",
    "Office Help": "business",
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#1672ce"
            colors={["#1672ce"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="business" size={24} color="#1672ce" />
              <Text style={styles.title}>CivicConnect</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setModalVisible(true)} 
              style={styles.profileIcon}
              activeOpacity={0.7}
            >
              <View style={styles.profileIconCircle}>
                <Ionicons name="person" size={22} color="#1672ce" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userInfo.name || "User"}</Text>
        </View>

        {/* Quick Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessContainer}>
            {["Water", "Garbage", "Electricity", "Office Help"].map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickButton}
                activeOpacity={0.8}
              >
                <View style={styles.quickButtonIconContainer}>
                  <Ionicons 
                    name={quickAccessIcons[item]} 
                    size={28} 
                    color="#1672ce" 
                  />
                </View>
                <Text style={styles.quickButtonText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity 
          style={styles.complaintButton} 
          onPress={() => navigation.navigate("Complaint")}
          activeOpacity={0.9}
        >
          <View style={styles.complaintButtonContent}>
            <View style={styles.complaintIconCircle}>
              <Ionicons name="add" size={24} color="#fff" />
            </View>
            <Text style={styles.complaintButtonText}>Raise a Complaint</Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ComplaintHistory")}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={20} color="#1672ce" />
            <Text style={styles.secondaryButtonText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchAlerts}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#1672ce" />
            <Text style={styles.secondaryButtonText}>Refresh Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Alerts Section */}
        <View style={styles.section}>
          <View style={styles.alertsHeader}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {alerts.length > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{alerts.length}</Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1672ce" />
              <Text style={styles.loadingText}>Loading alerts...</Text>
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyStateTitle}>All Clear!</Text>
              <Text style={styles.emptyStateText}>No active alerts at the moment.</Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <View
                key={alert._id}
                style={[
                  styles.alertCard,
                  alert.urgency === "High" && styles.alertCardHigh,
                  alert.urgency === "Medium" && styles.alertCardMedium,
                ]}
              >
                <View style={styles.alertCardHeader}>
                  <View style={[
                    styles.alertIconContainer,
                    { backgroundColor: alert.urgency === "High" ? "#fee2e2" : "#dbeafe" }
                  ]}>
                    <Ionicons
                      name={alert.alertType === "General" ? "information-circle" : "alert-circle"}
                      size={24}
                      color={alert.urgency === "High" ? "#ef4444" : "#1672ce"}
                    />
                  </View>
                  <View style={styles.alertTitleContainer}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text
                      style={[
                        styles.alertUrgencyBadge,
                        {
                          backgroundColor:
                            alert.urgency === "High"
                              ? "#fef2f2"
                              : alert.urgency === "Medium"
                              ? "#fff7ed"
                              : "#f0fdf4",
                          color:
                            alert.urgency === "High"
                              ? "#dc2626"
                              : alert.urgency === "Medium"
                              ? "#ea580c"
                              : "#16a34a",
                        },
                      ]}
                    >
                      {alert.urgency ?? "Low"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.alertMessage}>{alert.message}</Text>

                <View style={styles.alertFooter}>
                  <View style={styles.alertLocationContainer}>
                    <Ionicons name="location" size={16} color="#64748b" />
                    <Text style={styles.alertLocation}>{alert.location}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Enhanced Profile Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <View style={styles.modalProfileIcon}>
                <Ionicons name="person" size={32} color="#1672ce" />
              </View>
              <Text style={styles.modalTitle}>Profile</Text>
            </View>

            <View style={styles.modalInfoContainer}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="person-outline" size={20} color="#64748b" />
                <View style={styles.modalInfoTextContainer}>
                  <Text style={styles.modalInfoLabel}>Name</Text>
                  <Text style={styles.modalInfoValue}>{userInfo.name}</Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalInfoRow}>
                <Ionicons name="mail-outline" size={20} color="#64748b" />
                <View style={styles.modalInfoTextContainer}>
                  <Text style={styles.modalInfoLabel}>Email</Text>
                  <Text style={styles.modalInfoValue}>{userInfo.email}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setModalVisible(false)} 
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  
  // Header Styles
  header: { 
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  profileIcon: {
    padding: 4,
  },
  profileIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
  },

  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 4,
    letterSpacing: -0.5,
  },

  // Section Styles
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#0f172a",
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Quick Access Styles
  quickAccessContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between",
    gap: 12,
  },
  quickButton: { 
    backgroundColor: "#ffffff",
    borderRadius: 16,
    width: "48%",
    aspectRatio: 1.2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1672ce",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  quickButtonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickButtonText: { 
    color: "#0f172a", 
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },

  // Primary Complaint Button
  complaintButton: { 
    backgroundColor: "#1672ce",
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: "#1672ce",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  complaintButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  complaintIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  complaintButtonText: { 
    color: "#ffffff", 
    fontSize: 17, 
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Action Buttons
  actionButtonsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    marginTop: 16,
    marginHorizontal: 20,
    gap: 12,
  },
  secondaryButton: { 
    flexDirection: "row", 
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e0f2fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  refreshButton: { 
    flexDirection: "row", 
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e0f2fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: { 
    color: "#1672ce", 
    fontWeight: "600", 
    fontSize: 14,
  },

  // Alerts Section
  alertsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  alertBadge: {
    backgroundColor: "#1672ce",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  alertBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  // Alert Card Styles
  alertCard: { 
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#e0f2fe",
  },
  alertCardHigh: {
    borderLeftColor: "#ef4444",
  },
  alertCardMedium: {
    borderLeftColor: "#f59e0b",
  },
  alertCardHeader: { 
    flexDirection: "row", 
    alignItems: "center",
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  alertTitleContainer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertTitle: { 
    fontSize: 16, 
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    letterSpacing: -0.2,
  },
  alertUrgencyBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alertMessage: { 
    fontSize: 14, 
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertLocation: { 
    fontSize: 13, 
    color: "#64748b",
    fontWeight: "500",
  },

  // Loading & Empty States
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: { 
    textAlign: "center", 
    color: "#64748b",
    fontSize: 15,
    fontWeight: "500",
  },

  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalBox: { 
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  modalHeader: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalProfileIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  modalInfoContainer: {
    paddingVertical: 24,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  modalInfoTextContainer: {
    flex: 1,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 8,
  },
  logoutButton: { 
    flexDirection: "row",
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: { 
    color: "#ffffff", 
    fontWeight: "700",
    fontSize: 16,
  },
  closeButton: { 
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeText: { 
    color: "#64748b", 
    fontWeight: "600",
    fontSize: 16,
  },
});
