// screens/MainScreen.js

// import React from 'react';
// import { Ionicons } from '@expo/vector-icons'; // or react-native-vector-icons/Ionicons
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useFocusEffect } from '@react-navigation/native';
// import { Modal } from 'react-native';
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// const MainScreen = ({ navigation }) => {
//   return (
//     <View style={styles.container}>
//       <ScrollView>
//         <View style={styles.header}>
//           <Text style={styles.title}>CivicConnect</Text>
//         </View>

//         <Text style={styles.sectionTitle}>Quick Access</Text>

//         <View style={styles.quickAccessContainer}>
//           {['Water', 'Garbage', 'Electricity', 'Office Help'].map((item, index) => (
//             <TouchableOpacity key={index} style={styles.quickButton}>
//               <Text style={styles.quickButtonText}>{item}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <TouchableOpacity
//           style={styles.complaintButton}
//           onPress={() => navigation.navigate('Complaint')}
//         >
//           <Text style={styles.complaintButtonText}>Raise a Complaint</Text>
//         </TouchableOpacity>

//         <Text style={styles.sectionTitle}>Recent Complaints</Text>

//         {[
//           { title: 'Water Leak', id: '2023-001', status: 'In Progress' },
//           { title: 'Garbage Pickup Missed', id: '2023-002', status: 'Resolved' },
//           { title: 'Power Outage', id: '2023-003', status: 'Pending' },
//         ].map((complaint, idx) => (
//           <View key={idx} style={styles.complaintCard}>
//             <View>
//               <Text style={styles.complaintTitle}>{complaint.title}</Text>
//               <Text style={styles.complaintId}>Complaint ID: {complaint.id}</Text>
//             </View>
//             <Text style={styles.status}>{complaint.status}</Text>
//           </View>
//         ))}
//         <TouchableOpacity style={styles.complaintButton}
//         onPress={() => navigation.navigate('ComplaintHistory')}>
//         <Text style={styles.complaintButtonText}>View Complaint History</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const MainScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  // Fetch name and email when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        const name = await AsyncStorage.getItem('name');
        const email = await AsyncStorage.getItem('email');
        setUserInfo({ name: name || '', email: email || '' });
      };
      fetchUser();
    }, [])
  );

  // Logout handler
  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>CivicConnect</Text>

          {/* Profile Icon */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.profileIcon}
          >
            <Ionicons name="person-circle-outline" size={30} color="#1672ce" />
          </TouchableOpacity>
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

        <TouchableOpacity
          style={styles.complaintButton}
          onPress={() => navigation.navigate('ComplaintHistory')}
        >
          <Text style={styles.complaintButtonText}>View Complaint History</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>User Info</Text>
            <Text>Name: {userInfo.name}</Text>
            <Text>Email: {userInfo.email}</Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
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
  profileIcon: {
  position: 'absolute',
  right: 16,
  top: 10,
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

modalBox: {
  backgroundColor: 'white',
  padding: 24,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},

logoutButton: {
  backgroundColor: '#e11d48',
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
  width: '100%',
  marginTop: 20,
},

logoutText: {
  color: 'white',
  fontWeight: 'bold',
},

closeButton: {
  marginTop: 10,
},

closeText: {
  color: '#1672ce',
  fontWeight: 'bold',
},
});
