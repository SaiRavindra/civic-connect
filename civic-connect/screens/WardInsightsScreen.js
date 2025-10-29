// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { Picker } from '@react-native-picker/picker';
// import { BarChart, LineChart } from 'react-native-chart-kit';
// import API from '../utils/api'; // your axios wrapper

// const LOCATIONS = ['Ramnagar', 'Srinagar'];

// const WardInsightsScreen = ({ route }) => {
//   const initialLocation = route?.params?.selectedLocation || 'Ramnagar';
//   const [selectedLocation, setSelectedLocation] = useState(initialLocation);
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState(null);
//   const [topProblems, setTopProblems] = useState([]);
//   const [severityVolume, setSeverityVolume] = useState([]);
//   const [breakdown, setBreakdown] = useState([]);
//   const [error, setError] = useState(null);

//   const fetchAllInsights = useCallback(async (location) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const [topRes, sevVolRes, breakdownRes, summaryRes] = await Promise.all([
//         API.get(`/insights/top-issues`, { params: { location } }),
//         API.get(`/insights/severity-volume`, { params: { location } }),
//         API.get(`/insights/severity-breakdown`, { params: { location } }),
//         API.get(`/insights/summary`, { params: { location } }),
//       ]);

//       setTopProblems(topRes.data || []);
//       setSeverityVolume(sevVolRes.data || []);
//       setBreakdown(breakdownRes.data || []);
//       setSummary(summaryRes.data || null);
//     } catch (err) {
//       console.log('Error fetching insights:', err?.response?.data || err.message);
//       setError('Failed to load insights. Try again.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAllInsights(selectedLocation);
//   }, [selectedLocation, fetchAllInsights]);

//   const chartWidth = Dimensions.get('window').width - 40;

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
//       <Text style={styles.title}>Ward Insights (Last 30 Days)</Text>

//       {/* Location Picker */}
//       <View style={styles.pickerRow}>
//         <Text style={styles.pickerLabel}>Location</Text>
//         <View style={styles.pickerWrapper}>
//           <Picker
//             selectedValue={selectedLocation}
//             onValueChange={(val) => setSelectedLocation(val)}
//             style={styles.picker}
//           >
//             {LOCATIONS.map((loc) => (
//               <Picker.Item key={loc} label={loc} value={loc} />
//             ))}
//           </Picker>
//         </View>
//       </View>

//       {/* Loading / Error */}
//       {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}
//       {error && (
//         <View style={styles.errorBox}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.retryBtn} onPress={() => fetchAllInsights(selectedLocation)}>
//             <Text style={styles.retryText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Summary Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Summary</Text>
//         <View style={styles.card}>
//           {summary ? (
//             <>
//               <Text style={styles.cardLine}>Total complaints: {summary.totalComplaints}</Text>
//               <Text style={styles.cardLine}>Avg severity: {summary.avgSeverity?.toFixed(1)}</Text>
//               <Text style={styles.cardLine}>Top ward by complaints: {summary.topWardByCount}</Text>
//               <Text style={styles.cardLine}>Top ward by severity: {summary.topWardBySeverity}</Text>
//             </>
//           ) : (
//             <Text style={styles.placeholder}>Summary will appear here for {selectedLocation}.</Text>
//           )}
//         </View>
//       </View>

//       {/* Top Problem per Ward */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Top Problem per Ward</Text>
//         {topProblems.length ? (
//           <>
//             <BarChart
//               data={{
//                 labels: topProblems.map((w) => w.ward),
//                 datasets: [
//                   { data: topProblems.map((w) => w.topIssue?.totalComplaints ?? 0) },
//                 ],
//               }}
//               width={chartWidth}
//               height={220}
//               chartConfig={chartConfig('#1672ce')}
//               style={styles.chart}
//             />

//             {topProblems.map((w) => (
//               <View key={`${w.location}-${w.ward}`} style={styles.wardCard}>
//                 <Text style={styles.wardTitle}>{w.ward}</Text>
//                 <Text style={styles.wardLine}>Top Issue: {w.topIssue?.issueType || '—'}</Text>
//                 <Text style={styles.wardLine}>
//                   {w.topIssue?.totalComplaints ?? 0} complaints (avg severity {w.topIssue?.avgSeverity?.toFixed(1) ?? '—'})
//                 </Text>
//               </View>
//             ))}
//           </>
//         ) : (
//           <Text style={styles.placeholder}>Top problems will show here.</Text>
//         )}
//       </View>

