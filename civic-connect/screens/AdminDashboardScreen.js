import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import API from "../utils/api";
import { Ionicons } from "@expo/vector-icons";

// Updated status & location options
const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];
const LOCATION_OPTIONS = ["All", "Srinagar", "Ramnagar"];

// ✅ Added all possible issue types (including Drainage & Garbage)
const ISSUE_TYPE_OPTIONS = ["All", "Water", "Road", "Electricity", "Drainage", "Garbage"];

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [issueTypeFilter, setIssueTypeFilter] = useState("All");
  const [wardFilter, setWardFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/complaints/all");
      setComplaints(response.data);

      const initialStatuses = {};
      response.data.forEach((complaint) => {
        initialStatuses[complaint._id] = complaint.status || "Pending";
      });
      setStatusUpdates(initialStatuses);
      setPage(1);
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      Alert.alert("Error", "Failed to load complaints");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    let temp = [...complaints];
    if (statusFilter !== "All") temp = temp.filter((c) => c.status === statusFilter);
    if (issueTypeFilter !== "All") temp = temp.filter((c) => c.issueType === issueTypeFilter);
    if (wardFilter !== "All") temp = temp.filter((c) => c.ward === wardFilter);
    if (locationFilter !== "All") temp = temp.filter((c) => c.location === locationFilter);

    if (searchQuery.trim()) {
      temp = temp.filter(
        (c) =>
          c._id.includes(searchQuery) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredComplaints(temp.slice(0, page * perPage));
  }, [
    complaints,
    searchQuery,
    statusFilter,
    issueTypeFilter,
    wardFilter,
    locationFilter,
    page,
    perPage,
  ]);

  const handleLoadMore = () => {
    if (filteredComplaints.length < complaints.length) setPage((prev) => prev + 1);
  };

  const handleUpdateStatus = async (complaintId) => {
    try {
      await API.put(`/complaints/${complaintId}/status`, {
        status: statusUpdates[complaintId],
      });
      Alert.alert("Success", "Status updated successfully!");
      fetchComplaints();
    } catch (err) {
      console.error("❌ Failed to update:", err);
      Alert.alert("Error", "Could not update complaint status.");
    }
  };

  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  const getCardColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f87171";
      case "In Progress":
        return "#fbbf24";
      case "Resolved":
        return "#34d399";
      default:
        return "#e2e8f0";
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1672ce" />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredComplaints}
      keyExtractor={(item) => item._id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={<Text style={styles.placeholder}>No complaints found.</Text>}
      ListHeaderComponent={
        <>
          {/* 🏠 Dashboard Summary */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: "#f87171" }]}>
              <Ionicons name="clipboard-outline" size={26} color="#fff" />
              <Text style={styles.summaryValue}>{totalComplaints}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#fbbf24" }]}>
              <Ionicons name="time-outline" size={26} color="#fff" />
              <Text style={styles.summaryValue}>{pendingCount}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#60a5fa" }]}>
              <Ionicons name="reload-outline" size={26} color="#fff" />
              <Text style={styles.summaryValue}>{inProgressCount}</Text>
              <Text style={styles.summaryLabel}>In Progress</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#34d399" }]}>
              <Ionicons name="checkmark-circle-outline" size={26} color="#fff" />
              <Text style={styles.summaryValue}>{resolvedCount}</Text>
              <Text style={styles.summaryLabel}>Resolved</Text>
            </View>
          </View>

          {/* 🔍 Filters */}
          <View style={styles.filtersContainer}>
            <TextInput
              placeholder="Search by ID or description"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />

            <Picker selectedValue={statusFilter} style={styles.picker} onValueChange={setStatusFilter}>
              <Picker.Item label="All Status" value="All" />
              {STATUS_OPTIONS.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>

            {/* ✅ Issue Type Picker (updated with Drainage & Garbage) */}
            <Picker selectedValue={issueTypeFilter} style={styles.picker} onValueChange={setIssueTypeFilter}>
              {ISSUE_TYPE_OPTIONS.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>

            {/* Location Filter */}
            <Picker selectedValue={locationFilter} style={styles.picker} onValueChange={setLocationFilter}>
              {LOCATION_OPTIONS.map((loc) => (
                <Picker.Item key={loc} label={loc} value={loc} />
              ))}
            </Picker>

            {/* Ward Filter */}
            <Picker selectedValue={wardFilter} style={styles.picker} onValueChange={setWardFilter}>
              <Picker.Item label="All Wards" value="All" />
              {[...new Set(complaints.map((c) => c.ward))].map((ward) => (
                <Picker.Item key={ward} label={ward} value={ward} />
              ))}
            </Picker>
          </View>

          {/* Buttons */}
          <View style={styles.middleButtonsRow}>
            <TouchableOpacity
              style={styles.wardInsightsButton}
              onPress={() => navigation.navigate("AdminWardInsights")}
            >
              <Text style={styles.buttonText}>🏘️ Ward Insights</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.analyticsButton}
              onPress={() => navigation.navigate("AdminDashboardCharts")}
            >
              <Text style={styles.buttonText}>📊 Analytics</Text>
            </TouchableOpacity>
          </View>
            <View style={styles.refreshContainer}>
  {/* 🔄 Refresh Complaints Button */}
  <TouchableOpacity
    style={styles.refreshButton}
    onPress={() => {
      setRefreshing(true);
      fetchComplaints();
    }}
  >
    <Text style={styles.refreshText}>🔄 Refresh Complaints</Text>
  </TouchableOpacity>

  {/* 🚨 Alert Notifications Button */}
  <TouchableOpacity
    style={[styles.refreshButton, { marginTop: 8 }]}
    onPress={() => navigation.navigate("AdminAlert")}
  >
    <Text style={styles.refreshText}>🚨 Alert Notifications</Text>
  </TouchableOpacity>

  <TouchableOpacity
  style={[styles.refreshButton, { marginTop: 8, backgroundColor: "#fbbf24" }]}
  onPress={() => navigation.navigate("ManageAlerts")}
>
  <Text style={styles.refreshText}>⚙️ Manage Alerts</Text>
</TouchableOpacity>

</View>

        </>
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: getCardColor(item.status) }]}>
          <Text style={styles.title}>{item.issueType}</Text>
          <Text>ID: {item._id}</Text>
          <Text>Status: {item.status}</Text>
          <Text>Ward: {item.ward}</Text>
          <Text>Location: {item.location}</Text>
          <Text>Date: {new Date(item.submittedAt).toLocaleString()}</Text>
          <Text>Description: {item.description}</Text>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.label}>Update Status:</Text>
            <View style={{ marginTop: 8 }}>
              <Picker
                selectedValue={statusUpdates[item._id]}
                style={styles.picker}
                onValueChange={(value) =>
                  setStatusUpdates((prev) => ({ ...prev, [item._id]: value }))
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleUpdateStatus(item._id)}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    margin: 10,
  },
  summaryCard: {
    width: "48%",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  summaryValue: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 5 },
  summaryLabel: { color: "#fff", fontSize: 14, marginTop: 2 },
  filtersContainer: { paddingHorizontal: 10, marginBottom: 10 },
  searchInput: {
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 6,
    marginBottom: 5,
  },
  picker: {
    height: 50,
    backgroundColor: "#f1f5f9",
    marginBottom: 5,
  },
  middleButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  wardInsightsButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  analyticsButton: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  refreshContainer: { alignItems: "center", marginBottom: 10 },
  refreshButton: {
    backgroundColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    width: "70%",
  },
  refreshText: { color: "#111827", fontWeight: "bold", textAlign: "center" },
  card: { padding: 16, borderRadius: 10, margin: 10 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  label: { fontWeight: "bold" },
  saveButton: {
    backgroundColor: "#1672ce",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "bold" },
  placeholder: { color: "#666", textAlign: "center", marginTop: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
