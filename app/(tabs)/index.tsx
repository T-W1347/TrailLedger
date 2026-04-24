import { supabase } from '@/lib/supabase';
import { useContext, useEffect, useState } from 'react';
import { Alert, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../context/AuthContext";

const headerImage = require('../../assets/images/trailLedger-header-background.jpeg');


export default function Index() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("AuthProvider missing");

  const { session } = context;
  const username = session?.user?.email?.split('@')[0]

  const [logs, setLogs] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error) setLogs(data || [])
  };

  useEffect(() => {
    if (session?.user) fetchLogs
  }, [session]);

  const totalMiles = logs.reduce((sum, log) => sum + (log.distance || 0), 0);
  const totalRides = logs.length;
  const avgMiles = totalRides > 0 ? (totalMiles / totalRides).toFixed(1) : "0";

  const handleAddRide = async () => {
    if (!session?.user) return;

    if (!distance || !duration) {
      Alert.alert("Validation Error", "Please enter both distance and duration.");
      return;
    }

    setModalVisible(false);
    setSubmitting(true);

    const { error } = await supabase.from("logs").insert({
      user_id: session.user.id,
      distance: parseFloat(distance),
      duration: parseInt(duration),
      notes: notes || null,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert("Error", error.message);
      setModalVisible(true);
      return;
    }

    setDistance("");
    setDuration("");
    setNotes("");
    fetchLogs();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>

      <ImageBackground style={styles.headerImage} source={headerImage}>
        <Text style={styles.headerText}>TrailLedger</Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome back, <Text style={styles.bold}>{username}</Text>
          </Text>
          <Text style={styles.welcomeSubtext}>Ready for your next ride?</Text>
        </View>

        <View style={styles.statsRow}>

          <View style={[styles.statCard, { backgroundColor: "#111827" }]}>
            <Text style={styles.statValue}>{totalMiles.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total Miles</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#374151" }]}>
            <Text style={styles.statValue}>{totalRides}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#111827" }]}>
            <Text style={styles.statValue}>{avgMiles}</Text>
            <Text style={styles.statLabel}>Avg Miles</Text>
          </View>

        </View>

        <TouchableOpacity style={styles.trackButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.trackButtonText}>+ Log a Ride</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent Rides</Text>

        {logs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No rides logged yet.</Text>
            <Text style={styles.emptySubtext}>Hit "Log a Ride" to get started!</Text>
          </View>
        ) : (
          logs.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.rideCard}>
              <View style={styles.rideCardLeft}>
                <Text style={styles.rideDistance}>{item.distance} miles</Text>
                <Text style={styles.rideDuration}>{item.duration} min</Text>
              </View>

              <View style={styles.rideCardRight}>
                {item.notes ? (
                  <Text style={styles.rideNotes}>{item.notes}</Text>
                ) : null}
                <Text style={styles.rideDate}>{formatDate(item.created_at)}</Text>
              </View>
            </View>
          ))
        )}

      </ScrollView >

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log a Ride</Text>

            <Text style={styles.inputLabel}>Distance (miles)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter distance (eg 5.2)"
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
            />

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duration (eg 30)"
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
            />

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="How was the ride?"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddRide} disabled={submitting}>
              <Text style={styles.submitButtonText}>{submitting ? "Saving..." : "Save Ride"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerImage: {
    width: "100%",
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Welcome
  welcomeContainer: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    color: "#111827",
  },
  welcomeSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  bold: {
    fontWeight: "bold",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
   statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "#d1d5db",
    marginTop: 2,
  },

  // Track Button
  trackButton: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  trackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Recent Rides
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
   emptyText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rideCardLeft: {
    gap: 4,
  },
  rideCardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  rideDistance: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  rideDuration: {
    fontSize: 13,
    color: "#6b7280",
  },
  rideNotes: {
    fontSize: 13,
    color: "#374151",
    maxWidth: 180,
    textAlign: "right",
  },
  rideDate: {
    fontSize: 12,
    color: "#9ca3af",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cancelButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 15,
  },
});