//       {/* Severity vs Complaint Volume */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Severity vs Complaint Volume</Text>
//         {severityVolume.length ? (
//           <>
//             <LineChart
//               data={{
//                 labels: severityVolume.map((s) => s.ward),
//                 datasets: [{ data: severityVolume.map((s) => s.avgSeverity) }],
//               }}
//               width={chartWidth}
//               height={220}
//               yAxisSuffix=""
//               chartConfig={chartConfig('#ff6384')}
//               bezier={false}
//               style={styles.chart}
//             />
//             {severityVolume.map((s) => (
//               <View key={s.ward} style={styles.row}>
//                 <Text style={{ flex: 1 }}>{s.ward}</Text>
//                 <Text style={{ width: 110, textAlign: 'right' }}>{s.totalComplaints} complaints</Text>
//                 <Text style={{ width: 80, textAlign: 'right' }}>{s.avgSeverity.toFixed(1)}</Text>
//               </View>
//             ))}
//           </>
//         ) : (
//           <Text style={styles.placeholder}>Severity-volume data will show here.</Text>
//         )}
//       </View>

//       {/* Issue Severity Breakdown */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Issue Severity Breakdown</Text>
//         {breakdown.length ? (
//           <>
//             <BarChart
//               data={{
//                 labels: breakdown.map((b) => b.ward),
//                 datasets: [
//                   {
//                     data: breakdown.map((b) =>
//                       b.issues.reduce((sum, i) => sum + i.totalComplaints, 0)
//                     ),
//                   },
//                 ],
//               }}
//               width={chartWidth}
//               height={220}
//               chartConfig={chartConfig('#36a2eb')}
//               style={styles.chart}
//             />
//             {breakdown.map((b) => (
//               <View key={b.ward} style={styles.wardCard}>
//                 <Text style={styles.wardTitle}>{b.ward}</Text>
//                 {b.issues.map((i) => (
//                   <Text key={i.issueType} style={styles.wardLine}>
//                     • {i.issueType} — {i.totalComplaints} complaints (avg {i.avgSeverity.toFixed(1)})
//                   </Text>
//                 ))}
//               </View>
//             ))}
//           </>
//         ) : (
//           <Text style={styles.placeholder}>Issue breakdown will show here.</Text>
//         )}
//       </View>

//       {/* Smart Insights */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Smart Insights</Text>
//         <View style={styles.card}>
//           <Text style={styles.placeholder}>
//             Auto-generated insights will appear here.
//           </Text>
//         </View>
//       </View>

//       <View style={{ height: 30 }} />
//     </ScrollView>
//   );
// };

// // Chart style helper
// const chartConfig = (color) => ({
//   backgroundColor: '#fff',
//   backgroundGradientFrom: '#fff',
//   backgroundGradientTo: '#fff',
//   decimalPlaces: 0,
//   color: (opacity = 1) => `${color}${Math.floor(opacity * 255).toString(16)}`,
//   labelColor: () => '#333',
//   propsForDots: { r: '5', strokeWidth: '2', stroke: color },
// });

// export default WardInsightsScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f7fafc', padding: 16 },
//   title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
//   pickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   pickerLabel: { fontSize: 16, marginRight: 12 },
//   pickerWrapper: { flex: 1, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
//   picker: { height: 44, width: '100%' },
//   section: { marginTop: 12 },
//   sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
//   card: { backgroundColor: '#fff', padding: 12, borderRadius: 10 },
//   chart: { borderRadius: 10, marginVertical: 10 },
//   wardCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
//   wardTitle: { fontSize: 16, fontWeight: '700' },
//   wardLine: { fontSize: 14, marginTop: 6 },
//   cardLine: { fontSize: 14, marginBottom: 6 },
//   placeholder: { color: '#666' },
//   row: { flexDirection: 'row', paddingVertical: 6, alignItems: 'center' },
//   errorBox: { backgroundColor: '#fee', padding: 12, borderRadius: 8, marginVertical: 10 },
//   errorText: { color: '#900' },
//   retryBtn: { marginTop: 8, alignSelf: 'flex-start', padding: 8, backgroundColor: '#1672ce', borderRadius: 6 },
//   retryText: { color: '#fff' },
// });

//


import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BarChart, LineChart } from 'react-native-chart-kit';
import API from '../utils/api'; // your axios wrapper

const LOCATIONS = ['Ramnagar', 'Srinagar'];
const screenWidth = Dimensions.get('window').width;

