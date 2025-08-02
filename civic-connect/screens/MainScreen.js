// screens/MainScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const MainScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>CivicConnect</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.quickAccessContainer}>
          {['Water', 'Garbage', 'Electricity', 'Office Help'].map((item, index) => (
            <TouchableOpacity key={index} style={styles.quickButton}>
              <Text style={styles.quickButtonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.complaintButton}
          onPress={() => navigation.navigate('Complaint')}
        >
          <Text style={styles.complaintButtonText}>Raise a Complaint</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent Complaints</Text>

        {[
          { title: 'Water Leak', id: '2023-001', status: 'In Progress' },
          { title: 'Garbage Pickup Missed', id: '2023-002', status: 'Resolved' },
          { title: 'Power Outage', id: '2023-003', status: 'Pending' },
        ].map((complaint, idx) => (
          <View key={idx} style={styles.complaintCard}>
            <View>
              <Text style={styles.complaintTitle}>{complaint.title}</Text>
              <Text style={styles.complaintId}>Complaint ID: {complaint.id}</Text>
            </View>
            <Text style={styles.status}>{complaint.status}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.complaintButton}
        onPress={() => navigation.navigate('ComplaintHistory')}>
        <Text style={styles.complaintButtonText}>View Complaint History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e7edf3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0e141b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0e141b',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  quickButton: {
    backgroundColor: '#1672ce',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  quickButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  complaintButton: {
    backgroundColor: '#1672ce',
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: 16,
  },
  complaintButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  complaintCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0e141b',
  },
  complaintId: {
    fontSize: 13,
    color: '#4e7397',
    marginTop: 4,
  },
  status: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#0e141b',
  },
});
