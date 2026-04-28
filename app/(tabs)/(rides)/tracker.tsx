import { useRideTracker } from "@/services/useRideTracker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapComponent from "../../../components/MapComponent";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function Tracker() {
  const { coords, distance, duration, isTracking, startRide, stopRide } = useRideTracker();
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (coords.length > 0 && !region) {
      setRegion({
        latitude: coords[0].latitude,
        longitude: coords[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [coords]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStop = async () => {
    const rideData = await stopRide();
    router.push({
      pathname: "/(tabs)/(rides)/summary" as any,
      params: {
        distance: rideData.distance.toFixed(2),
        duration: rideData.duration.toString(),
        coords: JSON.stringify(rideData.coords),
      },
    });
  };

  return (
    <View style={styles.container}>

      <MapComponent coords={coords} region={region} />

      <View style={styles.statsContainer}>
        <Text style={styles.statText}>{distance.toFixed(2)} mi</Text>
        <Text style={styles.statText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        {!isTracking ? (
          <TouchableOpacity style={styles.startButton} onPress={startRide}>
            <Text style={styles.buttonText}>Start Ride</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.buttonText}>Stop Ride</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsContainer: {
    position: "absolute", top: 60, alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.75)", padding: 14,
    borderRadius: 14, alignItems: "center", gap: 4,
  },
  statText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  controls: {
    position: "absolute", bottom: 40,
    width: "100%", alignItems: "center",
  },
  startButton: {
    backgroundColor: "#16a34a", paddingVertical: 14,
    paddingHorizontal: 40, borderRadius: 30,
  },
  stopButton: {
    backgroundColor: "#dc2626", paddingVertical: 14,
    paddingHorizontal: 40, borderRadius: 30,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});