import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AuthContext } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

type Trail = {
  id: string;
  name: string;
  difficulty: string;
  location: string;
};

export default function Rides() {
  const context = useContext(AuthContext);
  const session = context?.session;

  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [trails, setTrails] = useState<Trail[]>([]);

  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [detailModal, setDetailModal] = useState(false);

  const [logModal, setLogModal] = useState(false);
  const [costModal, setCostModal] = useState(false);

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);

  const [costs, setCosts] = useState<Record<string, string>>({});

  const costCategories = ["fuel", "food", "gear", "maintenance", "entry", "other"];

  // ---------------- FETCH RIDES ----------------
  const fetchRides = async () => {
    if (!session?.user) return;

    const { data } = await supabase
      .from("logs")
      .select("*, trails(*)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setRides(data || []);
    setLoading(false);
  };

  // ---------------- FETCH TRAILS ----------------
  const fetchTrails = async () => {
    const { data } = await supabase
      .from("trails")
      .select("id, name, difficulty, location");

    setTrails(data || []);
  };

  useEffect(() => {
    fetchRides();
    fetchTrails();
  }, []);

  // ---------------- LOG FLOW ----------------
  const startLog = () => {
    setDistance("");
    setDuration("");
    setSelectedTrail(null);
    setLogModal(true);
  };

  const goToCosts = () => {
    setLogModal(false);
    setCostModal(true);
  };

  const submitRide = async () => {
    if (!session?.user) return;

    const formattedCosts = Object.fromEntries(
      Object.entries(costs).map(([k, v]) => [k, parseFloat(v || "0")])
    );

    await supabase.from("logs").insert({
      user_id: session.user.id,
      distance: parseFloat(distance),
      duration: parseInt(duration),
      trail_id: selectedTrail?.id || null,
      costs: formattedCosts,
    });

    setCostModal(false);
    setCosts({});
    fetchRides();
  };

  // ---------------- COST SAFE PARSE ----------------
  const getCosts = (ride: any) => {
    if (!ride?.costs) return null;

    return typeof ride.costs === "string"
      ? JSON.parse(ride.costs)
      : ride.costs;
  };

  return (
    <View style={styles.container}>
      {/* LOG BUTTON */}
      <TouchableOpacity style={styles.logButton} onPress={startLog}>
        <Text style={styles.logButtonText}>+ Log Ride</Text>
      </TouchableOpacity>

      {/* LIST */}
      {loading ? (
        <Text>Loading rides...</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedRide(item);
                setDetailModal(true);
              }}
            >
              {/* FIXED FORMAT */}
              <Text style={styles.title}>
                {item.distance} miles
              </Text>

              <Text style={styles.sub}>
                {item.duration} min
              </Text>

              <Text style={styles.detail}>
                {item.trails?.name || "No trail selected"}
              </Text>

              <Text style={styles.tapHint}>Tap for details →</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ---------------- DETAIL MODAL ---------------- */}
      <Modal visible={detailModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>

            <Text style={styles.modalTitle}>
              Ride Details
            </Text>

            <Text>Distance: {selectedRide?.distance} miles</Text>
            <Text>Duration: {selectedRide?.duration} minutes</Text>

            {/* TRAIL */}
            {selectedRide?.trails && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Trail</Text>
                <Text>{selectedRide.trails.name}</Text>
                <Text>{selectedRide.trails.location}</Text>
                <Text>{selectedRide.trails.difficulty}</Text>
              </View>
            )}

            {/* COSTS */}
            {getCosts(selectedRide) &&
              Object.keys(getCosts(selectedRide)).length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Costs</Text>

                  {Object.entries(getCosts(selectedRide)).map(
                    ([k, v]) => (
                      <Text key={k}>
                        {k}: ${Number(v).toFixed(2)}
                      </Text>
                    )
                  )}
                </View>
              )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* ---------------- LOG MODAL ---------------- */}
      <Modal visible={logModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>

            <Text style={styles.modalTitle}>Log Ride</Text>

            <TextInput
              placeholder="Distance"
              value={distance ?? ""}
              onChangeText={setDistance}
              style={styles.input}
            />

            <TextInput
              placeholder="Duration"
              value={duration ?? ""}
              onChangeText={setDuration}
              style={styles.input}
            />

            <Text style={styles.label}>Trail</Text>

            {trails.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.trail,
                  selectedTrail?.id === t.id && styles.trailSelected,
                ]}
                onPress={() => setSelectedTrail(t)}
              >
                <Text>{t.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.button} onPress={goToCosts}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* ---------------- COST MODAL ---------------- */}
      <Modal visible={costModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>

            <Text style={styles.modalTitle}>Costs</Text>

            {costCategories.map((c) => (
              <TextInput
                key={c}
                placeholder={c}
                value={costs[c] ?? ""}
                onChangeText={(v) =>
                  setCosts((p) => ({ ...p, [c]: v }))
                }
                style={styles.input}
              />
            ))}

            <TouchableOpacity style={styles.button} onPress={submitRide}>
              <Text style={styles.buttonText}>Save Ride</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f9fafb" },

  header: { fontSize: 22, fontWeight: "800", marginBottom: 10 },

  logButton: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  logButtonText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  title: { fontWeight: "700", fontSize: 15 },
  sub: { color: "#6b7280" },
  detail: { marginTop: 4, color: "#374151" },
  tapHint: { marginTop: 6, fontSize: 11, color: "#9ca3af" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  label: { fontWeight: "700", marginTop: 10 },

  trail: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginTop: 6,
  },

  trailSelected: {
    backgroundColor: "#d1fae5",
    borderColor: "#16a34a",
  },

  button: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },

  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  closeButton: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },

  closeText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});