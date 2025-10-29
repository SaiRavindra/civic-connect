// import React, { useEffect, useState, useCallback } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
// import { BarChart } from 'react-native-chart-kit';
// import API from '../utils/api';

// const screenWidth = Dimensions.get('window').width;

// // ----- Chart Config -----
// const chartConfig = {
//   backgroundGradientFrom: '#fff',
//   backgroundGradientTo: '#fff',
//   color: (opacity = 1) => `rgba(22, 114, 206, ${opacity})`,
//   labelColor: () => '#333',
//   propsForDots: { r: '5', strokeWidth: '2', stroke: '#1672ce' },
// };

// // ----- Zone Logic -----
// const defineZone = (severity, complaints) => {
//   if (severity >= 3 || complaints >= 50) return 'Red';
//   if (severity >= 2 || complaints >= 30) return 'Yellow';
//   return 'Blue';
// };

// const getZoneColor = (zone) => {
//   switch (zone) {
//     case 'Red':
//       return '#ff4d4f';
//     case 'Yellow':
//       return '#faad14';
//     default:
//       return '#36a2eb';
//   }
// };

// // ----- Generate AI-style insights -----
// const generateFutureInsights = (predictions) => {
//   if (!predictions?.length) return [];

//   const insights = [];

//   const highRiskWards = predictions.filter(
//     (w) => w.zone === 'Red'
//   ).map((w) => w.ward);

//   const mediumRiskWards = predictions.filter(
//     (w) => w.zone === 'Yellow'
//   ).map((w) => w.ward);

//   insights.push(
//     `⚠️ Wards with highest risk: ${highRiskWards.join(', ') || 'None'}. Immediate attention required.`
//   );
//   insights.push(
//     `⚡ Wards in moderate risk: ${mediumRiskWards.join(', ') || 'None'}. Monitor these areas closely.`
//   );
//   insights.push(
//     `📊 Predicted complaint trends suggest focusing on wards with high severity scores to prevent escalation.`
//   );
//   insights.push(
//     `🛠️ Allocate resources to Red and Yellow zones first to reduce potential problems.`
//   );
//   insights.push(
//     `🔮 Overall, proactive planning based on predicted severity can minimize future issues effectively.`
//   );

//   return insights;
// };

// const FutureInsightsScreen = ({ route }) => {
//   const initialLocation = route?.params?.selectedLocation || 'Ramnagar';
//   const [selectedLocation, setSelectedLocation] = useState(initialLocation);
//   const [loading, setLoading] = useState(false);
//   const [predictions, setPredictions] = useState([]);
//   const [error, setError] = useState(null);

//   const fetchFuturePredictions = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await API.get('/insights/future-ward-predictions', {
//         params: { location: selectedLocation },
//       });

//       const dataWithZones = (res.data || []).map((ward) => ({
//         ...ward,
//         zone: defineZone(
//           ward.predictedSeverityNextMonth ?? 0,
//           ward.predictedComplaintsNextMonth ?? 0
//         ),
//       }));

//       setPredictions(dataWithZones);
//     } catch (err) {
//       console.log('Error fetching future predictions:', err?.response?.data || err.message);
//       setError('Failed to fetch future predictions');
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedLocation]);

//   useEffect(() => {
//     fetchFuturePredictions();
//   }, [fetchFuturePredictions]);

//   const chartWidth = screenWidth - 40;

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
//         {loading && <ActivityIndicator size="large" color="#1672ce" style={{ marginVertical: 20 }} />}
//         {error && <Text style={styles.errorText}>{error}</Text>}

//         <Text style={styles.title}>Future Insights - Next Month Predictions</Text>

//         {predictions.length ? (
//           <>
//             {/* Bar Chart */}
//             <BarChart
//               data={{
//                 labels: predictions.map((p) => p.ward),
//                 datasets: [
//                   {
//                     data: predictions.map((p) => p.predictedSeverityNextMonth ?? 0),
//                     color: () => '#ff6384',
//                   },
//                   {
//                     data: predictions.map((p) => p.predictedComplaintsNextMonth ?? 0),
//                     color: () => '#36a2eb',
//                   },
//                 ],
//               }}
//               width={chartWidth}
//               height={220}
//               yAxisSuffix=""
//               chartConfig={chartConfig}
//               style={styles.chart}
//             />

//             {/* Wards Cards with Zone */}
//             {predictions.map((ward) => (
//               <View key={ward.ward} style={styles.card}>
//                 <Text style={styles.wardTitle}>{ward.ward}</Text>
//                 <Text>Predicted Severity: {(ward.predictedSeverityNextMonth ?? 0).toFixed(1)}</Text>
//                 <Text>Predicted Complaints: {(ward.predictedComplaintsNextMonth ?? 0).toFixed(0)}</Text>
//                 <Text style={[styles.zone, { color: getZoneColor(ward.zone) }]}>
//                   Zone: {ward.zone}
//                 </Text>
//               </View>
//             ))}

//             {/* AI-style Insights */}
//             <View style={[styles.card, { marginTop: 20 }]}>
//               <Text style={styles.insightTitle}>Future Insights</Text>
//               {generateFutureInsights(predictions).map((insight, idx) => (
//                 <Text key={idx} style={styles.insightLine}>
//                   {insight}
//                 </Text>
//               ))}
//             </View>
//           </>
//         ) : (
//           <Text style={styles.placeholder}>No predictions available for {selectedLocation}.</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// export default FutureInsightsScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f7fafc', paddingHorizontal: 16, paddingTop: 10 },
//   title: { fontSize: 20, fontWeight: '700', color: '#1a202c', marginBottom: 12 },
//   chart: { borderRadius: 10, marginVertical: 10 },
//   card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
//   wardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
//   zone: { fontWeight: '700', marginTop: 4 },
//   insightTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
//   insightLine: { fontSize: 14, marginTop: 4, lineHeight: 20 },
//   placeholder: { color: '#666', marginTop: 10 },
//   errorText: { color: '#900', marginVertical: 10 },
// });
//



