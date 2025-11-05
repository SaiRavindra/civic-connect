import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import API from "../utils/api";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];

const AdminComplaintsList = () => {
  const route = useRoute();
  const passedComplaints = route.params?.complaints || [];
  const passedFilters = route.params?.filters || null; // ✅ Save filters (status, issueType, ward, etc.)

  const [complaints, setComplaints] = useState(passedComplaints);
  const [allComplaints, setAllComplaints] = useState([]); // store all complaints for refilter
  const [loading, setLoading] = useState(passedComplaints.length === 0);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [visibleCount, setVisibleCount] = useState(10);

  // ✅ Fetch all complaints and reapply filters if needed
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/complaints/all");
      let data = res.data;

      // ✅ Reapply filters if available
      if (passedFilters) {
        const { status, issueType, ward, location, searchQuery } = passedFilters;
        data = data.filter((c) => {
          return (
            (status === "All" || c.status === status) &&
            (issueType === "All" || c.issueType === issueType) &&
            (ward === "All" || c.ward === ward) &&
            (location === "All" || c.location === location) &&
            (!searchQuery ||
              c._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.description.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        });
      }

      setAllComplaints(res.data);
      setComplaints(data);

      // Store statuses for dropdowns
      const initialStatuses = {};
      data.forEach((c) => {
        initialStatuses[c._id] = c.status || "Pending";
      });
      setStatusUpdates(initialStatuses);
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      Alert.alert("Error", "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [passedFilters]);

  useEffect(() => {
    if (passedComplaints.length === 0) {
      fetchComplaints();
    } else {
      const initialStatuses = {};
      passedComplaints.forEach((c) => {
        initialStatuses[c._id] = c.status || "Pending";
      });
      setStatusUpdates(initialStatuses);
      setLoading(false);
    }
  }, [fetchComplaints, passedComplaints]);

  // ✅ Handle status update (and refetch filtered list)
  const handleUpdateStatus = async (id) => {
    try {
      await API.put(`/complaints/${id}/status`, {
        status: statusUpdates[id],
      });
      Alert.alert("Success", "Complaint status updated successfully!");
      fetchComplaints(); // refetch and reapply filters
    } catch (err) {
      console.error("❌ Failed to update:", err);
      Alert.alert("Error", "Could not update complaint status.");
    }
  };

  // ✅ Summary counts (based on filtered list)
  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  // ✅ Pagination logic
  const visibleComplaints = complaints.slice(0, visibleCount);
  const loadMoreComplaints = () => {
    if (visibleCount < complaints.length) {
      setVisibleCount((prev) => prev + 10);
    }
  };

  const getCardColor = (status) => {
    switch (status) {
      case "Pending":
        return "#fee2e2";
      case "In Progress":
        return "#fef3c7";
      case "Resolved":
        return "#dcfce7";
      default:
        return "#f8fafc";
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1672ce" />
      </View>
    );
  }

  return (
    <FlatList
      data={visibleComplaints}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <>
          {/* 🏠 Summary Boxes */}
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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleUpdateStatus(item._id)}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListFooterComponent={
        visibleCount < complaints.length ? (
          <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreComplaints}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        ) : null
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
};

export default AdminComplaintsList;

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  card: {
    padding: 16,
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  label: { fontWeight: "bold" },
  picker: {
    height: 50,
    backgroundColor: "#f1f5f9",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#1672ce",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "bold" },
  loadMoreButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    margin: 10,
  },
  loadMoreText: { color: "#fff", fontWeight: "bold" },
});
