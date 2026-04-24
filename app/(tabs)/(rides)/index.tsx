import { useContext, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

export default function Rides() {

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("SESSION CHECK:", data.session);
    };

    check();
  }, []);

  const context = useContext(AuthContext);
  const session = context?.session;

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);

    if (!session?.user) {
      console.log("NO SESSION - skipping fetch");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", {ascending: false});


    if (error) {
      console.log("FETCH ERROR:", error);
      setLoading(false);
      return;
    }

    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user) {
      fetchLogs();
    }
  }, [session]);

  const createQuickRide = async () => {
    if (!session?.user) return;

    const { error } = await supabase.from("logs").insert({
      user_id: session.user.id,
      distance: 5,
      duration: 25,
      notes: "Quick Ride",
    });

    if (error) {
      Alert.alert("Insert error", error.message);
      return;
    }

    fetchLogs(); // refresh
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>

      <TouchableOpacity style={styles.button} onPress={createQuickRide}>
        <Text style={styles.buttonText}>+ Add Ride</Text>
      </TouchableOpacity>

      {loading ? (
        <Text>Loading rides...</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.distance} miles</Text>
              <Text>{item.duration} min</Text>
              <Text>{item.notes}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  card: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
});