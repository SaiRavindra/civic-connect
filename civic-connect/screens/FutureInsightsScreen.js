import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
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

// 🔹 Classify based on severity
const classifyZone = (severity) => {
  const s = Math.round((severity ?? 0) * 10) / 10;
  if (severity >= 6) return 'Red';
  if (severity >= 3) return 'Yellow';
  return 'Blue';
};

// 🔹 Suggest worker actions based on top complaint type
const getSuggestedAction = (issueType) => {
  switch (issueType?.toLowerCase()) {
    case 'garbage':
      return 'Deploy cleaning crew and inspect waste bins.';
    case 'road':
      return 'Inspect potholes and schedule repair.';
    case 'drainage':
      return 'Check drainage blockages and disinfect area.';
    case 'water':
      return 'Check supply line for leakage or low pressure.';
    case 'electricity':
      return 'Dispatch electrician to inspect power fault.';
    default:
      return 'Perform general inspection and maintenance.';
  }
};

// 🔹 Generate AI insights text
const generateFutureInsights = (predictions) => {
  if (!predictions?.length) return [];
  const insights = [];

  const redWards = predictions.filter((w) => w.zone === 'Red').map((w) => w.ward);
  const yellowWards = predictions.filter((w) => w.zone === 'Yellow').map((w) => w.ward);
  const blueWards = predictions.filter((w) => w.zone === 'Blue').map((w) => w.ward);

  const avgSeverity =
    predictions.reduce((sum, w) => sum + (w.predicted_avg_severity_next_30d ?? 0), 0) /
    predictions.length;
  const totalPredictedComplaints = predictions.reduce(
    (sum, w) => sum + (w.predicted_count_next_30d ?? 0),
    0
  );

  if (redWards.length)
    insights.push(`⚠️ High-risk wards: ${redWards.join(', ')}. Immediate attention required.`);
  if (yellowWards.length)
    insights.push(`🟡 Moderate-risk wards: ${yellowWards.join(', ')}. Monitor regularly.`);
  if (!redWards.length && !yellowWards.length)
    insights.push(`✅ All wards are performing well — maintain current efficiency.`);

  if (avgSeverity > 4)
    insights.push(
      `📊 Average predicted severity is ${avgSeverity.toFixed(
        1
      )}. Plan preventive maintenance and allocate resources accordingly.`
    );

  if (totalPredictedComplaints > 50)
    insights.push(`📈 Around ${totalPredictedComplaints.toFixed(0)} new complaints are expected.`);

  if (redWards.length || yellowWards.length)
    insights.push(`🛠️ Prioritize Red and Yellow zones first for on-ground action.`);
  if (blueWards.length)
    insights.push(`🌟 Blue zones (${blueWards.join(', ')}) show good performance — keep it up.`);

  return insights;
};

