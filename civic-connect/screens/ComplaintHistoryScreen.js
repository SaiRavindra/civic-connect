import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import API from "../utils/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ComplaintHistoryScreen = () => {
  const navigation = useNavigation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await API.get('/complaints', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaints(response.data);
      } catch (error) {
        console.error('❌ Error fetching user complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1672ce" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Complaint History</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {complaints.map((complaint, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => setSelectedComplaint(complaint)}
          >
            <View>
              <Text style={styles.title}>{complaint.issueType}</Text>
              <Text style={styles.id}>Complaint ID: {complaint._id}</Text>
            </View>
            <Text style={styles.status}>{complaint.status || 'Pending'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Complaint Detail Modal */}
      <Modal visible={!!selectedComplaint} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxLarge}>
            <Text style={styles.modalTitle}>{selectedComplaint?.issueType}</Text>
            <Text style={styles.modalText}>Complaint ID: {selectedComplaint?._id}</Text>
            <Text style={styles.modalText}>
              Date: {new Date(selectedComplaint?.submittedAt).toLocaleString()}
            </Text>
            <Text style={styles.modalText}>Name: {selectedComplaint?.name}</Text>
            <Text style={styles.modalText}>Contact: {selectedComplaint?.contact}</Text>
            <Text style={styles.modalText}>Location: {selectedComplaint?.location}</Text>
            <Text style={styles.modalText}>Description: {selectedComplaint?.description}</Text>
            <Text style={styles.modalText}>Status: {selectedComplaint?.status || 'Pending'}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedComplaint(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ComplaintHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 10,
    color: '#0e141b',
  },
  backButton: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#1672ce',
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0e141b',
  },
  id: {
    fontSize: 13,
    color: '#4e7397',
    marginTop: 4,
  },
  status: {
    fontSize: 14,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBoxLarge: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    maxHeight: '80%',
    width: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginVertical: 2,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#1672ce',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