// --- Smart Insights Generator ---
const generateSmartInsights = (summary, breakdown, severityVolume) => {
  if (!summary || !breakdown.length || !severityVolume.length) return [];

  const insights = [];

  // Highest severity ward
  const highSeverityWard = severityVolume.reduce((a, b) =>
    a.avgSeverity > b.avgSeverity ? a : b
  );
  insights.push(
    `⚠️ The ward "${highSeverityWard.ward}" currently reports the highest average severity level (${highSeverityWard.avgSeverity.toFixed(
      1
    )}). This suggests that critical issues there need immediate attention.`
  );

  // Most reported issue type
  const issueCounts = {};
  breakdown.forEach((b) => {
    b.issues.forEach((i) => {
      issueCounts[i.issueType] = (issueCounts[i.issueType] || 0) + i.totalComplaints;
    });
  });
  const topIssue = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0];
  if (topIssue) {
    insights.push(
      `🧹 "${topIssue[0]}" remains the most frequent problem, accounting for ${topIssue[1]} complaints city-wide. A focused cleanup or inspection drive could reduce recurrence.`
    );
  }

  // Top ward by complaints
  if (summary?.topWardByCount) {
    insights.push(
      `🏙️ "${summary.topWardByCount}" received the highest total complaints overall. The local maintenance team could consider periodic audits there.`
    );
  }

  // Avg severity feedback
  const avgSeverity = summary?.avgSeverity ?? 0;
  if (avgSeverity > 3.5)
    insights.push(
      `🚨 The average complaint severity across wards stands at ${avgSeverity.toFixed(
        1
      )}, which is relatively high. This indicates that issues being reported are not minor and require prioritization.`
    );
  else if (avgSeverity <= 3.5 && avgSeverity > 2)
    insights.push(
      `✅ The overall severity level (${avgSeverity.toFixed(
        1
      )}) suggests most complaints are moderate. Preventive action could keep them from escalating.`
    );
  else
    insights.push(
      `🌿 Great news — the overall severity is quite low (${avgSeverity.toFixed(
        1
      )}), showing effective problem resolution this month.`
    );

  // Severity fluctuation
  const fluctuationWard = severityVolume.find((s) => s.avgSeverity > avgSeverity + 0.8);
  if (fluctuationWard)
    insights.push(
      `📈 Noticeable spike detected in "${fluctuationWard.ward}" — its severity level (${fluctuationWard.avgSeverity.toFixed(
        1
      )}) is significantly above the city average.`
    );

  // Total complaints
  if (summary.totalComplaints)
    insights.push(
      `🧾 A total of ${summary.totalComplaints} complaints were logged this month across all wards.`
    );

  return insights;
};

// --- Chart style helper ---
const chartConfig = (color) => ({
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `${color}${Math.floor(opacity * 255).toString(16)}`,
  labelColor: () => '#333',
  propsForDots: { r: '5', strokeWidth: '2', stroke: color },
});

