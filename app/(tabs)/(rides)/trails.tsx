import { useContext, useEffect, useState } from "react";
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

type Trail = {
  id: string;
  name: string;
  location: string;
  difficulty: string;
  created_at: string;
};

export default function Trails() {
  const context = useContext(AuthContext);
  const session = context?.session;

  const [trails, setTrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTrails = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("trails")
      .select("id, name, location, difficulty")
      .order("name", { ascending: true });

    if (error) {
      if (Platform.OS === "web") {
        window.alert("Fetch Error: " + error.message);
      } else {
        Alert.alert("FETCH ERROR:", error.message);
      }
      setLoading(false);
      return;
    }

    setTrails(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrails();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "#16a34a";
      case "Moderate": return "#d97706";
      case "Hard": return "#dc2626";
      default: return "#6b7280";
    }
  };

  const handleTrailPress = (trail: Trail) => {
    setSelectedTrail(trail);
    setModalVisible(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <View style={styles.container}>

      {loading ? (
        <Text>Loading trails...</Text>
      ) : trails.length === 0 ? (
        <Text>No trails found.</Text>
      ) : (
        <FlatList
          data={trails}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleTrailPress(item)}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                  <Text style={styles.badgeText}>{item.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.detail}>{item.location}</Text>
              <Text style={styles.tapHint}>Tap for details →</Text>
            </TouchableOpacity>

          )}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* Difficulty Badge */}
            {selectedTrail && (
              <View style={[
                styles.modalBadge,
                { backgroundColor: getDifficultyColor(selectedTrail.difficulty) }
              ]}>
                <Text style={styles.badgeText}>{selectedTrail.difficulty}</Text>
              </View>
            )}
            {/* Trail Name */}
            <Text style={styles.modalTitle}>{selectedTrail?.name}</Text>

            {/* Details */}
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Location</Text>
              <Text style={styles.modalValue}>{selectedTrail?.location}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Difficulty</Text>
              <Text style={styles.modalValue}>{selectedTrail?.difficulty}</Text>
            </View>
            <View style={styles.divider} />


            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9fafb",
  },
  status: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
  },

  // Trail Card
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  detail: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 6,
  },
  tapHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
   modalBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  modalValue: {
    fontSize: 14,
    color: "#111827",
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
  closeButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});