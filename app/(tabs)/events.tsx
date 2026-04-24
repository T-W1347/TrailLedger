import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select('id, title, date, trails ( name )')
      .order("date", { ascending: true });


    if (error) {
      Alert.alert("Fetch error", error.message);
      setLoading(false);
      return;
    }

    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Events</Text>

      {loading ? (
        <Text>Loading events...</Text>
      ) : events.length === 0 ? (
        <Text>No upcoming events.</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{item.trails?.name ?? "No trail linked"}</Text>
              <Text style={styles.detail}>{formatDate(item.date)}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detail: {
    color: "#6b7280",
    marginBottom: 4,
  },
});