const WardInsightsScreen = ({ route, navigation }) => {
  const initialLocation = route?.params?.selectedLocation || 'Ramnagar';
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [topProblems, setTopProblems] = useState([]);
  const [severityVolume, setSeverityVolume] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [error, setError] = useState(null);

  const fetchAllInsights = useCallback(async (location) => {
    setLoading(true);
    setError(null);

    try {
      const [topRes, sevVolRes, breakdownRes, summaryRes] = await Promise.all([
        API.get(`/insights/top-issues`, { params: { location } }),
        API.get(`/insights/severity-volume`, { params: { location } }),
        API.get(`/insights/severity-breakdown`, { params: { location } }),
        API.get(`/insights/summary`, { params: { location } }),
      ]);

      setTopProblems(topRes.data || []);
      setSeverityVolume(sevVolRes.data || []);
      setBreakdown(breakdownRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (err) {
      console.log('Error fetching insights:', err?.response?.data || err.message);
      setError('Failed to load insights. Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllInsights(selectedLocation);
  }, [selectedLocation, fetchAllInsights]);

  const chartWidth = screenWidth - 40;

  return (
    <View style={styles.container}>
      {/* Top Bar (Title + Picker) */}
      <View style={styles.header}>
        <Text style={styles.title}>Ward Insights (Last 30 Days)</Text>
        <View style={styles.dropdownContainer}>
          <Text style={styles.pickerLabel}>Select Location</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedLocation}
              onValueChange={(val) => setSelectedLocation(val)}
              style={styles.picker}
              mode="dropdown"
              dropdownIconColor="#1672ce"
            >
              {LOCATIONS.map((loc) => (
                <Picker.Item key={loc} label={loc} value={loc} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Loading / Error */}
        {loading && <ActivityIndicator size="large" color="#1672ce" style={{ marginVertical: 20 }} />}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchAllInsights(selectedLocation)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.card}>
            {summary ? (
              <>
                <Text style={styles.cardLine}>Total complaints: {summary.totalComplaints ?? '—'}</Text>
                <Text style={styles.cardLine}>Avg severity: {summary.avgSeverity?.toFixed(1) ?? '—'}</Text>
                <Text style={styles.cardLine}>Top ward by complaints: {summary.topWardByCount ?? 'Data not available'}</Text>
                <Text style={styles.cardLine}>Top ward by severity: {summary.topWardBySeverity ?? 'Data not available'}</Text>
              </>
            ) : (
              <Text style={styles.placeholder}>Summary will appear here for {selectedLocation}.</Text>
            )}
          </View>
        </View>

        {/* Top Problem per Ward */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Problem per Ward</Text>
          {topProblems.length ? (
            <>
              <BarChart
                data={{
                  labels: topProblems.map((w) => w.ward),
                  datasets: [{ data: topProblems.map((w) => w.topIssue?.totalComplaints ?? 0) }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig('#1672ce')}
                style={styles.chart}
              />
              {topProblems.map((w) => (
                <View key={`${w.location}-${w.ward}`} style={styles.wardCard}>
                  <Text style={styles.wardTitle}>{w.ward}</Text>
                  <Text style={styles.wardLine}>Top Issue: {w.topIssue?.issueType || '—'}</Text>
                  <Text style={styles.wardLine}>
                    {w.topIssue?.totalComplaints ?? 0} complaints (avg severity {w.topIssue?.avgSeverity?.toFixed(1) ?? '—'})
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.placeholder}>Top problems will show here.</Text>
          )}
        </View>

        {/* Severity vs Complaint Volume */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity vs Complaint Volume</Text>
          {severityVolume.length ? (
            <>
              <LineChart
                data={{
                  labels: severityVolume.map((s) => s.ward),
                  datasets: [{ data: severityVolume.map((s) => s.avgSeverity) }],
                }}
                width={chartWidth}
                height={220}
                yAxisSuffix=""
                chartConfig={chartConfig('#ff6384')}
                bezier={false}
                style={styles.chart}
              />
              {severityVolume.map((s) => (
                <View key={s.ward} style={styles.row}>
                  <Text style={{ flex: 1 }}>{s.ward}</Text>
                  <Text style={{ width: 110, textAlign: 'right' }}>{s.totalComplaints}</Text>
                  <Text style={{ width: 80, textAlign: 'right' }}>{s.avgSeverity.toFixed(1)}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.placeholder}>Severity-volume data will show here.</Text>
          )}
        </View>

        {/* Issue Severity Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Severity Breakdown</Text>
          {breakdown.length ? (
            <>
              <BarChart
                data={{
                  labels: breakdown.map((b) => b.ward),
                  datasets: [{ data: breakdown.map((b) => b.issues.reduce((sum, i) => sum + i.totalComplaints, 0)) }],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig('#36a2eb')}
                style={styles.chart}
              />
              {breakdown.map((b) => (
                <View key={b.ward} style={styles.wardCard}>
                  <Text style={styles.wardTitle}>{b.ward}</Text>
                  {b.issues.map((i) => (
                    <Text key={i.issueType} style={styles.wardLine}>
                      • {i.issueType} — {i.totalComplaints} complaints (avg {i.avgSeverity.toFixed(1)})
                    </Text>
                  ))}
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.placeholder}>Issue breakdown will show here.</Text>
          )}
        </View>

        {/* Smart Insights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Insights</Text>
          <View style={styles.card}>
            {summary && breakdown.length && severityVolume.length ? (
              generateSmartInsights(summary, breakdown, severityVolume).map((insight, idx) => (
                <Text key={idx} style={styles.insightLine}>{insight}</Text>
              ))
            ) : (
              <Text style={styles.placeholder}>Smart insights will appear here once data loads.</Text>
            )}
          </View>
        </View>

        {/* Future Predictions Button */}
        <TouchableOpacity
          style={styles.futureBtn}
          onPress={() => navigation.navigate('FutureInsights', { selectedLocation })}
        >
          <Text style={styles.futureBtnText}>View Future Predictions</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default WardInsightsScreen;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', paddingHorizontal: 16, paddingTop: 10 },
  header: {
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1a202c', marginBottom: 8 },
  dropdownContainer: { flexDirection: 'column' },
  pickerLabel: { fontSize: 16, marginBottom: 4, color: '#333' },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    height: Platform.OS === 'ios' ? 120 : 50,
  },
  picker: { width: '100%', height: '100%' },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10 },
  chart: { borderRadius: 10, marginVertical: 10 },
  wardCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  wardTitle: { fontSize: 16, fontWeight: '700' },
  wardLine: { fontSize: 14, marginTop: 6 },
  cardLine: { fontSize: 14, marginBottom: 6 },
  insightLine: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  placeholder: { color: '#666' },
  row: { flexDirection: 'row', paddingVertical: 6, alignItems: 'center' },
  errorBox: { backgroundColor: '#fee', padding: 12, borderRadius: 8, marginVertical: 10 },
  errorText: { color: '#900' },
  retryBtn: { marginTop: 8, alignSelf: 'flex-start', padding: 8, backgroundColor: '#1672ce', borderRadius: 6 },
  retryText: { color: '#fff' },
  futureBtn: {
    marginTop: 20,
    backgroundColor: '#1672ce',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  futureBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

