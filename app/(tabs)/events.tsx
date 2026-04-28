import { useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { AuthContext } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

type Event = {
  id: string;
  title: string;
  date: string;
  trail_id: string;
  trails?: {
    name: string;
    location: string;
    difficulty: string;
  };
  attendee_count?: number;
};

export default function Events() {
  const context = useContext(AuthContext);
  const session = context?.session;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAttending, setIsAttending] = useState(false);

  // ---------------- FETCH EVENTS ----------------
  const fetchEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        date,
        trail_id,
        trails (
          name,
          location,
          difficulty
        ),
        event_attendees (id)
      `)
      .order("date", { ascending: true });

    if (error) {
      if (Platform.OS === "web") {
        window.alert(error.message);
      } else {
        Alert.alert("Error", error.message);
      }
      setLoading(false);
      return;
    }

    const formatted =
      data?.map((e: any) => ({
        ...e,
        attendee_count: e.event_attendees?.length || 0,
      })) || [];

    setEvents(formatted);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ---------------- SELECT EVENT ----------------
  const handlePress = async (event: Event) => {
    setSelectedEvent(event);
    setModalVisible(true);

    if (!session?.user) return;

    const { data } = await supabase
      .from("event_attendees")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", session.user.id)
      .maybeSingle();

    setIsAttending(!!data);
  };

  // ---------------- JOIN EVENT ----------------
  const handleJoin = async () => {
    if (!session?.user || !selectedEvent) return;

    const { error } = await supabase.from("event_attendees").insert({
      user_id: session.user.id,
      event_id: selectedEvent.id,
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setIsAttending(true);

    setSelectedEvent((prev: any) => ({
      ...prev,
      attendee_count: (prev.attendee_count || 0) + 1,
    }));
  };

  // ---------------- LEAVE EVENT ----------------
  const handleLeave = async () => {
    if (!session?.user || !selectedEvent) return;

    const { error } = await supabase
      .from("event_attendees")
      .delete()
      .eq("user_id", session.user.id)
      .eq("event_id", selectedEvent.id);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setIsAttending(false);

    setSelectedEvent((prev: any) => ({
      ...prev,
      attendee_count: Math.max((prev.attendee_count || 1) - 1, 0),
    }));
  };

  // ---------------- HELPERS ----------------
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "#16a34a";
      case "Moderate":
        return "#d97706";
      case "Hard":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  // ---------------- UI ----------------
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Events</Text>

      {loading ? (
        <Text>Loading events...</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handlePress(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>

                {item.trails && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: getDifficultyColor(
                          item.trails.difficulty
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.trails.difficulty}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.detail}>{formatDate(item.date)}</Text>
              <Text style={styles.detail}>
                {item.trails?.name || "No trail assigned"}
              </Text>

              <Text style={styles.tapHint}>
                👥 {item.attendee_count} going • Tap for details
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ---------------- MODAL ---------------- */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedEvent?.title}
            </Text>

            <Text style={styles.modalRow}>
              📅 {selectedEvent ? formatDate(selectedEvent.date) : ""}
            </Text>

            {selectedEvent?.trails && (
              <>
                <Text style={styles.modalRow}>
                  📍 {selectedEvent.trails.name}
                </Text>
                <Text style={styles.modalRow}>
                  {selectedEvent.trails.location}
                </Text>

                <View
                  style={[
                    styles.modalBadge,
                    {
                      backgroundColor: getDifficultyColor(
                        selectedEvent.trails.difficulty
                      ),
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {selectedEvent.trails.difficulty}
                  </Text>
                </View>
              </>
            )}

            <Text style={styles.modalRow}>
              👥 {selectedEvent?.attendee_count} attending
            </Text>

            {/* JOIN / LEAVE BUTTON */}
            <TouchableOpacity
              style={[
                styles.joinButton,
                isAttending && { backgroundColor: "#dc2626" },
              ]}
              onPress={isAttending ? handleLeave : handleJoin}
            >
              <Text style={styles.joinButtonText}>
                {isAttending ? "Leave Event" : "Join Event"}
              </Text>
            </TouchableOpacity>

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

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9fafb",
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },

  detail: {
    fontSize: 13,
    color: "#6b7280",
  },

  tapHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  modalRow: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },

  modalBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginVertical: 8,
  },

  joinButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  joinButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  closeButton: {
    marginTop: 10,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});