const FutureInsightsScreen = ({ route }) => {
  const initialLocation = route?.params?.selectedLocation || 'Ramnagar';
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [topComplaints, setTopComplaints] = useState([]);
  const [wardTopComplaints, setWardTopComplaints] = useState({});
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState(null);

  const fetchFuturePredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/insights/future-predictions', {
        params: { location: selectedLocation },
      });
      const data = res.data || {};

      const combined = (data.counts || []).map((wardData) => {
        const zoneInfo = (data.zones || []).find(
          (z) => z.ward === wardData.ward && z.location === wardData.location
        );
        return {
          ward: wardData.ward,
          location: wardData.location,
          predicted_count_next_30d: wardData.predicted_count_next_30d ?? 0,
          predicted_avg_severity_next_30d: zoneInfo?.predicted_avg_severity_next_30d ?? 0,
          zone: zoneInfo?.predicted_zone || classifyZone(zoneInfo?.predicted_avg_severity_next_30d),
        };
      });

      // // Top complaint for each ward (randomly assigned from city top complaints)
      // const topComplaintsMap = {};
      // (data.topComplaints[0]?.topIssues || []).forEach((issue) => {
      //   const ward = combined[Math.floor(Math.random() * combined.length)]?.ward;
      //   if (ward) topComplaintsMap[ward] = issue.issueType;
      // });

      // ✅ Use backend-provided ward top complaints (from ML response)
      const wardTopMap = (data.wardTopComplaints || []).reduce((acc, cur) => {
        acc[cur.ward] = cur.topIssue;
        return acc;
      }, {});
      setWardTopComplaints(wardTopMap);


      setPredictions(combined);
      setTopComplaints(data.topComplaints || []);
      // setWardTopComplaints(topComplaintsMap);
      setInsights(generateFutureInsights(combined));
    } catch (err) {
      console.log('Error fetching predictions:', err.message);
      setError('Failed to fetch predictions');
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
        {/* 🔹 City Switch */}
        <View style={styles.switchContainer}>
          {['Ramnagar', 'Srinagar'].map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => setSelectedLocation(city)}
              style={[
                styles.cityButton,
                selectedLocation === city && styles.cityButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.cityText,
                  selectedLocation === city && styles.cityTextActive,
                ]}
              >
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔹 Smart Loading Screen */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1672ce" />
            <Text style={{ color: '#1672ce', marginTop: 10 }}>
              Analyzing civic data using AI...
            </Text>
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && (
          <>
            <Text style={styles.title}>
              AI-Powered Future Insights for {selectedLocation}
            </Text>

            {/* 🔹 Chart */}
            {predictions.length > 0 && (
              <BarChart
                data={{
                  labels: predictions.map((p) => p.ward),
                  datasets: [
                    {
                      data: predictions.map((p) => p.predicted_count_next_30d ?? 0),
                      color: () => '#36a2eb',
                    },
                    {
                      data: predictions.map((p) => p.predicted_avg_severity_next_30d ?? 0),
                      color: () => '#ff6384',
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
              />
            )}

            {/* 🔹 Ward Prediction Cards */}
            {predictions.map((ward) => {
              const topIssue = wardTopComplaints[ward.ward];
              return (
                <View
                  key={ward.ward}
                  style={[
                    styles.card,
                    ward.zone === 'Red' && { borderColor: '#ff4d4f', borderWidth: 2 },
                    ward.zone === 'Yellow' && { borderColor: '#faad14', borderWidth: 2 },
                    ward.zone === 'Blue' && { borderColor: '#36a2eb', borderWidth: 2 },
                  ]}
                >
                  <Text style={styles.wardTitle}>{ward.ward}</Text>
                  <Text>Predicted Complaints: {ward.predicted_count_next_30d.toFixed(1)}</Text>
                  <Text>Predicted Severity: {ward.predicted_avg_severity_next_30d.toFixed(1)}</Text>
                  <Text>
                    Zone: <Text style={{ fontWeight: '700' }}>{ward.zone}</Text>
                  </Text>
                  {topIssue && (
                    <>
                      <Text>Top Complaint: {topIssue}</Text>
                      <Text style={{ color: '#555', marginTop: 4 }}>
                        Suggested Action: {getSuggestedAction(topIssue)}
                      </Text>
                    </>
                  )}
                </View>
              );
            })}

            {/* 🔹 City-wide top complaints */}
            {topComplaints?.length > 0 && (
              <View style={{ marginTop: 15 }}>
                <Text style={[styles.title, { fontSize: 18 }]}>
                  Top Complaints in {selectedLocation}
                </Text>
                {topComplaints[0]?.topIssues?.map((issue, i) => (
                  <Text key={i} style={styles.insightText}>
                    • {issue.issueType} ({issue.count})
                  </Text>
                ))}
              </View>
            )}

            {/* 🔹 AI Insights */}
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.title, { fontSize: 18 }]}>
                AI-generated Action Insights
              </Text>
              {insights.map((insight, idx) => (
                <Text key={idx} style={styles.insightText}>
                  • {insight}
                </Text>
              ))}
            </View>
          </>
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
  errorText: { color: '#900', marginVertical: 10 },
  insightText: { marginVertical: 4, fontSize: 14, color: '#333' },
  loadingContainer: { alignItems: 'center', marginVertical: 40 },
  switchContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  cityButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1672ce',
    marginHorizontal: 5,
  },
  cityButtonActive: { backgroundColor: '#1672ce' },
  cityText: { color: '#1672ce', fontWeight: '600' },
  cityTextActive: { color: '#fff' },
});