import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import API from '../utils/api';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(22, 114, 206, ${opacity})`,
  labelColor: () => '#333',
  propsForDots: { r: '5', strokeWidth: '2', stroke: '#1672ce' },
};

// Zone classification based on predicted severity
const classifyZone = (severity) => {
  if (severity >= 5.2) return 'Red';
  if (severity >= 3) return 'Yellow';
  return 'Blue';
};

// Generate dynamic AI-style future insights
const generateFutureInsights = (predictions) => {
  if (!predictions?.length) return [];

  const insights = [];

  const redWards = predictions.filter((w) => w.zone === 'Red').map((w) => w.ward);
  const yellowWards = predictions.filter((w) => w.zone === 'Yellow').map((w) => w.ward);
  const blueWards = predictions.filter((w) => w.zone === 'Blue').map((w) => w.ward);

  const avgSeverity = predictions.reduce((sum, w) => sum + (w.predictedSeverityNextMonth ?? 0), 0) / predictions.length;
  const totalPredictedComplaints = predictions.reduce((sum, w) => sum + (w.predictedComplaintsNextMonth ?? 0), 0);

  if (redWards.length) {
    insights.push(`⚠️ High-risk wards: ${redWards.join(', ')}. Immediate attention required.`);
  }

  if (yellowWards.length) {
    insights.push(`🟡 Moderate-risk wards: ${yellowWards.join(', ')}. Monitor closely to prevent escalation.`);
  }

  if (!redWards.length && !yellowWards.length && blueWards.length) {
    insights.push(`✅ All wards are currently low risk. Routine monitoring is sufficient.`);
  }

  if (avgSeverity > 2.5) {
    insights.push(`📊 Average predicted severity is high (${avgSeverity.toFixed(1)}). Allocate additional resources to critical areas.`);
  }

  if (totalPredictedComplaints > 50) {
    insights.push(`📈 Total predicted complaints are ${totalPredictedComplaints}. Plan preventive measures in key wards.`);
  }

  if (redWards.length || yellowWards.length) {
    insights.push(`🛠️ Prioritize interventions in Red and Yellow zones to minimize future issues.`);
  } else {
    insights.push(`🔮 Continue standard operations, but stay alert for potential emerging issues.`);
  }

  if (blueWards.length) {
    insights.push(`🌟 Wards in Blue zones (${blueWards.join(', ')}) are performing well.`);
  }

  return insights;
};

const FutureInsightsScreen = ({ route }) => {
  const initialLocation = route?.params?.selectedLocation || 'Ramnagar';
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);

  const fetchFuturePredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/insights/future-ward-predictions', { params: { location: selectedLocation } });
      const data = res.data || [];

      // Add zone classification to each ward
      const withZones = data.map((ward) => ({
        ...ward,
        zone: classifyZone(ward.predictedSeverityNextMonth ?? 0),
      }));

      setPredictions(withZones);
      setInsights(generateFutureInsights(withZones));
    } catch (err) {
      console.log('Error fetching future predictions:', err?.response?.data || err.message);
      setError('Failed to fetch future predictions');
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    fetchFuturePredictions();
  }, [fetchFuturePredictions]);

  const chartWidth = screenWidth - 40;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator size="large" color="#1672ce" style={{ marginVertical: 20 }} />}
        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.title}>Future Insights - Next Month Predictions</Text>

        {predictions.length ? (
          <>
            {/* Bar Chart */}
            <BarChart
              data={{
                labels: predictions.map((p) => p.ward),
                datasets: [
                  {
                    data: predictions.map((p) => p.predictedSeverityNextMonth ?? 0),
                    color: () => '#ff6384',
                  },
                  {
                    data: predictions.map((p) => p.predictedComplaintsNextMonth ?? 0),
                    color: () => '#36a2eb',
                  },
                ],
              }}
              width={chartWidth}
              height={220}
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
            />

            {/* Ward Cards */}
            {predictions.map((ward) => (
              <View key={ward.ward} style={[styles.card, ward.zone === 'Red' && { borderColor: '#ff4d4f', borderWidth: 2 }, ward.zone === 'Yellow' && { borderColor: '#faad14', borderWidth: 2 }, ward.zone === 'Blue' && { borderColor: '#36a2eb', borderWidth: 2 }]}>
                <Text style={styles.wardTitle}>{ward.ward}</Text>
                <Text>Predicted Severity: {(ward.predictedSeverityNextMonth ?? 0).toFixed(1)}</Text>
                <Text>Predicted Complaints: {(ward.predictedComplaintsNextMonth ?? 0).toFixed(0)}</Text>
                <Text>Zone: <Text style={{ fontWeight: '700' }}>{ward.zone}</Text></Text>
              </View>
            ))}

            {/* AI-generated Future Insights */}
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.title, { fontSize: 18 }]}>AI-generated Future Insights</Text>
              {insights.map((insight, idx) => (
                <Text key={idx} style={styles.insightText}>• {insight}</Text>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>No predictions available for {selectedLocation}.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default FutureInsightsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', paddingHorizontal: 16, paddingTop: 10 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a202c', marginBottom: 12 },
  chart: { borderRadius: 10, marginVertical: 10 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10 },
  wardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  placeholder: { color: '#666', marginTop: 10 },
  errorText: { color: '#900', marginVertical: 10 },
  insightText: { marginVertical: 4, fontSize: 14, color: '#333' },
});
