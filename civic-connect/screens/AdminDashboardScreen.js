import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import API from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminDashboardScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});

  const fetchComplaints = async () => {
    try {
      setLoading(true); // Show spinner while fetching
      const response = await API.get("/complaints/all"); // No token needed
      setComplaints(response.data);

      const initialStatuses = {};
      response.data.forEach((complaint) => {
        initialStatuses[complaint._id] = complaint.status || "Pending";
      });
      setStatusUpdates(initialStatuses);
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      Alert.alert("Error", "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId) => {
    try {
      await API.put(`/complaints/${complaintId}/status`, {
        status: statusUpdates[complaintId],
      });
      Alert.alert("Success", "Status updated successfully!");
      fetchComplaints(); // Refresh after update
    } catch (err) {
      console.error("❌ Failed to update:", err);
      Alert.alert("Error", "Could not update complaint status.");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1672ce" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Admin - All Complaints</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchComplaints}>
        <Text style={styles.refreshText}>🔄 Refresh Complaints</Text>
      </TouchableOpacity>

      {complaints.map((complaint) => {
        const { _id, issueType, description, status, date } = complaint;

        return (
          <View key={_id} style={styles.card}>
            <Text style={styles.title}>{issueType}</Text>
            <Text>ID: {_id}</Text>
            <Text>Status: {status}</Text>
            <Text>Date: {date}</Text>
            <Text>Description: {description}</Text>

            <Text style={styles.label}>Update Status:</Text>
            <Picker
              selectedValue={statusUpdates[_id]}
              style={styles.picker}
              onValueChange={(value) =>
                setStatusUpdates((prev) => ({ ...prev, [_id]: value }))
              }
            >
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="In Progress" value="In Progress" />
              <Picker.Item label="Completed" value="Completed" />
            </Picker>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleUpdateStatus(_id)}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: "#d1d5db",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  refreshText: {
    color: "#111827",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#e2e8f0",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
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
  saveText: {
    color: "white",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
