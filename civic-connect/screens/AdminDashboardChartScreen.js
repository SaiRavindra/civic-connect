// import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
// import { PieChart, BarChart } from 'react-native-chart-kit';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import API from '../utils/api';

// const screenWidth = Dimensions.get('window').width;
// const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#9966FF', '#FF6666', '#66B2FF'];

// export default function AdminDashboardChartScreen() {
//   const [wards, setWards] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         const response = await API.get('/insights/last-30-days', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         // Add validation for the response data
//         const wardsData = response.data.wards || [];
//         setWards(Array.isArray(wardsData) ? wardsData : []);
//       } catch (error) {
//         console.error('❌ Error fetching insights:', error);
//         setWards([]); // Set empty array on error
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#1672ce" />
//       </View>
//     );
//   }

//   if (!wards || wards.length === 0) {
//     return (
//       <View style={styles.loaderContainer}>
//         <Text>No complaints data available for the last 30 days.</Text>
//       </View>
//     );
//   }

//   // Enhanced pie chart data with better validation
//   const pieData = wards
//     .filter(ward => ward && typeof ward.totalComplaints === 'number' && ward.totalComplaints > 0)
//     .map((ward, index) => ({
//       name: (ward.ward && ward.ward.trim()) || `Ward ${index + 1}`,
//       population: Math.max(0, ward.totalComplaints), // Ensure positive number
//       color: COLORS[index % COLORS.length] || '#999999', // Fallback color
//       legendFontColor: '#333',
//       legendFontSize: 14,
//     }))
//     .filter(item => item.population > 0 && item.color); // Extra safety filter

//   // Enhanced bar chart data with validation
//   const issueTypes = ['Water', 'Road', 'Electricity'];
//   const barChartData = issueTypes.map(issueType => {
//     const total = wards.reduce((sum, ward) => {
//       if (!ward || !Array.isArray(ward.issues)) return sum;
//       const found = ward.issues.find(issue => issue && issue.issueType === issueType);
//       return sum + (found && typeof found.count === 'number' ? Math.max(0, found.count) : 0);
//     }, 0);
//     return Math.max(0, total); // Ensure non-negative values
//   });

//   const barData = {
//     labels: issueTypes,
//     datasets: [
//       {
//         data: barChartData,
//       },
//     ],
//   };

//   // Chart configuration with fallback colors
//   const chartConfig = {
//     backgroundColor: '#fff',
//     backgroundGradientFrom: '#fff',
//     backgroundGradientTo: '#fff',
//     decimalPlaces: 0,
//     color: (opacity = 1) => `rgba(22,114,206,${opacity})`,
//     labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
//     style: {
//       borderRadius: 16,
//     },
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Complaint Distribution by Ward</Text>
//       {pieData && pieData.length > 0 ? (
//         <PieChart
//           data={pieData}
//           width={screenWidth - 32}
//           height={220}
//           chartConfig={chartConfig}
//           accessor="population"
//           backgroundColor="transparent"
//           paddingLeft="16"
//           absolute
//           style={styles.chart}
//         />
//       ) : (
//         <Text style={styles.noDataText}>No ward data to display</Text>
//       )}

//       <Text style={styles.title}>Complaints by Issue Type</Text>
//       {barChartData.some(value => value > 0) ? (
//         <BarChart
//           data={barData}
//           width={screenWidth - 32}
//           height={250}
//           fromZero
//           showValuesOnTopOfBars
//           chartConfig={chartConfig}
//           style={styles.chart}
//         />
//       ) : (
//         <Text style={styles.noDataText}>No issue data to display</Text>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     padding: 16, 
//     backgroundColor: '#f9f9f9' 
//   },
//   title: { 
//     fontSize: 18, 
//     fontWeight: 'bold', 
//     marginVertical: 10, 
//     textAlign: 'center' 
//   },
//   chart: { 
//     marginVertical: 16, 
//     borderRadius: 12 
//   },
//   loaderContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   noDataText: { 
//     textAlign: 'center', 
//     color: '#555',
//     fontSize: 16,
//     marginVertical: 20,
//   },
// });




//\\


import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PieChart, BarChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../utils/api';

const screenWidth = Dimensions.get('window').width;
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', '#9966FF', '#FF6666', '#66B2FF'];

export default function AdminDashboardChartScreen() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Ramnagar'); // ✅ Default location

  // Fetch insights by location
  const fetchData = async (selectedLocation = location) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await API.get(`/insights/last-30-days?location=${selectedLocation}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const wardsData = response.data.wards || [];
      setWards(Array.isArray(wardsData) ? wardsData : []);
    } catch (error) {
      console.error('❌ Error fetching insights:', error);
      setWards([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto load once for default (Ramnagar)
  useEffect(() => {
    fetchData('Ramnagar');
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1672ce" />
      </View>
    );
  }

  // If no data
  if (!wards || wards.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <Text>No complaints data available for {location}.</Text>
      </View>
    );
  }

  // Pie Chart Data
  const pieData = wards
    .filter(ward => ward && typeof ward.totalComplaints === 'number' && ward.totalComplaints > 0)
    .map((ward, index) => ({
      name: ward.ward?.trim() || `Ward ${index + 1}`,
      population: Math.max(0, ward.totalComplaints),
      color: COLORS[index % COLORS.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

  // Bar Chart Data
  const issueTypes = ['Water', 'Road', 'Electricity'];
  const barChartData = issueTypes.map(issueType => {
    const total = wards.reduce((sum, ward) => {
      if (!ward || !Array.isArray(ward.issues)) return sum;
      const found = ward.issues.find(issue => issue.issueType === issueType);
      return sum + (found?.count || 0);
    }, 0);
    return total;
  });

  const barData = {
    labels: issueTypes,
    datasets: [{ data: barChartData }],
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(22,114,206,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      {/* Location Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Select Location:</Text>
        <Picker
          selectedValue={location}
          onValueChange={(value) => setLocation(value)}
          style={styles.picker}
        >
          <Picker.Item label="Ramnagar" value="Ramnagar" />
          <Picker.Item label="Srinagar" value="Srinagar" />
        </Picker>

        <TouchableOpacity style={styles.getButton} onPress={() => fetchData(location)}>
          <Text style={styles.getButtonText}>Get Data</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Complaint Distribution by Ward</Text>
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="16"
          absolute
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>No ward data to display</Text>
      )}

      <Text style={styles.title}>Complaints by Issue Type</Text>
      {barChartData.some(value => value > 0) ? (
        <BarChart
          data={barData}
          width={screenWidth - 32}
          height={250}
          fromZero
          showValuesOnTopOfBars
          chartConfig={chartConfig}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>No issue data to display</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' },
  chart: { marginVertical: 16, borderRadius: 12 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataText: { textAlign: 'center', color: '#555', fontSize: 16, marginVertical: 20 },
  filterContainer: { marginBottom: 16, backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  filterLabel: { fontSize: 16, fontWeight: '500', marginBottom: 6 },
  picker: { backgroundColor: '#f1f5f9', borderRadius: 8 },
  getButton: {
    backgroundColor: '#1672ce',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  getButtonText: { color: '#fff', fontWeight: 'bold' },
});
